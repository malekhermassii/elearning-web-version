import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LogoutPage from "./pages/LogoutPage";
import HomePage from "./pages/HomePage";
import SubscribePage from "./pages/SubscribePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import EnrollmentSuccessPage from "./pages/EnrollmentSuccessPage";
import CourseContentPage from "./pages/CourseContentPage";
import CertificatePage from "./pages/CertificatePage";
import QuizPage from "./pages/QuizPage";
import ProfilePage from "./pages/ProfilePage";
import MyCoursesPage from "./pages/MyCoursesPage";
import ApplyInstructorPage from "./pages/ApplyInstructorPage";
import ContactPage from "./pages/Contact";

//admin route
import AdminLayout from "./components/layout/AdminLayout";
import LoginPageadmin from "./pages/admin/LoginPage";
import LogoutPageadmin from "./pages/admin/LogoutPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import InstructorManagementPage from "./pages/admin/InstructorManagementPage";
import StudentManagementPage from "./pages/admin/StudentManagementPage";
import InstructorApplicationsPage from "./pages/admin/DemandeInstructor";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";
import SubscriptionsPage from "./pages/admin/SubscriptionsPage";
import UserFeedbackPage from "./pages/admin/UserFeedbackPage";
import StatisticsPage from "./pages/admin/StatisticsPage";
import CourseReviewPage from "./pages/admin/CourseReviewPage";
import CourseStatus from "./pages/admin/Coursestatus";
import ProfilePageadmin from "./pages/admin/ProfilePage";

// Instructor Pages
import InstructorDashboardPage from "./pages/instructor/InstructorDashboardPage";
import LoginPageprof from "./pages/instructor/LoginPage";
import LogoutPageprof from "./pages/instructor/LogoutPage";
import InstructorCoursesPage from "./pages/instructor/MyCoursesPage";
import InstructorLayout from "./components/layout/InstructorLayout";
import CreateCoursePage from "./pages/instructor/CreateCoursePage";
import EditCoursePage from "./pages/instructor/EditCoursePage";
import CourseQuizzesPage from "./pages/instructor/CourseQuizzesPage";
import CreateQuizPage from "./pages/instructor/CreateQuizPage";
import QuizResultsPage from "./pages/instructor/QuizResultsPage";
import QuizDetailPage from "./pages/instructor/QuizDetailPage";
import EditQuizPage from "./pages/instructor/EditQuizPage ";
import UserQuestionPage from "./pages/instructor/DiscussionsPage";
import ReviewPage from "./pages/instructor/ReviewPage";
import AnalyticsPage from "./pages/instructor/AnalyticsPage";
import SettingsPage from "./pages/instructor/SettingsPage";
import DebugPage from "./pages/instructor/DebugPage";



import { Navigate } from 'react-router-dom'

function App() {
  return (
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/loginadmin" element={<LoginPageadmin />} />
          <Route path="/loginprof" element={<LoginPageprof />} />

          {/* Main layout routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="subscribe" element={<SubscribePage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId" element={<CourseDetailsPage />} />
            <Route path="/apply-instructor" element={<ApplyInstructorPage />} />
            <Route path="contact" element={<ContactPage />} />

            {/* Protected user routes */}
        
              <Route path="my-courses" element={<MyCoursesPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="payment-success" element={<PaymentSuccessPage />} />
              <Route path="enrollment-success" element={<EnrollmentSuccessPage />} />
              <Route path="courses/:courseId/content" element={<CourseContentPage />} />
              <Route path="courses/:courseId/quiz" element={<QuizPage />} />
              <Route path="courses/:courseId/certificate" element={<CertificatePage />} />
              <Route path="/logout" element={<LogoutPage />} />
            </Route>
        

          {/* Protected admin routes */}
    *
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="profile" element={<ProfilePageadmin />} />
              <Route path="users">
                <Route path="instructors" element={<InstructorManagementPage />} />
                <Route path="students" element={<StudentManagementPage />} />
              </Route>
              <Route path="instructor-applications" element={<InstructorApplicationsPage />} />
              <Route path="categories" element={<CategoryManagementPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="feedback" element={<UserFeedbackPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="course-review" element={<CourseReviewPage />} />
              <Route path="course-status" element={<CourseStatus />} />
            </Route>
            <Route path="/logoutadmin" element={<LogoutPageadmin />} />
         

          {/* Protected instructor routes */}
         
            <Route path="/instructor" element={<InstructorLayout />}>
              <Route index element={<InstructorDashboardPage />} />
              <Route path="courses" element={<InstructorCoursesPage />} />
              <Route path="courses/create" element={<CreateCoursePage />} />
              <Route path="courses/:courseId" element={<EditCoursePage />} />
              <Route path="quizzes" element={<CourseQuizzesPage />} />
              <Route path="quizzes/create" element={<CreateQuizPage />} />
              <Route path="quizzes/:quizId/edit" element={<EditQuizPage />} />
              <Route path="quizzes/:quizId/results" element={<QuizResultsPage />} />
              <Route path="quizzes/:quizId/detail" element={<QuizDetailPage />} />
              <Route path="discussions" element={<UserQuestionPage />} />
              <Route path="Review" element={<ReviewPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="debug" element={<DebugPage />} />
            </Route>
            <Route path="/logoutprof" element={<LogoutPageprof />} />
        

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

  );
}

export default App;
