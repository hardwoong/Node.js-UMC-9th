import { StatusCodes } from "http-status-codes";
import { bodyToStore } from "../dtos/store.dto.js";
import { storeAdd } from "../services/store.service.js";

export const handleStoreAdd = async (req, res, next) => {
  /*
    #swagger.tags = ['Stores']
    #swagger.summary = '가게 추가 API';
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["storeName", "storeAddress", "storeType"],
            properties: {
              storeName: { type: "string", example: "맛있는 식당" },
              storeAddress: { type: "string", example: "서울시 강남구 테헤란로 123" },
              storeType: { type: "string", enum: ["KOREAN", "CHINESE", "JAPANESE", "WESTERN", "CHICKEN", "SNACK", "MEAT", "DOSIRAK", "YASICK", "DESSERT", "FAST_FOOD", "ASIAN", "ETC"], example: "KOREAN" },
              region: { type: "string", example: "서울" }
            }
          }
        }
      }
    };
    #swagger.responses[201] = {
      description: "가게 추가 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 201 },
              message: { type: "string", example: "가게가 성공적으로 추가되었습니다." },
              data: {
                type: "object",
                properties: {
                  storeId: { type: "number", example: 1 },
                  storeName: { type: "string", example: "맛있는 식당" },
                  storeAddress: { type: "string", example: "서울시 강남구 테헤란로 123" },
                  storeType: { type: "string", example: "KOREAN" },
                  storeScore: { type: "number", nullable: true, example: null },
                  createdAt: { type: "string", format: "date-time" }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "가게 추가 실패 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 400 },
              message: { type: "string", example: "존재하지 않는 가게입니다." },
              error: { type: "string", example: "STORE_NOT_FOUND" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
  */
  try {
    console.log("가게 추가를 요청했습니다!");
    console.log("body:", req.body);

    const store = await storeAdd(bodyToStore(req.body));
    
    res.status(StatusCodes.CREATED).json({
      statusCode: 201,
      message: "가게가 성공적으로 추가되었습니다.",
      data: store
    });
  } catch (err) {
    next(err);
  }
};
