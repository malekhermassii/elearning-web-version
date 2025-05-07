import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {  updateCourse } from "../../redux/slices/courseSlice";
import { toast } from "react-toastify";
import { fetchCategories } from "../../api";
import { useNavigate, useParams } from "react-router-dom";

// Base API URL - adjust according to environment
const API_BASE_URL = "http://192.168.1.17:3000";

const EditCoursePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  // Get authentication data from Redux store with verification
  const categories = useSelector((state) => state.categories.categories);
  const profState = useSelector((state) => state.authprof) || {};
  
  // State for existing course data
  const [initialCourseData, setInitialCourseData] = useState(null);
  
  // Secure data extraction
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [videoPreviews, setVideoPreviews] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Display current Redux store state for debugging
  useEffect(() => {
    console.log("Current Redux state:", {
      profState,
      hasToken: Boolean(profState?.profToken),
      hasProf: Boolean(profState?.prof)
    });
  }, [profState]);

  // Authentication check with structure validation
  const checkAuthentication = () => {
    try {
      console.log("Complete prof state structure:", profState);
      
      // Use Redux state properties directly now that we have access to authprof
      let token = profState?.profToken || null;
      let prof = profState?.prof || null;
      
      console.log("Redux structure check after extraction:", {
        token: token ? "Present" : "Absent",
        prof: prof ? "Present" : "Absent",
        profId: prof?._id || "Not found",
        isAuthenticated: profState?.isAuthenticated
      });
      
      // If not in Redux, try localStorage as fallback
      if (!token) {
        token = localStorage.getItem("profToken");
        console.log("Token retrieved from localStorage:", token ? "Present" : "Absent");
      }
      
      if (!prof || !prof._id) {
        try {
          const profData = localStorage.getItem("currentprof");
          if (profData) {
            prof = JSON.parse(profData);
            console.log("Prof retrieved from localStorage:", prof ? "Present" : "Absent", 
                        "ID:", prof?._id || "Not found");
          }
        } catch (e) {
          console.error("JSON parsing error for currentprof:", e);
        }
      }
      
      // Check if we have a professor ID
      const isValid = Boolean(token && prof && prof._id);
      
      console.log("Final authentication check result:", {
        token: token ? `${token.substring(0, 10)}...` : "Absent",
        profId: prof?._id || "Absent",
        profName: prof?.name || "Absent",
        isValid: isValid
      });
      
      setIsAuthenticated(isValid);
      
      // Adapt for backend compatibility expecting userId
      if (prof && prof._id && !prof.userId) {
        // Clone the prof object before adding a property
        // to avoid "Cannot add property userId, object is not extensible" error
        const profClone = { ...prof };
        profClone.userId = prof._id;
        prof = profClone;
      }
      
      return { isValid, token, prof };
    } catch (error) {
      console.error("Error during authentication check:", error);
      setIsAuthenticated(false);
      return { isValid: false, token: null, prof: null };
    }
  };

  useEffect(() => {
    dispatch(fetchCategories());
    
    // Check authentication on every Redux store change
    const { isValid } = checkAuthentication();
    
    if (!isValid) {
      console.warn("User not authenticated, redirecting...");
      toast.warning("You must be logged in to access this page");
      navigate("/loginprof");
    }
    
    // Fetch existing course data
    if (courseId && isValid) {
      setFetchLoading(true);
      axios.get(`${API_BASE_URL}/course/${courseId}`, {
        headers: { Authorization: `Bearer ${isValid ? isValid : localStorage.getItem("profToken")}` }
      })
      .then(response => {
          const course = response.data;
          console.log("Fetched course data:", course);
          // Map fetched data to form structure
          const formData = {
              nom: course.nom || "",
              categorieId: course.categorieId?._id || course.categorieId || "",
              description: course.description || "",
              level: course.level || "",
              languages: course.languages || "",
              image: course.image ? `${API_BASE_URL}/images/${course.image}` : null,
              modules: course.modules?.map(mod => ({
                  titre: mod.titre || "",
                  videos: mod.videos?.map(vid => ({
                      titrevd: vid.titrevd || "",
                      duree: vid.duree || "",
                      url: vid.url ? `${API_BASE_URL}/videos/${vid.url}` : null
                  })) || [{ titrevd: "", duree: "", url: null }]
              })) || [{ titre: "", videos: [{ titrevd: "", duree: "", url: null }] }]
          };
          setInitialCourseData(formData);
          if (formData.image) {
              setPreviewImage(formData.image);
          }
          const initialVideoPreviews = {};
          formData.modules.forEach((mod, modIndex) => {
              mod.videos.forEach((vid, vidIndex) => {
                  if (vid.url && typeof vid.url === 'string') {
                      initialVideoPreviews[`${modIndex}-${vidIndex}`] = vid.url;
                  }
              });
          });
          setVideoPreviews(initialVideoPreviews);
          setFetchLoading(false);
      })
      .catch(err => {
          console.error("Error fetching course data:", err);
          toast.error("Failed to load course data.");
          setError("Failed to load course data.");
          setFetchLoading(false);
      });
    } else if (!courseId) {
        toast.error("Course ID is missing.");
        navigate("/instructor/courses");
        setFetchLoading(false);
    }
    
  }, [courseId, profState, navigate, dispatch]);

  const validationSchema = Yup.object({
    nom: Yup.string()
      .required("Title is required")
      .min(3, "Title must be at least 3 characters long")
      .max(100, "Title must not exceed 100 characters"),
    categorieId: Yup.string().required("Category is required"),
    image: Yup.mixed().nullable(),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters long")
      .max(1000, "Description must not exceed 1000 characters"),
    level: Yup.string().required("Level is required"),
    languages: Yup.string().required("Language is required"),
    modules: Yup.array()
      .min(1, "At least one module is required")
      .of(
        Yup.object().shape({
          titre: Yup.string()
            .required("Module title is required")
            .min(3, "Module title must be at least 3 characters long"),
          videos: Yup.array()
            .min(1, "At least one video is required per module")
            .of(
              Yup.object().shape({
                titrevd: Yup.string()
                  .required("Video title is required")
                  .min(3, "Video title must be at least 3 characters long"),
                duree: Yup.string()
                  .required("Duration is required")
                  .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid duration format (HH:MM)"),
                url: Yup.mixed().nullable()
              })
            )
        })
      )
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Check authentication
      const { isValid, token, prof } = checkAuthentication();
      
      if (!isValid || !courseId) {
        toast.error("Authentication failed or Course ID missing.");
        navigate("/loginprof");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // 1. Prepare FormData
      const formData = new FormData();
      
      // Append text fields
      formData.append("nom", values.nom);
      formData.append("description", values.description);
      formData.append("categorieId", values.categorieId);
      formData.append("level", values.level);
      formData.append("languages", values.languages);
      // We use the authenticated professor ID, not one from the form
      // formData.append("professeurId", prof._id); // Might not be needed if backend uses auth user

      // Append NEW course image if it's a File object
      if (values.image instanceof File) {
        console.log("Adding NEW image:", values.image.name);
        formData.append("image", values.image);
      } else {
         console.log("Keeping existing image or no image.");
         // If values.image is null or a string (URL), don't append it.
         // The backend should handle not receiving an image as "keep the old one".
      }
      
      // Prepare modules metadata, including existing video URLs
      // Backend needs to differentiate between existing URLs and new uploads
      const modulesDataForBackend = values.modules.map(module => ({
        titre: module.titre,
        // Map videos: keep string URLs, use a placeholder for new File objects
        videos: module.videos.map(video => ({
          titrevd: video.titrevd,
          duree: video.duree,
          // If it's a file, send metadata but mark the URL for replacement
          // If it's a string (URL), send the URL string
          // If it's null/undefined, send that
          url: video.url instanceof File ? 'NEW_VIDEO_PLACEHOLDER' : (video.url || null) 
        }))
      }));
      
      formData.append("modules", JSON.stringify(modulesDataForBackend));
      console.log("Modules data sent to backend:", modulesDataForBackend);

      // Append only NEW video files
      let newVideoCount = 0;
      values.modules.forEach((module, moduleIndex) => {
        module.videos.forEach((video, videoIndex) => {
          if (video.url instanceof File) {
            // Check format (optional but good practice)
            const fileExtension = video.url.name.split('.').pop().toLowerCase();
            const acceptedFormats = ['mp4', 'avi', 'mkv'];
            if (acceptedFormats.includes(fileExtension)) {
                 console.log(`Adding NEW video file ${newVideoCount}:`, video.url.name);
                 // IMPORTANT: Backend's update logic needs to match these files 
                 // with the 'NEW_VIDEO_PLACEHOLDER' entries in the modules JSON
                 formData.append("url", video.url); 
                 newVideoCount++;
            } else {
                 console.warn(`Skipping invalid video format: ${video.url.name}`);
                 // Consider adding error handling here if format is strictly enforced
            }
          }
        });
      });
      console.log(`Sending ${newVideoCount} new video files.`);
      
      // Log FormData content for debugging (can be tricky with files)
      // for (let [key, value] of formData.entries()) {
      //    console.log(`${key}:`, value instanceof File ? value.name : value);
      // }
      
      // 4. Use axios PUT request
      const response = await axios.put(
        `${API_BASE_URL}/course/${courseId}`, 
        formData, 
        {
           headers: {
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'multipart/form-data' // Important for file uploads
           },
           // Optional: Add progress tracking like in create
           // onUploadProgress: progressEvent => { ... }
        }
      );

      console.log("Update Response received:", response.data);
      
      // 6. Process response - Use the action name you confirmed: updateCourse
      dispatch(updateCourse(response.data)); // Assuming response.data contains the updated course
      
      // No need to update professor profile here unless backend logic requires it
      
      // 7. Finalization
      toast.success("Course updated successfully!");
      // Optionally reset form if needed, or navigate away
      // resetForm(); // Might clear fields user wants to see
      // setPreviewImage(null); // Reset previews might be confusing
      // setVideoPreviews({});
      navigate("/instructor/courses"); // Navigate back to course list
      
    } catch (error) {
      console.error("Error updating course:", error);
      // Log detailed Axios error if available
      if (error.response) {
           console.error("Axios error response:", error.response.data);
           console.error("Axios error status:", error.response.status);
           console.error("Axios error headers:", error.response.headers);
      } else if (error.request) {
           console.error("Axios error request:", error.request);
      } else {
           console.error('Error message:', error.message);
      }
      
      // Display error message to user
      toast.error(error.response?.data?.message || error.message || "Error updating course");
      setError(error.response?.data?.message || error.message || "Unknown error updating course");
      
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleImagePreview = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFieldValue("image", initialCourseData?.image || null);
      setPreviewImage(initialCourseData?.image || null);
    }
  };

  const handleVideoPreview = (event, setFieldValue, moduleIndex, videoIndex) => {
    const file = event.currentTarget.files[0];
    const fieldName = `modules.${moduleIndex}.videos.${videoIndex}.url`;
    if (file) {
      setFieldValue(fieldName, file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviews(prev => ({
          ...prev,
          [`${moduleIndex}-${videoIndex}`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      const initialVideoUrl = initialCourseData?.modules?.[moduleIndex]?.videos?.[videoIndex]?.url;
      setFieldValue(fieldName, initialVideoUrl || null);
      setVideoPreviews(prev => ({
        ...prev,
        [`${moduleIndex}-${videoIndex}`]: initialVideoUrl || null
      }));
    }
  };

  if (fetchLoading) {
      return <div className="p-6 text-center">Loading course data...</div>;
  }

  if (error && !initialCourseData) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }
  
  if (!initialCourseData) {
      return <div className="p-6 text-center">Could not load course data.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Course: {initialCourseData?.nom}</h1>
      
      <Formik
        initialValues={initialCourseData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Course Title</label>
                <Field
                  name="nom"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <ErrorMessage name="nom" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Course Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImagePreview(e, setFieldValue)}
                  className="mt-1 block w-full"
                />
                {previewImage && (
                  <img src={previewImage} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded" />
                )}
                <ErrorMessage name="image" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <Field
                  as="select"
                  name="categorieId"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.titre}</option> 
                  ))}
                </Field>
                <ErrorMessage name="categorieId" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <Field
                  as="select"
                  name="level"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Field>
                <ErrorMessage name="level" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <Field
                  as="select"
                  name="languages"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a language</option>
                  <option value="fr">French</option>
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </Field>
                <ErrorMessage name="languages" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <Field
                as="textarea"
                name="description"
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Modules</h2>
              <FieldArray name="modules">
                {({ push: pushModule, remove: removeModule }) => (
                  <div className="space-y-4">
                    {values.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-md font-medium">Module {moduleIndex + 1}</h3>
                          {values.modules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeModule(moduleIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove Module
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Field
                            name={`modules.${moduleIndex}.titre`}
                            placeholder="Module Title"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <ErrorMessage
                            name={`modules.${moduleIndex}.titre`}
                            component="div"
                            className="text-red-500 text-sm"
                          />

                          <FieldArray name={`modules.${moduleIndex}.videos`}>
                            {({ push: pushVideo, remove: removeVideo }) => (
                              <div className="space-y-4">
                                {module.videos.map((video, videoIndex) => (
                                  <div key={videoIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                      <Field
                                        name={`modules.${moduleIndex}.videos.${videoIndex}.titrevd`}
                                        placeholder="Video Title"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                      />
                                      <ErrorMessage
                                        name={`modules.${moduleIndex}.videos.${videoIndex}.titrevd`}
                                        component="div"
                                        className="text-red-500 text-sm"
                                      />
                                    </div>

                                    <div>
                                      <Field
                                        name={`modules.${moduleIndex}.videos.${videoIndex}.duree`}
                                        placeholder="Duration (e.g., 10:30)"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                      />
                                      <ErrorMessage
                                        name={`modules.${moduleIndex}.videos.${videoIndex}.duree`}
                                        component="div"
                                        className="text-red-500 text-sm"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700">Video File</label>
                                      <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleVideoPreview(e, setFieldValue, moduleIndex, videoIndex)}
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                      />
                                      {videoPreviews[`${moduleIndex}-${videoIndex}`] && (
                                        <video
                                          key={videoPreviews[`${moduleIndex}-${videoIndex}`]}
                                          src={videoPreviews[`${moduleIndex}-${videoIndex}`]}
                                          controls
                                          className="mt-2 h-32 w-full object-cover rounded"
                                        />
                                      )}
                                      <ErrorMessage
                                        name={`modules.${moduleIndex}.videos.${videoIndex}.url`}
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>

                                    {module.videos.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeVideo(videoIndex)}
                                        className="text-red-600 hover:text-red-800 mt-2 self-start"
                                      >
                                        Remove Video
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => pushVideo({ titrevd: "", duree: "", url: null })}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  + Add Video
                                </button>
                              </div>
                            )}
                          </FieldArray>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => pushModule({ titre: "", videos: [{ titrevd: "", duree: "", url: null }] })}
                      className="text-green-600 hover:text-green-800"
                    >
                      + Add Module
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => navigate("/instructor/courses")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading || fetchLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting || loading ? "Updating Course..." : "Update Course"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditCoursePage;