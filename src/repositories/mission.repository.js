import { prisma } from "../config/prisma.config.js";
import { StoreNotFoundError, MissionNotFoundError, MissionAlreadyChallengedError, ForbiddenError, InvalidMissionStatusError, InvalidVerificationCodeError, InternalServerError } from "../errors/custom-error.js";

export const addMission = async (data) => {
  try {
    // 가게가 존재하는지 확인
    const store = await prisma.store.findUnique({
      where: { storeId: BigInt(data.storeId) }
    });

    if (!store) {
      throw new StoreNotFoundError();
    }

    const mission = await prisma.mission.create({
      data: {
        storeId: BigInt(data.storeId),
        region: data.region,
        missionMoney: BigInt(data.missionMoney),
        missionPoint: BigInt(data.missionPoint)
      }
    });

    return Number(mission.missionId);
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`미션 추가 중 오류가 발생했습니다: ${err.message}`);
  }
};

export const getMissionById = async (missionId) => {
  try {
    const mission = await prisma.mission.findUnique({
      where: { missionId: BigInt(missionId) }
    });

    if (!mission) return null;

    return {
      missionId: Number(mission.missionId),
      storeId: Number(mission.storeId),
      region: mission.region,
      missionMoney: Number(mission.missionMoney),
      missionPoint: Number(mission.missionPoint),
      createdAt: mission.createdAt
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`미션 조회 중 오류가 발생했습니다: ${err.message}`);
  }
};

export const addUserMission = async (data) => {
  try {
    // 이미 도전 중인 미션이 있는지 확인
    const existingMission = await prisma.userMission.findFirst({
      where: {
        userId: BigInt(data.userId),
        missionId: BigInt(data.missionId),
        status: 'IN_PROGRESS'
      }
    });

    if (existingMission) {
      throw new MissionAlreadyChallengedError();
    }

    // 미션 정보 가져오기
    const mission = await prisma.mission.findUnique({
      where: { missionId: BigInt(data.missionId) }
    });

    if (!mission) {
      throw new MissionNotFoundError();
    }

    // 제한 시간 설정 (예: 7일 후)
    const limitedAt = new Date();
    limitedAt.setDate(limitedAt.getDate() + 7);

    const userMission = await prisma.userMission.create({
      data: {
        userId: BigInt(data.userId),
        missionId: BigInt(data.missionId),
        storeId: mission.storeId,
        status: 'IN_PROGRESS',
        challengeAt: new Date(),
        limitedAt: limitedAt
      }
    });

    return Number(userMission.challengeMissionId);
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`미션 도전 중 오류가 발생했습니다: ${err.message}`);
  }
};

