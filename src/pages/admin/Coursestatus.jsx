import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../api";
import { acceptercourse, refusercourse } from "../../redux/slices/courseSlice";
import axios from "axios";

const CourseStatus = () => {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.courses.courses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoError, setVideoError] = useState(null);

  // Configuration de base d'axios
  const baseURL = "http://192.168.1.17:3000";
  axios.defaults.baseURL = baseURL;

  // Configuration de l'intercepteur pour l'authentification
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        await dispatch(fetchCourses());
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        setError("Impossible de charger les cours.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [dispatch]);

  const handleApproveCourse = async (course) => {
    if (!course || !course._id) {
      console.error("Données du cours invalides pour l'approbation");
      alert("Erreur: Données du cours manquantes");
      return;
    }

    try {
    
      const response = await axios.put(`/course/${course._id}/accepter`);

      if (response.status === 200 && response.data) {
        dispatch(acceptercourse({ id: course._id }));
        alert("Cours approuvé avec succès !");
        closeViewModal();
        // Recharger la liste des cours
        dispatch(fetchCourses());
      }
    } catch (err) {
      console.error("Erreur lors de l'approbation :", err);
      const errorMessage =
        err.response?.data?.message ||
        "Une erreur est survenue lors de l'approbation du cours.";
      alert(errorMessage);
    } 
  };

  const handleRejectCourse = async (course) => {
    if (!course || !course._id) {
      console.error("Données du cours invalides pour le refus");
      alert("Erreur: Données du cours manquantes");
      return;
    }

    try {
     
      const response = await axios.put(`/course/${course._id}/refuser`);

      if (response.status === 200 && response.data) {
        dispatch(refusercourse(course._id));
        alert("Cours refusé avec succès !");
        closeViewModal();
        // Recharger la liste des cours
        dispatch(fetchCourses());
      }
    } catch (err) {
      console.error("Erreur lors du refus :", err);
      if (err.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        // Rediriger vers la page de connexion ou rafraîchir le token
      } else {
        const errorMessage =
          err.response?.data?.message ||
          "Une erreur est survenue lors du refus du cours.";
        alert(errorMessage);
      }
    } 
  };

  const handleOpenVideo = (video) => {
    console.log("Données vidéo reçues:", video);

    if (!video) {
      console.error("Aucun objet vidéo fourni");
      setVideoError("Aucune donnée vidéo disponible");
      setIsVideoModalOpen(true);
      return;
    }

    // Construction de l'URL complète
    const videoUrl = `http://192.168.1.17:3000/Public/Videos/${video.url}`;
    console.log("URL vidéo construite:", videoUrl);
    console.log("Titre de la vidéo:", video.titre);

    // Nettoyage de la durée si elle est entourée de guillemets
    const cleanedDuration = video.duree
      ? video.duree.replace(/^"|"$/g, "")
      : "Durée inconnue";

    setSelectedVideo({
      _id: video._id,
      url: videoUrl,
      titre: video.titre,
      duree: cleanedDuration,
    });
    console.log("État selectedVideo:", {
      _id: video._id,
      url: videoUrl,
      titre: video.titre,
      duree: cleanedDuration,
    });
    setVideoError(null);
    setIsVideoModalOpen(true);
  };

  const handleVideoError = (e) => {
    console.error("Erreur de lecture vidéo:", e);
    setVideoError("Impossible de charger la vidéo");
  };

  const openViewModal = async (course) => {
    if (!course || !course._id) {
      console.error("Données du cours invalides");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/course/${course._id}`);
      if (response.data) {
        setSelectedCourse(response.data);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails :", error);
      const errorMessage =
        error.response?.data?.message ||
        "Impossible de charger les détails du cours";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeViewModal = () => {
    setSelectedCourse(null);
    setIsViewModalOpen(false);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setVideoError(null);
    setIsVideoModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 mt-10">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours</h1>
        <p className="text-gray-600">
          Consultez et gérez les cours soumis par les instructeurs.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Langue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses?.map((course) => (
                  <tr key={course._id}>
                    <td className="text-sm px-4 font-medium text-gray-900">
                      {course.nom}
                    </td>
                    <td className="px-6 py-4 flex items-center">
                      <img
                        src={`http://192.168.1.17:3000/Public/Images/${course.image}`}
                        alt="course"
                        className="h-10 w-10 rounded-lg object-cover mr-3"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/40";
                          e.target.alt = "Image non disponible";
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.categorieId?.titre || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.level}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {course.languages}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.statut === "accepted"
                            ? "bg-green-100 text-green-800"
                            : course.statut === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.statut.charAt(0).toUpperCase() +
                          course.statut.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => openViewModal(course)}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 mr-2"
                      >
                        Voir
                      </button>
                      {course.statut !== "accepted" && (
                        <button
                          onClick={() => handleApproveCourse(course)}
                          className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 mr-2"
                        >
                          Approuver
                        </button>
                      )}
                      {course.statut !== "rejected" && (
                        <button
                          onClick={() => handleRejectCourse(course)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {courses?.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      Aucun cours trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de détail du cours */}
      {isViewModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-md max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Détails du Cours</h2>
              <button
                onClick={closeViewModal}
                className="text-gray-500 text-2xl leading-none hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <img
                  src={`http://192.168.1.17:3000/Public/Images/${selectedCourse.image}`}
                  alt="Course"
                  className="w-full md:w-48 h-48 object-cover rounded"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/192x192";
                    e.target.alt = "Image non disponible";
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{selectedCourse.nom}</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Catégorie:</span>{" "}
                    {selectedCourse.categorieId?.titre || "-"}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Description:</span>{" "}
                    {selectedCourse.description}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Niveau:</span>{" "}
                    {selectedCourse.level}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Langue:</span>{" "}
                    {selectedCourse.languages}
                  </p>
                </div>
              </div>

              {selectedCourse.modules?.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Modules</h3>
                  <div className="space-y-4">
                    {selectedCourse.modules.map((module) => (
                      <div
                        key={module._id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-lg">
                            {module.titre}
                          </h4>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {module.nbrVideo || 0} vidéos
                          </span>
                        </div>
                        {module.videos?.length > 0 ? (
                          <div className="grid gap-3">
                            {module.videos.map((video) => (
                              <div
                                key={video._id}
                                className="flex items-center justify-between bg-white p-3 rounded border hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleOpenVideo(video)}
                              >
                                <div className="flex items-center">
                                  <div className="text-blue-500 mr-3">
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="font-medium">{video.titrevd}</p>
                                    <p className="text-sm text-gray-500">
                                      Durée:{" "}
                                      {video.duree
                                        ? video.duree.replace(/^"|"$/g, "")
                                        : "Non spécifiée"}
                                    </p>
                                    {video.url && (
                                      <p className="text-xs text-gray-400">
                                        Fichier: {video.url}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  className="text-blue-600 hover:text-blue-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenVideo(video);
                                  }}
                                >
                                  Voir
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Aucune vidéo dans ce module
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Aucun module disponible</p>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
                {selectedCourse.statut !== "accepted" && (
                  <button
                    onClick={() => handleApproveCourse(selectedCourse)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Approuver
                  </button>
                )}
                {selectedCourse.statut !== "rejected" && (
                  <button
                    onClick={() => handleRejectCourse(selectedCourse)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Rejeter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de lecture vidéo */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={closeVideoModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl z-10"
            >
              &times;
            </button>

            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
              {videoError ? (
                <div className="flex flex-col items-center justify-center h-full text-white p-4">
                  <p className="text-xl text-center">{videoError}</p>
                </div>
              ) : selectedVideo ? (
                <video
                  className="w-full h-full object-contain"
                  controls
                  src={selectedVideo.url}
                  onError={handleVideoError}
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <p className="text-xl">Aucune vidéo sélectionnée</p>
                </div>
              )}
            </div>

            {selectedVideo && !videoError && (
              <div className="bg-black bg-opacity-75 p-4 mt-2 rounded-lg">
                <h3 className="text-xl font-semibold text-white">
                  {selectedVideo.titrevd}
                </h3>
                <p className="text-gray-300 mt-1">
                  Durée: {selectedVideo.duree}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseStatus;
