import { prisma } from "../config/prisma.config.js";
import { MissionNotCompletedError, ForbiddenError, InternalServerError } from "../errors/custom-error.js";

export const addReviewJson = async (data) => {
  try {
    // 먼저 challengeMissionId로 user_missions에서 정보를 가져옴
    const userMission = await prisma.userMission.findUnique({
      where: {
        challengeMissionId: BigInt(data.challengeMissionId)
      },
      include: {
        store: {
          select: { storeName: true }
        }
      }
    });

    if (!userMission || userMission.status !== 'COMPLETED') {
      throw new MissionNotCompletedError();
    }

    // 사용자 권한 검증
    if (Number(userMission.userId) !== data.userId) {
      throw new ForbiddenError("자신의 미션에만 리뷰를 작성할 수 있습니다.");
    }

    // 이미 해당 미션에 대해 리뷰가 작성되었는지 확인 - 중복 로직 문제 생겨서 임시 비활성화 🥲😭
    // const existingReview = await prisma.review.findFirst({
    //   where: {
    //     userId: userMission.userId,
    //     storeId: userMission.storeId
    //   }
    // });

    // if (existingReview) {
    //   throw new Error("이미 리뷰를 작성한 미션입니다.");
    // }

    // 리뷰 추가 (이미지 없이)
    const review = await prisma.review.create({
      data: {
        storeId: userMission.storeId,
        userId: userMission.userId,
        reviewText: data.content,
        score: data.rating
      }
    });

    return {
      reviewId: Number(review.reviewId),
      storeName: userMission.store.storeName
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`리뷰 추가 중 오류가 발생했습니다: ${err.message}`);
  }
};
