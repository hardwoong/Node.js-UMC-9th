import { StatusCodes } from "http-status-codes";
import { bodyToReviewJson } from "../dtos/review-json.dto.js";
import { reviewAddJson } from "../services/review-json.service.js";
import { ValidationError } from "../errors/custom-error.js";

export const handleReviewAddJson = async (req, res, next) => {
  /*
    #swagger.tags = ['Reviews']
    #swagger.summary = '리뷰 추가 API (application/json - 텍스트만)';
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["rating", "content", "challengeMissionId"],
            properties: {
              rating: { type: "number", example: 5, description: "별점 (1-5)" },
              content: { type: "string", example: "맛있어요!" },
              challengeMissionId: { type: "number", example: 1 }
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
              message: { type: "string", example: "별점, 리뷰 내용, challengeMissionId는 필수 항목입니다." },
              error: { type: "string", example: "VALIDATION_ERROR", description: "VALIDATION_ERROR 또는 MISSION_NOT_COMPLETED" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[403] = {
      description: "리뷰 추가 실패 응답 (권한 없음)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 403 },
              message: { type: "string", example: "자신의 미션에만 리뷰를 작성할 수 있습니다." },
              error: { type: "string", example: "FORBIDDEN" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
  */
  try {
    console.log("리뷰 추가를 요청했습니다! (JSON)");
    console.log("body:", req.body);

    // 필수 필드 검증
    if (!req.body.rating || !req.body.content || !req.body.challengeMissionId) {
      throw new ValidationError("별점, 리뷰 내용, challengeMissionId는 필수 항목입니다.");
    }

    const userId = Number(req.user.userId);
    const review = await reviewAddJson({
      ...bodyToReviewJson(req.body),
      userId: userId
    });
    
    res.status(StatusCodes.CREATED).json({
      statusCode: 201,
      message: "리뷰가 성공적으로 등록되었습니다.",
      data: review
    });
  } catch (err) {
    next(err);
  }
};
