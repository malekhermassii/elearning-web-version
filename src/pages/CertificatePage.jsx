import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/auth';
import { extendedCoursesData } from '../data/extendedCoursesData';
import { getQuizResults, isCourseCompleted, generateCertificateId } from '../utils/quizUtils';

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [certificateId, setCertificateId] = useState('');
  const [user, setUser] = useState(null);
  const [completionDate, setCompletionDate] = useState('');

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/courses/${courseId}/certificate` } });
      return;
    }

    // Get user data
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // Load course data
    const foundCourse = extendedCoursesData.find(c => c.id === parseInt(courseId));
    if (!foundCourse) {
      navigate('/my-courses');
      return;
    }
    setCourse(foundCourse);
    
    // Check if course is completed
    if (!isCourseCompleted(courseId, foundCourse)) {
      navigate(`/courses/${courseId}/content`);
      return;
    }
    
    // Check if quiz is passed
    const results = getQuizResults(courseId);
    if (!results || !results.passed) {
      navigate(`/courses/${courseId}/quiz`);
      return;
    }
    
    setQuizResults(results);
    setCompletionDate(formatDate(results.timestamp));
    
    // Generate certificate ID if not already present
    if (results.certificateId) {
      setCertificateId(results.certificateId);
    } else {
      const newCertId = generateCertificateId(courseId, currentUser.id);
      setCertificateId(newCertId);
    }
    
    setLoading(false);
  }, [courseId, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    alert('Certificate download functionality would be implemented here');
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pt-16 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Certificate Actions */}
        <div className="flex justify-end space-x-4 mb-6 print:hidden">
        
          <button
            onClick={handleDownload}
            className="px-4 py-2 flex items-center space-x-2 bg-[#3f51b5] text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
          >
            <span>Download Certificate</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Certificate */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl mx-auto max-w-3xl certificate-container relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-50"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-50"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-50 opacity-30"></div>
          </div>
          
          {/* Border design */}
          <div className="absolute inset-2 border border-indigo-100 rounded-xl pointer-events-none">
            {/* Border corners */}
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-indigo-600"></div>
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-indigo-600"></div>
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-indigo-600"></div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-indigo-600"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center">
              {/* Badge */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Certificate of Achievement</h1>
              
              <div className="flex justify-center mb-4">
                <div className="h-1 w-16 bg-indigo-600"></div>
              </div>
              
              <p className="text-gray-500 text-sm uppercase tracking-wider mb-4">THIS CERTIFIES THAT</p>
              
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">
                {user?.fullName || 'Student Name'}
              </h2>
              
              <p className="text-gray-600 mb-3">
                has successfully completed the course
              </p>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {course?.title}
              </h3>
              
              <p className="text-gray-600 mb-2">
                with a final score of{" "}
                <span className="font-bold text-indigo-700">{quizResults?.score}</span>
              </p>
              
              <div className="flex justify-center mt-10 mb-6">
                <div className="text-center flex-1 max-w-xs">
                  <div className="h-0.5 w-full bg-gray-300 mb-2"></div>
                  <p className="text-gray-500 text-sm">Instructor Signature</p>
                  <p className="font-medium">{course?.instructor}</p>
                </div>
              </div>
              
              {/* Certified stamp */}
              <div className="absolute bottom-12 right-12">
                <div className="w-16 h-16 rounded-full border border-purple-300 bg-purple-50 bg-opacity-40 flex items-center justify-center rotate-12">
                  <span className="text-xs font-bold text-purple-700 tracking-wider">CERTIFIED</span>
                </div>
              </div>
              
              <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Issued on {completionDate}</p>
                <p className="mt-2">Certificate ID: {certificateId}</p>
             
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .certificate-container {
            border: 1px solid #e5e7eb !important;
            padding: 2rem !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatePage;