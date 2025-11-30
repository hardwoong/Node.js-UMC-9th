import { StatusCodes } from "http-status-codes";
import { bodyToMission, bodyToMissionSuccess } from "../dtos/mission.dto.js";
import { missionAdd, missionChallenge, missionSuccessRequest, missionSuccessConfirm, getMyOngoingMissionList, getStoreMissionList } from "../services/mission.service.js";
import { ValidationError } from "../errors/custom-error.js";

export const handleMissionAdd = async (req, res, next) => {
  /*
    #swagger.tags = ['Missions']
    #swagger.summary = '미션 추가 API';
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["storeId", "region", "missionMoney", "missionPoint"],
            properties: {
              storeId: { type: "number", example: 1 },
              region: { type: "string", enum: ["SEOUL", "BUSAN", "DAEGU", "INCHEON", "GWANGJU", "DAEJEON", "ULSAN", "GYEONGGI", "GANGWON", "CHUNGBUK", "CHUNGNAM", "JEONBUK", "JEONNAM", "GYEONGBUK", "GYEONGNAM", "JEJU"], example: "SEOUL" },
              missionMoney: { type: "number", example: 10000 },
              missionPoint: { type: "number", example: 100 }
            }
          }
        }
      }
    };
    #swagger.responses[201] = {
      description: "미션 추가 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 201 },
              message: { type: "string", example: "미션이 성공적으로 추가되었습니다." },
              data: {
                type: "object",
                properties: {
                  missionId: { type: "number", example: 1 },
                  storeId: { type: "number", example: 1 },
                  region: { type: "string", example: "SEOUL" },
                  missionMoney: { type: "number", example: 10000 },
                  missionPoint: { type: "number", example: 100 },
                  createdAt: { type: "string", format: "date-time" }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "미션 추가 실패 응답",
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
    console.log("미션 추가를 요청했습니다!");
    console.log("body:", req.body);

    const mission = await missionAdd(bodyToMission(req.body));
    
    res.status(StatusCodes.CREATED).json({
      statusCode: 201,
      message: "미션이 성공적으로 추가되었습니다.",
      data: mission
    });
  } catch (err) {
    next(err);
  }
};

export const handleMissionChallenge = async (req, res, next) => {
  /*
    #swagger.tags = ['Missions']
    #swagger.summary = '미션 도전 API';
    #swagger.parameters['missionId'] = {
      in: 'path',
      required: true,
      type: 'number',
      description: '미션 ID'
    };
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["userId"],
            properties: {
              userId: { type: "number", example: 1 }
            }
          }
        }
      }
    };
    #swagger.responses[201] = {
      description: "미션 도전 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 201 },
              message: { type: "string", example: "미션 도전이 성공적으로 시작되었습니다." },
              data: {
                type: "object",
                properties: {
                  challengeMissionId: { type: "number", example: 1 },
                  message: { type: "string", example: "미션 도전이 시작되었습니다." }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "미션 도전 실패 응답 (유효성 검증 실패)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 400 },
              message: { type: "string", example: "사용자 ID는 필수입니다." },
              error: { type: "string", example: "VALIDATION_ERROR" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[409] = {
      description: "미션 도전 실패 응답 (이미 도전 중)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 409 },
              message: { type: "string", example: "이미 도전 중인 미션입니다." },
              error: { type: "string", example: "MISSION_ALREADY_CHALLENGED" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
  */
  try {
    console.log("미션 도전을 요청했습니다!");
    console.log("params:", req.params);
    console.log("body:", req.body);

    const { missionId } = req.params;
    const userId = Number(req.user.userId);

    const result = await missionChallenge({
      userId: userId,
      missionId: parseInt(missionId)
    });
    
    res.status(StatusCodes.CREATED).json({
      statusCode: 201,
      message: "미션 도전이 성공적으로 시작되었습니다.",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const handleMissionSuccessRequest = async (req, res, next) => {
  /*
    #swagger.tags = ['Missions']
    #swagger.summary = '미션 성공 요청 API';
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["challengeMissionId", "userId"],
            properties: {
              challengeMissionId: { type: "number", example: 1 },
              userId: { type: "number", example: 1 }
            }
          }
        }
      }
    };
    #swagger.responses[200] = {
      description: "미션 성공 요청 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 200 },
              message: { type: "string", example: "미션 성공 요청이 완료되었습니다." },
              data: {
                type: "object",
                properties: {
                  verificationCode: { type: "string", example: "123456" }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "미션 성공 요청 실패 응답 (유효성 검증 실패)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 400 },
              message: { type: "string", example: "challengeMissionId와 userId는 필수입니다." },
              error: { type: "string", example: "VALIDATION_ERROR" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[403] = {
      description: "미션 성공 요청 실패 응답 (권한 없음)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 403 },
              message: { type: "string", example: "자신의 미션만 완료할 수 있습니다." },
              error: { type: "string", example: "FORBIDDEN" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
    #swagger.responses[409] = {
      description: "미션 성공 요청 실패 응답 (잘못된 미션 상태)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 409 },
              message: { type: "string", example: "진행 중인 미션만 완료할 수 있습니다." },
              error: { type: "string", example: "INVALID_MISSION_STATUS" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
  */
  try {
    console.log("미션 성공 요청을 받았습니다!");
    console.log("body:", req.body);

    // 필수 필드 검증
    if (!req.body.challengeMissionId) {
      throw new ValidationError("challengeMissionId는 필수입니다.");
    }

    const userId = Number(req.user.userId);
    const result = await missionSuccessRequest({
      ...bodyToMissionSuccess(req.body),
      userId: userId
    });
    
    res.status(StatusCodes.OK).json({
      statusCode: 200,
      message: "미션 성공 요청이 완료되었습니다.",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const handleMissionSuccessConfirm = async (req, res, next) => {
  /*
    #swagger.tags = ['Missions']
    #swagger.summary = '미션 성공 확정 API';
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["verificationCode", "userId"],
            properties: {
              verificationCode: { type: "string", example: "123456" },
              userId: { type: "number", example: 1 }
            }
          }
        }
      }
    };
    #swagger.responses[200] = {
      description: "미션 성공 확정 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 200 },
              message: { type: "string", example: "미션 성공이 확정되었습니다." },
              data: {
                type: "object",
                properties: {
                  challengeMissionId: { type: "number", example: 1 },
                  missionMoney: { type: "number", example: 10000 },
                  missionPoint: { type: "number", example: 100 }
                }
              }
            }
          }
        }
      }
    };
    #swagger.responses[400] = {
      description: "미션 성공 확정 실패 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 400 },
              message: { type: "string", example: "유효하지 않은 인증 코드입니다." },
              error: { type: "string", example: "INVALID_VERIFICATION_CODE" },
              data: { type: "object", nullable: true, example: null }
            }
          }
        }
      }
    };
  */
  try {
    console.log("미션 성공 확정을 요청했습니다!");
    console.log("body:", req.body);

    // 필수 필드 검증
    if (!req.body.verificationCode) {
      throw new ValidationError("verificationCode는 필수입니다.");
    }

    const userId = Number(req.user.userId);
    const result = await missionSuccessConfirm({
      verificationCode: req.body.verificationCode,
      userId: userId
    });
    
    res.status(StatusCodes.OK).json({
      statusCode: 200,
      message: "미션 성공이 확정되었습니다.",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetMyOngoingMissions = async (req, res, next) => {
  /*
    #swagger.tags = ['Missions']
    #swagger.summary = '진행 중인 미션 목록 조회 API';
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
      description: "진행 중인 미션 목록 조회 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 200 },
              message: { type: "string", example: "진행 중인 미션 목록 조회에 성공했습니다." },
              data: {
                type: "object",
                properties: {
                  missions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        challengeMissionId: { type: "number", example: 1 },
                        missionId: { type: "number", example: 1 },
                        storeId: { type: "number", example: 1 },
                        storeName: { type: "string", example: "맛있는 식당" },
                        storeAddress: { type: "string", example: "서울시 강남구" },
                        region: { type: "string", example: "SEOUL" },
                        missionMoney: { type: "number", example: 10000 },
                        missionPoint: { type: "number", example: 100 },
                        status: { type: "string", example: "IN_PROGRESS" },
                        challengeAt: { type: "string", format: "date-time" },
                        limitedAt: { type: "string", format: "date-time" },
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

    const result = await getMyOngoingMissionList(userId, cursor);

    res.status(StatusCodes.OK).json({
      statusCode: 200,
      message: "진행 중인 미션 목록 조회에 성공했습니다.",
      data: {
        missions: result.missions,
        pagination: result.pagination
      }
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetStoreMissions = async (req, res, next) => {
  /*
    #swagger.tags = ['Missions']
    #swagger.summary = '가게 미션 목록 조회 API';
    #swagger.parameters['storeId'] = {
      in: 'path',
      required: true,
      type: 'number',
      description: '가게 ID'
    };
    #swagger.parameters['cursor'] = {
      in: 'query',
      type: 'number',
      description: '페이지네이션 커서 (선택사항)',
      required: false
    };
    #swagger.responses[200] = {
      description: "가게 미션 목록 조회 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              statusCode: { type: "number", example: 200 },
              message: { type: "string", example: "가게 미션 목록 조회에 성공했습니다." },
              data: {
                type: "object",
                properties: {
                  missions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        missionId: { type: "number", example: 1 },
                        storeId: { type: "number", example: 1 },
                        storeName: { type: "string", example: "맛있는 식당" },
                        storeAddress: { type: "string", example: "서울시 강남구" },
                        region: { type: "string", example: "SEOUL" },
                        missionMoney: { type: "number", example: 10000 },
                        missionPoint: { type: "number", example: 100 },
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
    const storeId = req.params.storeId;
    const cursor = req.query.cursor;

    const result = await getStoreMissionList(storeId, cursor);

    res.status(StatusCodes.OK).json({
      statusCode: 200,
      message: "가게 미션 목록 조회에 성공했습니다.",
      data: {
        missions: result.missions,
        pagination: result.pagination
      }
    });
  } catch (err) {
    next(err);
  }
};