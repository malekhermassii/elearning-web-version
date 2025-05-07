import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { quizData } from '../data/quizData';
import { extendedCoursesData } from '../data/extendedCoursesData';
import { isCourseCompleted, saveQuizResults } from '../utils/quizUtils';

const QuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/courses/${courseId}/quiz` } });
      return;
    }

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
    
    // Load quiz data
    const quizForCourse = quizData[courseId];
    if (!quizForCourse) {
      setError("No quiz found for this course");
      setLoading(false);
      return;
    }
    
    setQuiz(quizForCourse);
    setTimeRemaining(quizForCourse.timeLimit * 60); // Convert minutes to seconds
    setLoading(false);
  }, [courseId, navigate]);

  // Timer for quiz
  useEffect(() => {
    if (!loading && !quizSubmitted && timeRemaining > 0 && quiz) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !quizSubmitted && quiz) {
      // Auto-submit when time is up
      handleSubmitQuiz();
    }
  }, [timeRemaining, loading, quizSubmitted, quiz]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!quiz) {
      setError("Cannot submit quiz - quiz data is missing");
      return;
    }
    
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    const quizResults = {
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      passed,
      timeSpent: quiz.timeLimit * 60 - timeRemaining,
      answers: selectedAnswers
    };
    
    // Save results
    saveQuizResults(courseId, quizResults);
    setResults(quizResults);
    setQuizSubmitted(true);
  };
  
  const navigateToCertificate = () => {
    navigate(`/courses/${courseId}/certificate`);
  };
  
  const navigateToCoursePage = () => {
    navigate(`/courses/${courseId}/content`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-600 mb-6">Please return to your course content.</p>
            <button 
              onClick={navigateToCoursePage}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Return to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizSubmitted && results) {
    // Show results screen
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Quiz Results</h1>
              
              <div className="mb-8 text-center">
                <div className="mb-4">
                  <div className={`text-5xl font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {results.score}
                  </div>
                  <div className="text-lg text-gray-600 mt-2">
                    {results.correctAnswers} of {results.totalQuestions} questions answered correctly
                  </div>
                </div>
                
                {results.passed ? (
                  <div className="bg-green-100 text-green-800 text-lg p-4 rounded-lg">
                    Congratulations! You've passed the quiz.
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-800 text-lg p-4 rounded-lg">
                    Sorry! You didn't pass the quiz. You need {quiz?.passingScore || 17}to pass.
                  </div>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
                {results.passed ? (
                  <button
                    onClick={navigateToCertificate}
                    className="px-6 py-3 bg-[#3f51b5] text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    View Your Certificate
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#3f51b5] text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={navigateToCoursePage}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                >
                  Return to Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Guard against null quiz
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz not available</h2>
            <p className="text-gray-600 mb-6">The quiz for this course could not be loaded.</p>
            <button 
              onClick={navigateToCoursePage}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Return to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <div className="flex flex-col md:flex-row justify-between mt-2">
            <p className="text-gray-600">{course?.title || 'Course'}</p>
            <div className="mt-2 md:mt-0 flex items-center">
              <div className={`mr-2 ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                Time Remaining: {formatTime(timeRemaining)}
              </div>
              <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quiz Description and Instructions */}
        <div className="bg-gradient-to-r from-[#6572EB29] to-[#6572EB00] rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <p className="text-gray-700">{quiz.description}</p>
            <div className="mt-3 text-sm text-gray-600">
              <p>• Select the best answer for each question</p>
              <p>• You can navigate between questions</p>
              <p>• You need {quiz.passingScore} to pass the quiz</p>
            </div>
          </div>
        </div>
        
        {/* Question Card */}
        {currentQuestionData && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentQuestionData.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestionData.options.map((option, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnswers[currentQuestionData.id] === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestionData.id, index)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                        selectedAnswers[currentQuestionData.id] === index
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestionData.id] === index && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded-lg ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-[#3f51b5] text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Quiz
            </button>
          )}
        </div>
        
        {/* Quiz Progress */}
        <div className="mt-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(Object.keys(selectedAnswers).length / quiz.questions.length * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${Object.keys(selectedAnswers).length / quiz.questions.length * 100}%` }}
            ></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {quiz.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  currentQuestion === index
                    ? 'bg-blue-600 text-white'
                    : selectedAnswers[question.id] !== undefined
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage; 