// 특정 가게의 미션 목록 조회
export const getStoreMissions = async (storeId, cursor) => {
  try {
    const pageSize = 10;

    const missions = await prisma.mission.findMany({
      where: {
        storeId: BigInt(storeId)
      },
      include: {
        store: {
          select: {
            storeName: true,
            storeAddress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: pageSize + 1,
      ...(cursor && {
        cursor: {
          missionId: BigInt(cursor)
        },
        skip: 1
      })
    });

    const hasMore = missions.length > pageSize;
    const data = hasMore ? missions.slice(0, pageSize) : missions;

    return {
      missions: data.map(mission => ({
        missionId: Number(mission.missionId),
        storeId: Number(mission.storeId),
        storeName: mission.store.storeName,
        storeAddress: mission.store.storeAddress,
        region: mission.region,
        missionMoney: Number(mission.missionMoney),
        missionPoint: Number(mission.missionPoint),
        createdAt: mission.createdAt
      })),
      nextCursor: hasMore ? Number(data[data.length - 1].missionId) : null
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`가게 미션 목록 조회 중 오류가 발생했습니다: ${err.message}`);
  }
};

// 내가 진행 중인 미션 목록 조회
export const getMyOngoingMissions = async (userId, cursor) => {
  try {
    const pageSize = 10;

    const userMissions = await prisma.userMission.findMany({
      where: {
        userId: BigInt(userId),
        status: 'IN_PROGRESS'
      },
      include: {
        mission: {
          select: {
            region: true,
            missionMoney: true,
            missionPoint: true
          }
        },
        store: {
          select: {
            storeName: true,
            storeAddress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: pageSize + 1,
      ...(cursor && {
        cursor: {
          challengeMissionId: BigInt(cursor)
        },
        skip: 1
      })
    });

    const hasMore = userMissions.length > pageSize;
    const data = hasMore ? userMissions.slice(0, pageSize) : userMissions;

    return {
      missions: data.map(um => ({
        challengeMissionId: Number(um.challengeMissionId),
        missionId: Number(um.missionId),
        storeId: Number(um.storeId),
        storeName: um.store.storeName,
        storeAddress: um.store.storeAddress,
        region: um.mission.region,
        missionMoney: Number(um.mission.missionMoney),
        missionPoint: Number(um.mission.missionPoint),
        status: um.status,
        challengeAt: um.challengeAt,
        limitedAt: um.limitedAt,
        createdAt: um.createdAt
      })),
      nextCursor: hasMore ? Number(data[data.length - 1].challengeMissionId) : null
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`진행 중인 미션 목록 조회 중 오류가 발생했습니다: ${err.message}`);
  }
};

export const requestMissionSuccess = async (data) => {
  try {
    // 미션 정보 조회
    const userMission = await prisma.userMission.findUnique({
      where: {
        challengeMissionId: BigInt(data.challengeMissionId)
      },
      include: {
        mission: {
          select: {
            missionMoney: true,
            missionPoint: true
          }
        }
      }
    });

    if (!userMission) {
      throw new MissionNotFoundError();
    }

    // 자신의 미션인지 확인
    if (Number(userMission.userId) !== data.userId) {
      throw new ForbiddenError("자신의 미션만 완료할 수 있습니다.");
    }

    // 진행 중인 미션인지 확인
    if (userMission.status !== 'IN_PROGRESS') {
      throw new InvalidMissionStatusError();
    }

    // 인증 코드 생성 (6자리 랜덤 숫자)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 트랜잭션으로 미션 상태 업데이트와 포인트 적립을 함께 처리
    await prisma.$transaction([
      // 미션 상태를 'COMPLETED'로 업데이트하고 인증 코드 저장
      prisma.userMission.update({
        where: {
          challengeMissionId: BigInt(data.challengeMissionId)
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          successId: verificationCode
        }
      }),

      // 사용자 포인트 업데이트
      prisma.user.update({
        where: {
          userId: BigInt(data.userId)
        },
        data: {
          userPoint: {
            increment: userMission.mission.missionPoint
          }
        }
      })
    ]);

    return verificationCode;
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`미션 성공 요청 중 오류가 발생했습니다: ${err.message}`);
  }
};

export const confirmMissionSuccess = async (data) => {
  try {
    // 인증 코드로 미션 조회
    const userMission = await prisma.userMission.findFirst({
      where: {
        successId: data.verificationCode,
        userId: BigInt(data.userId)
      },
      include: {
        mission: {
          select: {
            missionMoney: true,
            missionPoint: true
          }
        }
      }
    });

    if (!userMission) {
      throw new InvalidVerificationCodeError();
    }

    // 이미 확정된 미션인지 확인
    if (userMission.status !== 'COMPLETED') {
      throw new InvalidMissionStatusError("완료되지 않은 미션입니다.");
    }

    // 미션 확정 처리 (상태는 이미 COMPLETED이므로 추가 처리 없음)
    return {
      challengeMissionId: Number(userMission.challengeMissionId),
      missionMoney: Number(userMission.mission.missionMoney),
      missionPoint: Number(userMission.mission.missionPoint)
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`미션 성공 확정 중 오류가 발생했습니다: ${err.message}`);
  }
};
