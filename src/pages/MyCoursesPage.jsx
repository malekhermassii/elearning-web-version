import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, getEnrolledCourses } from '../utils/auth';
import { coursesData } from '../data/coursesData';
import { extendedCoursesData } from '../data/extendedCoursesData';

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState({});

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/my-courses' } });
      return;
    }

    // Get current user data
    const userData = getCurrentUser();
    setUser(userData);

    // retourne les identifiants des cours auxquels l'utilisateur est inscrit
    const userEnrolledCourses = getEnrolledCourses();
    
    // First try to get course details from extended data for richer information
    const extendedCourseDetails = userEnrolledCourses.map(courseId => {
      return (
        extendedCoursesData.find(course => course.id === parseInt(courseId)) ||
        coursesData.find(course => course.id === parseInt(courseId)) || 
        { id: courseId, title: 'Unknown Course', image: 'https://via.placeholder.com/300' }
      );
    });
    
    
    setEnrolledCourses(extendedCourseDetails);

    // Calculate progress for each course
    const progressData = {};
    userEnrolledCourses.forEach(courseId => {
      const savedProgressStr = localStorage.getItem(`course_${courseId}_progress`);
      if (savedProgressStr) {
        const completedLessons = JSON.parse(savedProgressStr);
        const course = extendedCoursesData.find(c => c.id === parseInt(courseId));
        
        if (course) {
          const totalLessons = course.modules.reduce(
            (total, module) => total + module.lessons.length, 
            0
          );
          progressData[courseId] = {
            completed: completedLessons.length,
            total: totalLessons,
            percentage: Math.round((completedLessons.length / totalLessons) * 100),
            lastLesson: completedLessons.length > 0 ? 
              getLastCompletedLesson(course, completedLessons) : null
          };
        }
      } else {
        progressData[courseId] = { completed: 0, total: 0, percentage: 0, lastLesson: null };
      }
    });
    
    setCourseProgress(progressData);
    setLoading(false);
  }, [navigate]);

  // Helper to get the last completed lesson info
  const getLastCompletedLesson = (course, completedLessons) => {
    if (!course || !completedLessons.length) return null;
    
    const lastCompletedId = completedLessons[completedLessons.length - 1];
    
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.id === lastCompletedId) {
          return {
            title: lesson.title,
            moduleTitle: module.title
          };
        }
      }
    }
    
    return null;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Track your progress and continue learning</p>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.map(course => {
              const progress = courseProgress[course.id] || { percentage: 0, completed: 0, total: 0 };
              
              return (
                <div 
                  key={course.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className="h-48 w-full md:h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-2/3">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {course.level}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        {course.instructor && (
                          <p className="mb-1">Instructor: {course.instructor}</p>
                        )}
                        <p className="mb-1">
                          Enrolled: {formatDate(user?.enrollmentDates?.[course.id])}
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Progress</span>
                          <span className="text-gray-600">{progress.percentage}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-[#3f51b5] h-2.5 rounded-full" 
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {progress.completed} of {progress.total} lessons completed
                        </div>
                      </div>

                      {/* Last lesson */}
                      {progress.lastLesson && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-[#6572EB29] to-[#6572EB00] rounded-lg border border-gray-200">
                          <div className="text-xs text-gray-500">Last completed lesson</div>
                          <div className="text-sm font-medium">{progress.lastLesson.title}</div>
                          <div className="text-xs text-gray-600">in {progress.lastLesson.moduleTitle}</div>
                        </div>
                      )}

                      <div className="flex space-x-3 mt-4">
                        <Link 
                          to={`/courses/${course.id}/content`}
                          className="flex-1 bg-[#3f51b5] text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          {progress.percentage > 0 ? 'Continue Learning' : 'Start Learning'}
                        </Link>
                        <Link 
                          to={`/courses/${course.id}`}
                          className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-blue-50 mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                <path fillRule="evenodd" d="M10 9a2 2 0 100-4 2 2 0 000 4zm1 2.586l4 4-4-4zm-2 0L5 15.586l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
            </p>
            <Link
              to="/courses"
              className="inline-block bg-[#3f51b5] text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage; 