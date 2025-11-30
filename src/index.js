import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerAutogen from "swagger-autogen";
import swaggerUiExpress from "swagger-ui-express";
import passport from "passport";
import { googleStrategy, jwtStrategy } from "./auth.config.js";
import { handleStoreAdd } from "./controllers/store.controller.js";
import { handleReviewAdd, uploadMiddleware, handleGetMyReviews } from "./controllers/review.controller.js";
import { handleReviewAddJson } from "./controllers/review-json.controller.js";
import { 
  handleMissionAdd, 
  handleMissionChallenge, 
  handleMissionSuccessRequest, 
  handleMissionSuccessConfirm, 
  handleGetMyOngoingMissions, 
  handleGetStoreMissions 
} from "./controllers/mission.controller.js";
import { handleUserSignup, handleUserUpdate } from "./controllers/user.controller.js";
import { isLogin } from "./middlewares/auth.middleware.js";

dotenv.config();

// Passport 전략 등록
passport.use(googleStrategy);
passport.use(jwtStrategy);

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Swagger UI 설정
app.use(
  "/docs",
  swaggerUiExpress.serve,
  swaggerUiExpress.setup({}, {
    swaggerOptions: {
      url: "/openapi.json",
    },
  })
);

// Swagger OpenAPI JSON 엔드포인트
app.get("/openapi.json", async (req, res, next) => {
  // #swagger.ignore = true
  const options = {
    openapi: "3.0.0",
    disableLogs: true,
    writeOutputFile: false,
  };
  const outputFile = "/dev/null";
  const routes = ["./src/index.js"];
  const doc = {
    info: {
      title: "UMC 9th Node.js API",
      description: "UMC 9th Node.js 프로젝트 API 문서입니다.",
      version: "1.0.0",
    },
    host: "localhost:3000",
    schemes: ["http"],
  };
  const result = await swaggerAutogen(options)(outputFile, routes, doc);
  res.json(result ? result.data : null);
});

// Google 로그인 라우트
app.get("/oauth2/login/google", 
  passport.authenticate("google", { 
    session: false 
  })
);

app.get(
  "/oauth2/callback/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login-failed",
  }),
  (req, res) => {
    const tokens = req.user; 
    res.status(200).json({
      resultType: "SUCCESS",
      error: null,
      success: {
        message: "Google 로그인 성공!",
        tokens: tokens, // { "accessToken": "...", "refreshToken": "..." }
      }
    });
  }
);

app.get("/", (req, res) => {
  // #swagger.ignore = true
  res.send("Hello World!");
});

// 1-1: 특정 지역에 가게 추가하기 API (인증 필요)
app.post("/api/v1/stores", isLogin, handleStoreAdd);

// 1-2: 가게에 리뷰 추가하기 API (multipart/form-data - 이미지 포함) (인증 필요)
app.post("/api/v1/reviews", isLogin, uploadMiddleware, handleReviewAdd);

// 1-2-2: 가게에 리뷰 추가하기 API (application/json - 텍스트만) (인증 필요)
app.post("/api/v1/reviews/json", isLogin, handleReviewAddJson);

// 1-3: 가게에 미션 추가하기 API (인증 필요)
app.post("/api/v1/missions", isLogin, handleMissionAdd);

// 1-4: 미션 도전하기 API (인증 필요)
app.post("/api/v1/missions/:missionId/challenge", isLogin, handleMissionChallenge);

// 미션 성공 요청 API (인증 필요)
app.post("/api/v1/missions/success/request", isLogin, handleMissionSuccessRequest);

// 미션 성공 확정 API (인증 필요)
app.post("/api/v1/missions/success/confirm", isLogin, handleMissionSuccessConfirm);

// 회원가입 API
app.post("/api/v1/users/signup", handleUserSignup);

// 사용자 정보 수정 API (인증 필요)
app.put("/api/v1/users/me", isLogin, handleUserUpdate);

// 마이페이지 API (인증 필요)
app.get("/mypage", isLogin, (req, res) => {
  res.status(200).json({
    statusCode: 200,
    message: `인증 성공! ${req.user.name}님의 마이페이지입니다.`,
    data: {
      user: {
        userId: Number(req.user.userId),
        name: req.user.name,
        email: req.user.email,
        userStatus: req.user.userStatus,
        userType: req.user.userType
      }
    }
  });
});

// 내가 작성한 리뷰 목록 조회 API (인증 필요)
app.get("/api/v1/users/reviews", isLogin, handleGetMyReviews);

// 특정 가게의 미션 목록 조회 API
app.get("/api/v1/stores/:storeId/missions", handleGetStoreMissions);

// 내가 진행 중인 미션 목록 조회 API (인증 필요)
app.get("/api/v1/users/missions/ongoing", isLogin, handleGetMyOngoingMissions);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  // #swagger.ignore = true
  console.error(err);
  
  // 커스텀 에러인 경우
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.errorCode,
      data: null
    });
  }
  
  // 기본 에러 처리
  res.status(500).json({
    statusCode: 500,
    message: "서버 내부 오류가 발생했습니다.",
    error: "INTERNAL_SERVER_ERROR",
    data: null
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
