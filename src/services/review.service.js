import { responseFromReview, responseFromMyReviews } from "../dtos/review.dto.js";
import { addReview, getMyReviews } from "../repositories/review.repository.js";

export const reviewAdd = async (data) => {
  const result = await addReview(data);
  return responseFromReview(result, result.storeName);
};

export const getMyReviewList = async (userId, cursor) => {
  const result = await getMyReviews(userId, cursor);

  return responseFromMyReviews(result.reviews, result.nextCursor);
};
