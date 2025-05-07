import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ApplyInstructorPage = () => {
  const navigate = useNavigate();

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    country: "",
    specialty: "",
    birthDate: "",
    topics: "",
    CV: "",
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Full name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^\+?[\d\s-]{8,}$/, "Invalid phone number")
      .required("Phone number is required"),
    country: Yup.string().required("Country is required"),
    specialty: Yup.string().required("Area of specialty is required"),
    birthDate: Yup.date()
      .required("Birth date is required"),
    topics: Yup.string().required("Teaching topics are required"),
    CV: Yup.mixed()
      .required("CV is required")
      .test("fileSize", "File too large. Max size is 2MB", (value) => {
        return value && value.size <= 2 * 1024 * 1024; // 2MB
      }),
  });

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatus({ success: true });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus({
        success: false,
        error:
          "An error occurred while submitting your application. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-white mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join Our Teaching Community
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your expertise with students worldwide and become part of
              our growing community of educators.
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status, setFieldValue }) =>
              status?.success ? (
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Application Submitted!
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Thank you for your interest in becoming a mentor. We'll
                    review your application and get back to you within 2-3
                    business days.
                  </p>
                  <div className="animate-pulse">
                    <p className="text-sm text-gray-500">
                      Redirecting to home page...
                    </p>
                  </div>
                </div>
              ) : (
                <Form className="bg-gradient-to-r from-[#6572EB29] to-[#6572EB00] shadow-xl rounded-xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b">
                        Personal Information
                      </h3>

                      <FieldWithError
                        name="name"
                        label="Full Name"
                        placeholder="John Doe"
                      />
                      <FieldWithError
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                      />
                      <FieldWithError
                        name="phone"
                        label="Phone Number"
                        placeholder="+1234567890"
                      />
                      <FieldWithError
                        name="country"
                        label="Country"
                        placeholder="United States"
                      />
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b">
                        Professional Information
                      </h3>

                      <FieldWithError
                        name="specialty"
                        label="Area of Specialty"
                        placeholder="e.g., Web Development"
                      />
                      <FieldWithError
                        name="birthDate"
                        label="birthDate"
                        type="date"
                      />
                      <FieldWithError
                        name="topics"
                        label="Topics You Want to Teach"
                        placeholder="JavaScript, React"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload CV <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="CV"
                          type="file"
                          accept=".pdf,.docx"
                          onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            setFieldValue("CV", file);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <ErrorMessage
                          name="CV"
                          component="p"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-8 py-3 bg-[#1B45B4] text-white rounded-lg font-medium hover:bg-blue-700 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                        transition-all transform hover:scale-105 ${
                          isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>
                </Form>
              )
            }
          </Formik>
        </div>
      </div>
    </section>
  );
};

// 👇 Helper component to render fields with errors
const FieldWithError = ({
  name,
  label,
  type = "text",
  placeholder = "",
  required = true,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Field
      name={name}
      type={type}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <ErrorMessage
      name={name}
      component="p"
      className="mt-1 text-sm text-red-500"
    />
  </div>
);

export default ApplyInstructorPage;
