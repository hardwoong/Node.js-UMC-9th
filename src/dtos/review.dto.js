export const formDataToReview = (body, files) => {
  return {
    challengeMissionId: parseInt(body.challengeMissionId),
    rating: parseFloat(body.rating),
    content: body.content,
    images: files ? files.map(file => file.filename) : []
  };
};

export const responseFromReview = (review, storeName) => {
  return {
    reviewId: review.reviewId,
    storeName: storeName
  };
};

export const responseFromMyReviews = (reviews, nextCursor) => {
  return {
    reviews: reviews.map(review => ({
      reviewId: review.reviewId,
      storeName: review.storeName,
      storeAddress: review.storeAddress,
      reviewText: review.reviewText,
      score: review.score,
      createdAt: review.createdAt,
      images: review.images
    })),
    pagination: {
      cursor: nextCursor
    }
  };
};