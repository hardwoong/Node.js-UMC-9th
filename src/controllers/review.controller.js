import { StatusCodes } from "http-status-codes";
import multer from "multer";
import { formDataToReview } from "../dtos/review.dto.js";
import { reviewAdd, getMyReviewList } from "../services/review.service.js";
import { ValidationError } from "../errors/custom-error.js";

// multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

export const handleReviewAdd = async (req, res, next) => {
  /*
    #swagger.tags = ['Reviews']
    #swagger.summary = '리뷰 추가 API (multipart/form-data - 이미지 포함)';
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["rating", "content", "challengeMissionId"],
            properties: {
              rating: { type: "number", example: 5, description: "별점 (1-5)" },
              content: { type: "string", example: "맛있어요!" },
              challengeMissionId: { type: "number", example: 1 },
              images: { 
                type: "array",
                items: { type: "string", format: "binary" },
                description: "이미지 파일 (최대 5개)"
              }
            }
          }
        }
      }
    };
    #swagger.responses[201] = {
      description: "리뷰 추가 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 201 },
              message: { type: "string", example: "리뷰가 성공적으로 등록되었습니다." },
              data: {
                type: "object",
                properties: {
                  reviewId: { type: "number", example: 1 },
                  storeName: { type: "string", example: "맛있는 식당" }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "리뷰 추가 실패 응답 (유효성 검증 실패 또는 완료된 미션 없음)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 400 },
              message: { type: "string", example: "별점과 리뷰 내용은 필수 항목입니다." },
              error: { type: "string", example: "VALIDATION_ERROR", description: "VALIDATION_ERROR 또는 MISSION_NOT_COMPLETED" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
  */
  try {
    console.log("리뷰 추가를 요청했습니다!");
    console.log("body:", req.body);
    console.log("files:", req.files);

    // 필수 필드 검증
    if (!req.body.rating || !req.body.content) {
      throw new ValidationError("별점과 리뷰 내용은 필수 항목입니다.");
    }

    const review = await reviewAdd(formDataToReview(req.body, req.files));
    
    res.status(StatusCodes.CREATED).json({
      statusCode: 201,
      message: "리뷰가 성공적으로 등록되었습니다.",
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// multer 미들웨어를 export
export const uploadMiddleware = upload.array('images', 5); // 최대 5개 파일

export const handleGetMyReviews = async (req, res, next) => {
  /*
    #swagger.tags = ['Reviews']
    #swagger.summary = '내 리뷰 목록 조회 API';
    #swagger.parameters['userId'] = {
      in: 'path',
      required: true,
      type: 'number',
      description: '사용자 ID'
    };
    #swagger.parameters['cursor'] = {
      in: 'query',
      type: 'number',
      description: '페이지네이션 커서 (선택사항)',
      required: false
    };
    #swagger.responses[200] = {
      description: "내 리뷰 목록 조회 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 200 },
              message: { type: "string", example: "내 리뷰 목록 조회에 성공했습니다." },
              data: {
                type: "object",
                properties: {
                  reviews: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        reviewId: { type: "number", example: 1 },
                        storeName: { type: "string", example: "맛있는 식당" },
                        storeAddress: { type: "string", example: "서울시 강남구" },
                        reviewText: { type: "string", example: "맛있어요!" },
                        score: { type: "number", example: 5 },
                        images: { type: "array", items: { type: "string" }, example: ["image1.jpg"] },
                        createdAt: { type: "string", format: "date-time" }
                      }
                    }
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      cursor: { type: "number", nullable: true, example: 10 }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  */
  try {
    const userId = Number(req.user.userId);
    const cursor = req.query.cursor;

    const result = await getMyReviewList(userId, cursor);

    res.status(StatusCodes.OK).json({
      statusCode: 200,
      message: "내 리뷰 목록 조회에 성공했습니다.",
      data: {
        reviews: result.reviews,
        pagination: result.pagination
      }
    });
  } catch (err) {
    next(err);
  }
};
