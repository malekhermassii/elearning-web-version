import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserToken } from "../redux/slices/authSlice";
const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Full name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const response = await axios.post(
          "http://192.168.1.17:3000/register",
          {
            name: values.name,
            email: values.email,
            password: values.password,
          }
        );

        const { token, user } = response.data;

        if (!token) {
          throw new Error("Token not received from server");
        }

        localStorage.setItem("userToken", token);

        // Structure cohérente avec handleLogin
        const userData = {
          name: values.name,
          email: values.email,
          ...(user || {}), // Ajoute les données supplémentaires du serveur si elles existent
        };
        // Optionnel : Stocker utilisateur ou token dans localStorage si besoin
        localStorage.setItem("user", JSON.stringify(userData));

        dispatch(setUserToken({ token, user: userData }));

        // Rediriger vers la page de login avec message de succès
        navigate("/login", {
          state: { message: "Account created successfully! Please login." },
        });
      } catch (error) {
        console.error("Registration error:", error);

        const errorMessage =
          error.response?.data?.message ||
          "Registration failed. Please try again.";

        setErrors({ form: errorMessage });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="text-gray-600">
              Join our community and start learning today
            </p>
          </div>

          {formik.errors.form && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>{formik.errors.form}</p>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5 flex-grow">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.errors.name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder="John Doe"
              />
              {formik.errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder="your@email.com"
              />
              {formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.errors.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder="••••••••"
              />
              {formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.errors.confirmPassword
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                placeholder="••••••••"
              />
              {formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-base ${
                formik.isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700"
              } transition-colors shadow-md mt-2`}
            >
              {formik.isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:block bg-[#1B45B4] from-blue-600 to-blue-400 text-white flex items-center justify-center">
          <div className="text-center px-10 py-6">
            <h2 className="text-3xl font-semibold mb-4">
              Hello! Welcome back.
            </h2>
            <p className=" mb-6">
              Create an Account to Continue your allCourses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
