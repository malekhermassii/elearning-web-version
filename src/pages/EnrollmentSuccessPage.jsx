import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { extendedCoursesData } from '../data/extendedCoursesData';
import { coursesData } from '../data/coursesData';

const EnrollmentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const { courseId } = location.state || {};
  
  // Find the course in our data
  const course = courseId && (
    extendedCoursesData.find(c => c.id === parseInt(courseId)) || 
    coursesData.find(c => c.id === parseInt(courseId))
  );
  
  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setAnimate(true), 100);
    
    // If no course ID was provided in state, redirect to courses page
    if (!courseId) {
      setTimeout(() => {
        navigate('/courses');
      }, 2000);
    }
  }, [courseId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="rounded-full bg-[#1B45B4] p-4">
              <svg
                className={`w-14 h-14 text-white transition-transform duration-700 ${animate ? 'transform scale-100' : 'transform scale-0'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  className={`transition-all duration-700 ${animate ? 'opacity-100 stroke-dashoffset-0' : 'opacity-0 stroke-dashoffset-100'}`}
                  style={{
                    strokeDasharray: 100,
                    strokeDashoffset: animate ? 0 : 100,
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrollment Successful!</h1>
          
          {course ? (
            <div className="bg-blue-50 bg-gradient-to-r from-[#6572EB29] to-[#6572EB00] rounded-lg p-4 mb-6 mt-4">
              <p className="text-gray-700 mb-4">
                You have successfully enrolled in:
              </p>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="flex items-center mb-4">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="ml-4 text-left">
                    <h3 className="font-bold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.instructor}</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 text-left">
            
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Lessons:</span>
                    <span className="text-gray-900">{course.lessons || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Level:</span>
                    <span className="text-gray-900">{course.level || 'All levels'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">You've successfully enrolled in a course.</p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {course ? (
              <Link
                to={`/courses/${courseId}/content`}
                className="flex-1 bg-[#1B45B4] text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Start Learning
              </Link>
            ) : (
              <Link
                to="/courses"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Browse Courses
              </Link>
            )}
            <Link
              to="/profile"
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
            >
              View My Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentSuccessPage; 