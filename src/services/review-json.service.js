import { responseFromReviewJson } from "../dtos/review-json.dto.js";
import { addReviewJson } from "../repositories/review-json.repository.js";

export const reviewAddJson = async (data) => {
  const result = await addReviewJson(data);
  return responseFromReviewJson(result, result.storeName);
};
