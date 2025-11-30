import { prisma } from "../config/prisma.config.js";
import { MissionNotCompletedError, InternalServerError } from "../errors/custom-error.js";

export const addReview = async (data) => {
  try {
    // 먼저 challengeMissionId로 user_missions에서 정보를 가져옴
    const userMission = await prisma.userMission.findFirst({
      where: {
        challengeMissionId: BigInt(data.challengeMissionId),
        status: 'COMPLETED'
      },
      include: {
        store: {
          select: {
            storeName: true
          }
        }
      }
    });

    if (!userMission) {
      throw new MissionNotCompletedError();
    }

    // 리뷰 추가 (이미지도 함께)
    const review = await prisma.review.create({
      data: {
        storeId: userMission.storeId,
        userId: userMission.userId,
        reviewText: data.content,
        score: data.rating,
        reviewImgs: data.images && data.images.length > 0 ? {
          create: data.images.map(image => ({
            reviewImg: image
          }))
        } : undefined
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

// 내가 작성한 리뷰 목록 조회
export const getMyReviews = async (userId, cursor) => {
  try {
    const pageSize = 10;

    const reviews = await prisma.review.findMany({
      where: {
        userId: BigInt(userId)
      },
      include: {
        store: {
          select: {
            storeName: true,
            storeAddress: true
          }
        },
        reviewImgs: {
          select: {
            reviewImg: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: pageSize + 1,
      ...(cursor && {
        cursor: {
          reviewId: BigInt(cursor)
        },
        skip: 1
      })
    });

    const hasMore = reviews.length > pageSize;
    const data = hasMore ? reviews.slice(0, pageSize) : reviews;

    return {
      reviews: data.map(review => ({
        reviewId: Number(review.reviewId),
        storeName: review.store.storeName,
        storeAddress: review.store.storeAddress,
        reviewText: review.reviewText,
        score: Number(review.score),
        images: review.reviewImgs.map(img => img.reviewImg),
        createdAt: review.createdAt
      })),
      nextCursor: hasMore ? Number(data[data.length - 1].reviewId) : null
    };
  } catch (err) {
    if (err.statusCode) throw err;
    throw new InternalServerError(`리뷰 목록 조회 중 오류가 발생했습니다: ${err.message}`);
  }
};
