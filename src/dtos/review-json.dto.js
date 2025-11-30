export const bodyToReviewJson = (body) => {
  return {
    challengeMissionId: parseInt(body.challengeMissionId),
    rating: parseFloat(body.rating),
    content: body.content
  };
};

export const responseFromReviewJson = (review, storeName) => {
  return {
    reviewId: review.reviewId,
    storeName: storeName
  };
};
