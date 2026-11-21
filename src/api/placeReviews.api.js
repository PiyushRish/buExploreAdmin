import axiosClient from "./axiosClient";

/**
 * Get paginated reviews for a specific place.
 * GET /places/:id/reviews?page=1&limit=20
 */
export const getPlaceReviews = async (placeId, params = {}) => {
  const res = await axiosClient.get(`/places/${placeId}/reviews`, { params });
  return res.data;
};

/**
 * Add a review to a place (authenticated users).
 * POST /places/:id/reviews
 */
export const addPlaceReview = async (placeId, { rating, comment }) => {
  const res = await axiosClient.post(`/places/${placeId}/reviews`, { rating, comment });
  return res.data;
};

/**
 * Toggle like/unlike on a specific review.
 * POST /places/:id/reviews/:reviewId/like
 */
export const likeReview = async (placeId, reviewId) => {
  const res = await axiosClient.post(`/places/${placeId}/reviews/${reviewId}/like`);
  return res.data;
};

/**
 * Delete a review (admin can delete any; users can delete their own).
 * DELETE /places/:id/reviews/:reviewId
 */
export const deleteReview = async (placeId, reviewId) => {
  const res = await axiosClient.delete(`/places/${placeId}/reviews/${reviewId}`);
  return res.data;
};
