import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReview } from '../../api';

const ReviewCard = ({ review }) => {
  const rating = Math.round(review.rating);

 return (
    <div className="bg-white shadow rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">
          {review.apprenant_id?.userId?.name || "Unknown User"}
        </h3>
        <span className="text-sm text-gray-500">
          {new Date(review.dateEnvoi).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        <strong>Course:</strong> {review.courseId?.nom || "Unknown Course"}
      </p>
      <p className="text-sm text-gray-700 mb-2">"{review.message}"</p>
      
      {/* Affichage des étoiles */}
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
const CourseReviewPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reviews = useSelector((state) => state.aviss.aviss);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        await dispatch(fetchReview());
        setError(null);
      } catch (err) {
        setError("Unable to load reviews.");
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-800">Course Reviews</h1>
        <p className="text-gray-500 mt-1">View and manage course reviews from learners.</p>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No reviews found.</p>
        </div>
      )}
    </div>
  );
};

export default CourseReviewPage;
