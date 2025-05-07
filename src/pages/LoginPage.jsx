import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import google from "../assets/images/google-icon.png";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fromRef = useRef(location.state?.from || "/courses");

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const { from } = location.state;
      fromRef.current = from;
      window.history.replaceState({ from }, document.title);
    }

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("currentUser"));

    if (currentUser) {
      navigate(fromRef.current);
    }
  }, [location, navigate]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    rememberMe: Yup.boolean(),
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.post("http://192.168.1.17:5000/login", {
        email: values.email,
        password: values.password,
      });

      const { token, user } = response.data;

      if (!token) throw new Error("Token not received from server");

      const userData = {
        name: user?.name || "User",
        email: user?.email || values.email,
        id :user?._id ,
        ...(user || {}),
      };
      localStorage.setItem("token", token);
      console.log(token)
      if (values.rememberMe) {
        localStorage.setItem("currentUser", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(userData));
  

      }

      navigate(fromRef.current, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Incorrect email or password.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600">
              Log in to your account to continue your learning journey
            </p>
            {successMessage && (
              <p className="mt-2 text-green-600 text-sm">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="mt-2 text-red-600 text-sm">{errorMessage}</p>
            )}
          </div>

          <Formik
            initialValues={{ email: "", password: "", rememberMe: false }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-6 flex-grow">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div className="flex items-center">
                  <Field
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-[#1B45B4] text-white py-3 rounded-lg font-medium text-base ${
                    isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                  } transition-colors shadow-md`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Logging in...
                    </div>
                  ) : (
                    "Log in"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-[#1B45B4] hover:text-blue-800">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="w-full py-3 px-6 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              >
                <img src={google} alt="Google" className="h-5 w-5 mr-2" />
                Google
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block bg-[#1B45B4] text-white flex items-center justify-center">
          <div className="text-center px-10 py-6">
            <h2 className="text-3xl font-semibold mb-4">Start your learning journey</h2>
            <p className="text-lg mb-6">Access our wide range of courses and start learning today!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
