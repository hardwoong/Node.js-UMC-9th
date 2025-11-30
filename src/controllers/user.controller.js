import { StatusCodes } from "http-status-codes";
import { bodyToUserSignup } from "../dtos/user.dto.js";
import { userSignup, userUpdate } from "../services/user.service.js";
import { ValidationError, InvalidEmailFormatError, PasswordTooShortError } from "../errors/custom-error.js";

export const handleUserSignup = async (req, res, next) => {
  /*
    #swagger.tags = ['Users']
    #swagger.summary = '회원가입 API';
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "gender", "email", "password"],
            properties: {
              name: { type: "string", example: "홍길동" },
              gender: { type: "string", enum: ["M", "F", "NONE"], example: "M" },
              email: { type: "string", format: "email", example: "test@example.com" },
              password: { type: "string", minLength: 8, example: "password123" },
              birth: { type: "string", format: "date", example: "1990-01-01" },
              address: { type: "string", example: "서울시 강남구" },
              phone: { type: "string", example: "010-1234-5678" },
              preferences: { type: "array", items: { type: "number" }, example: [1, 3, 6] }
            }
          }
        }
      }
    };
    #swagger.responses[201] = {
      description: "회원가입 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 201 },
              message: { type: "string", example: "회원가입이 성공적으로 완료되었습니다." },
              data: {
                type: "object",
                properties: {
                  userId: { type: "number", example: 1 },
                  name: { type: "string", example: "홍길동" },
                  email: { type: "string", example: "test@example.com" },
                  userStatus: { type: "string", example: "ACTIVE" },
                  userType: { type: "string", example: "GENERAL" },
                  createdAt: { type: "string", format: "date-time" }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "회원가입 실패 응답 (유효성 검증 실패)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 400 },
              message: { type: "string", example: "이름, 성별, 이메일, 비밀번호는 필수 항목입니다." },
              error: { type: "string", example: "VALIDATION_ERROR" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[409] = {
      description: "회원가입 실패 응답 (이메일 중복)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 409 },
              message: { type: "string", example: "이미 존재하는 이메일입니다." },
              error: { type: "string", example: "EMAIL_ALREADY_EXISTS" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
  */
  try {
    console.log("회원가입을 요청했습니다!");
    console.log("body:", req.body);

    // 필수 필드 검증
    if (!req.body.name || !req.body.gender || !req.body.email || !req.body.password) {
      throw new ValidationError("이름, 성별, 이메일, 비밀번호는 필수 항목입니다.");
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      throw new InvalidEmailFormatError();
    }

    // 비밀번호 길이 검증
    if (req.body.password.length < 8) {
      throw new PasswordTooShortError();
    }

    const user = await userSignup(bodyToUserSignup(req.body));
    
    res.status(StatusCodes.CREATED).json({
      statusCode: 201,
      message: "회원가입이 성공적으로 완료되었습니다.",
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const handleUserUpdate = async (req, res, next) => {
  /*
    #swagger.tags = ['Users']
    #swagger.summary = '사용자 정보 수정 API';
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string", example: "홍길동" },
              gender: { type: "string", enum: ["NONE", "MALE", "FEMALE"], example: "MALE" },
              birth: { type: "string", format: "date", example: "1990-01-01" },
              address: { type: "string", example: "서울시 강남구" },
              phone: { type: "string", example: "010-1234-5678" },
              preferences: { type: "array", items: { type: "number" }, example: [1, 3, 6] }
            }
          }
        }
      }
    };
    #swagger.responses[200] = {
      description: "사용자 정보 수정 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 200 },
              message: { type: "string", example: "사용자 정보가 성공적으로 수정되었습니다." },
              data: {
                type: "object",
                properties: {
                  userId: { type: "number", example: 1 },
                  name: { type: "string", example: "홍길동" },
                  email: { type: "string", example: "test@example.com" },
                  gender: { type: "string", example: "MALE" },
                  birth: { type: "string", format: "date", example: "1990-01-01" },
                  address: { type: "string", example: "서울시 강남구" },
                  phone: { type: "string", example: "010-1234-5678" },
                  userStatus: { type: "string", example: "ACTIVE" },
                  userType: { type: "string", example: "GENERAL" },
                  updatedAt: { type: "string", format: "date-time" }
                }
              }
            }
          }
        }
      }
    };
  */
  try {
    console.log("사용자 정보 수정을 요청했습니다!");
    console.log("body:", req.body);

    const userId = Number(req.user.userId);
    const user = await userUpdate(userId, req.body);
    
    res.status(StatusCodes.OK).json({
      statusCode: 200,
      message: "사용자 정보가 성공적으로 수정되었습니다.",
      data: user
    });
  } catch (err) {
    next(err);
  }
};
