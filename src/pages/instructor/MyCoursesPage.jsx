import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../api";
import { deleteCourse } from "../../redux/slices/courseSlice";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://192.168.1.17:3000";

const InstructorCoursesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Récupérer le professeur connecté et tous les cours
  const currentProfessor = useSelector((state) => state.authprof.prof);
  const allCourses = useSelector((state) => state.courses.courses || []);

  // Vérifier l'authentification
  useEffect(() => {
    if (!currentProfessor) {
      toast.warning("Vous devez être connecté pour accéder à cette page");
      navigate("/loginprof");
      return;
    }
  }, [currentProfessor, navigate]);

  // Filtrer les cours pour n'afficher que ceux du professeur connecté
  const courses = currentProfessor
    ? allCourses.filter(course => {
        const courseProf = course.professeurId;
        if (typeof courseProf === "object" && courseProf !== null) {
          return courseProf._id === currentProfessor._id;
        } else if (courseProf) {
          return courseProf === currentProfessor._id;
        }
        return false;
      })
    : [];

  useEffect(() => {
    loadCourses();
  }, [dispatch]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      await dispatch(fetchCourses());
      setError(null);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Error loading courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (course) => {
    if (!course || !course._id) {
      setDeleteError("Cannot delete this course: Missing or invalid ID");
      return;
    }
    setCourseToDelete(course);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete || !courseToDelete._id) {
      setDeleteError("Invalid course ID");
      return;
    }

    try {
      const token = localStorage.getItem('profToken') || sessionStorage.getItem('profToken');
      
      if (!token) {
        setDeleteError("Session expired, please log in again");
        return;
      }

      console.log("Attempting to delete course:", courseToDelete._id);

      const response = await axios.delete(`${API_URL}/course/${courseToDelete._id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        // Mise à jour du state Redux
        dispatch(deleteCourse(courseToDelete._id));
        // Recharger la liste des cours
        await loadCourses();
        setShowDeleteModal(false);
        setCourseToDelete(null);
        toast.success("Course deleted successfully!");
      } else {
        console.warn("Delete request successful but status is not 200:", response.status);
        setDeleteError(response.data?.message || `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur détaillée lors de la suppression:", error);
      console.error("Response de l'erreur:", error.response);
      
      if (error.response?.status === 404) {
        setDeleteError("Course no longer exists");
      } else if (error.response?.status === 403) {
        setDeleteError("You do not have permission to delete this course");
      } else if (error.response?.status === 401) {
        setDeleteError("Session expired, please log in again");
      } else {
        setDeleteError(error.response?.data?.message || "An error occurred while deleting the course");
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
    setDeleteError(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600">Manage and track all your courses</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div />
        <Link
          to="/instructor/courses/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          Create New Course
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Course Name", "Picture", "Description", "Category", "Level", "Language", "Modules", "Status", "Actions"].map((title) => (
                  <th key={title} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center">No courses found</td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id}>
                    <td className="px-6 py-4">
                      <h3 className="text-base font-semibold text-gray-900">{course.nom}</h3>
                    </td>
                    <td className="px-6 py-4">
                      <img
                        className="h-14 w-24 object-cover rounded"
                        src={`http://192.168.1.17:3000/Public/Images/${course.image}`}
                        alt={course.nom}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                    </td>
                    <td className="px-6 py-4">{course.categorieId?.titre || "-"}</td>
                    <td className="px-6 py-4">{course.level}</td>
                    <td className="px-6 py-4">{course.languages}</td>
                    <td className="px-6 py-4">
                      {course.modules?.map((module, index) => (
                        <div key={index} className="text-sm">{module.titre}</div>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        course.statut === "accepted" ? "bg-green-100 text-green-800" 
                        : course.statut === "rejected" ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {course.statut || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/instructor/courses/${course._id}`} className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(course)}
                        className="text-red-600 hover:text-red-900 ml-2"
                        title="Delete course"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Course</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete "{courseToDelete.nom}"? This action cannot be undone.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{deleteError}</div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCoursesPage;
