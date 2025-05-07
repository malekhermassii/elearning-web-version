import React from "react";
import axios from "axios";
import { setCourses } from "./redux/slices/courseSlice";
import { setCategories } from "./redux/slices/categorieSlice";
import { setPlan } from "./redux/slices/planSlice";
import {setQuizs} from "./redux/slices/quizSlice"
import {
  setProfesseurs,
  setLoading,
  setError,
} from "./redux/slices/professorSlice";
import { setApprenants } from "./redux/slices/apprenantSlice";
import { setDemandes } from "./redux/slices/demandeSlice";
import { fetchSubscriptions } from "./redux/slices/abonnement/abonnementSlice";
import { setPaiments } from "./redux/slices/abonnement/paiementSlice";
import { setAviss } from "./redux/slices/avisSlice";
import { setQuestions } from "./redux/slices/questionSlice";
import { setusers } from "./redux/slices/userSlice";
import { Form } from "react-router-dom";

const API_URL = "http://192.168.1.17:5000";

// Configuration de l'instance axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Export de l'instance API pour utilisation directe dans les composants
export default api;

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    const token =
      localStorage.getItem("adminToken") || 
      localStorage.getItem("userToken") ||
      localStorage.getItem("profToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Categories API
export const fetchCategories = () => async (dispatch) => {
  try {
    const response = await api.get("/categorie");
    if (response.status !== 200) throw new Error("Failed to fetch categories");
    dispatch(setCategories(response.data));
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Dispatch une action d'erreur si nécessaire
  }
};
export const fetchReview = () => async (dispatch) => {
  try {
    const response = await api.get("/feedback");
    if (response.status !== 200) throw new Error("Failed to fetch feddback");
    dispatch(setAviss(response.data));
  } catch (error) {
    console.error("Error fetching feedback:", error);
  }
};
export const fetchQuestion = () => async (dispatch) => {
  try {
    const response = await api.get("/question");
    if (response.status !== 200) throw new Error("Failed to fetch question");
    dispatch(setQuestions(response.data));
  } catch (error) {
    console.error("Error fetching question:", error);
  }
};

export const fetchUsers = () => async (dispatch) => {
  try {
    const response = await api.get("/users");
    if (response.status !== 200) throw new Error("Failed to fetch user");
    dispatch(setusers(response.data));
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};
export const fetchCourses = () => async (dispatch) => {
  try {
    const response = await api.get("/course");
    if (response.status !== 200) throw new Error("Failed to fetch courses");
    dispatch(setCourses(response.data));
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Maybe dispatch an error action here, like dispatch(setCoursesError(error.message));
  }
};
export const fetchabonnements = () => async (dispatch) => {
  try {
    const response = await api.get("/admin/subscriptions");
    if (response.status !== 200) throw new Error("Failed to fetch courses");
    dispatch(fetchSubscriptions(response.data));
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Maybe dispatch an error action here, like dispatch(setCoursesError(error.message));
  }
};
export const fetchpayement = () => async (dispatch) => {
  try {
    const response = await api.get("/admin/payments");
    if (response.status !== 200) throw new Error("Failed to fetch payments");
    dispatch(setPaiments(response.data));
  } catch (error) {
    console.error("Error fetching payments:", error);
  }
};
export const fetchQuiz = () => async (dispatch) => {
  try {
    const response = await api.get("/quiz");
    if (response.status !== 200) throw new Error("Failed to fetch quiz");
    dispatch(setQuizs(response.data));
  } catch (error) {
    console.error("Error fetching quiz:", error);
  }
};

export const fetchprofesseur = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get("/professeur");
    if (response.status !== 200) throw new Error("Failed to fetch prof");

    dispatch(setProfesseurs(response.data));
    dispatch(setError(null));
  } catch (error) {
    console.error("Error fetching prof:", error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};
export const fetchdemandes = () => async (dispatch) => {
  try {
    const response = await api.get("/demandes");
    if (response.status !== 200) throw new Error("Failed to fetch demande");

    dispatch(setDemandes(response.data));
    console.log("demandes reçus :", response.data);
  } catch (error) {
    console.error("Error fetching demandes:", error);
    // Maybe dispatch an error action here, like dispatch(setCoursesError(error.message));
  }
};

export const fetchapprenants = () => async (dispatch) => {
  try {
    const response = await api.get("/apprenant");
    if (response.status !== 200) throw new Error("Failed to fetch apprenants");

    dispatch(setApprenants(response.data));
    console.log("aprrenant reçus :", response.data);
  } catch (error) {
    console.error("Error fetching aprrenant:", error);
    // Maybe dispatch an error action here, like dispatch(setCoursesError(error.message));
  }
};

export const getquizById = async (quizId) => {
  try {
    console.log("Fetching course with ID:", quizId);
    const response = await api.get(`/quiz/${quizId}`);
    console.log("Course data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du cours:", error);
    throw (
      error.response?.data || {
        message: "Erreur lors de la récupération du cours",
      }
    );
  }
};

export const getCourseById = async (courseId) => {
  try {
    console.log("Fetching course with ID:", courseId);
    const response = await api.get(`/course/${courseId}`);
    console.log("Course data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du cours:", error);
    throw (
      error.response?.data || {
        message: "Erreur lors de la récupération du cours",
      }
    );
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/course", courseData);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Erreur lors de la création du cours" }
    );
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/course/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Erreur lors de la mise à jour du cours",
      }
    );
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Erreur lors de la suppression du cours",
      }
    );
  }
};

// Fonctions pour les inscriptions aux cours
export const enrollInCourse = async (courseId) => {
  try {
    const response = await api.post(`/enroll/${courseId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Erreur lors de l'inscription au cours",
      }
    );
  }
};

// Fonctions pour la progression des cours
export const updateCourseProgress = async (courseId, moduleId, videoId) => {
  try {
    const response = await api.put(
      `/progress/update/${courseId}/${moduleId}/${videoId}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Erreur lors de la mise à jour de la progression",
      }
    );
  }
};

export const getCourseProgress = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/courseprogress`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      throw new Error("Format de données invalide");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error);
    throw error;
  }
};

export const fetchplan = () => async (dispatch) => {
  try {
    const response = await api.get("/planabonnement");
    if (response.status !== 200) throw new Error("Failed to fetch plan");
    dispatch(setPlan(response.data));
  } catch (error) {
    console.error("Error fetching plan:", error);
  }
};

//get one prof
export const fetchProfessor = (professeurId) => async (dispatch) => {
  try {
    console.log("Fetching course with ID:", professeurId);
    const response = await api.get(`/professeur/${professeurId}`);
    console.log("Course data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du cours:", error);
    throw (
      error.response?.data || {
        message: "Erreur lors de la récupération du cours",
      }
    );
  }
};
export const logoutUser = async () => {
  try {
    const response = await api.post("/logout");

    // Supprimer les données de l'utilisateur du stockage local
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("token");

    // Supprimer le token de l'instance axios
    delete api.defaults.headers.common["Authorization"];

    return response.data;
  } catch (error) {
    // En cas d'erreur, on nettoie quand même le stockage local
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];

    throw new Error(error.response?.data?.message || "Échec de la déconnexion");
  }
};

export const logoutProf = async () => {
  try {
    const token = localStorage.getItem("profToken");
    if (!token) {
      // Si pas de token, on nettoie quand même le stockage local
      cleanupStorage();
      return;
    }

    const response = await api.post("/logoutprof", {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    cleanupStorage();
    return response.data;
  } catch (error) {
    // En cas d'erreur, on nettoie quand même le stockage local
    cleanupStorage();
    console.error("Erreur de déconnexion:", error);
    return;
  }
};
export const logoutAdmin = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      // Si pas de token, on nettoie quand même le stockage local
      cleanupStorage();
      return;
    }

    const response = await api.post("/adminlogout", {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    cleanupStorage();
    return response.data;
  } catch (error) {
    // En cas d'erreur, on nettoie quand même le stockage local
    cleanupStorage();
    console.error("Erreur de déconnexion:", error);
    return;
  }
};
// Fonction utilitaire pour nettoyer le stockage
const cleanupStorage = () => {
  localStorage.removeItem("currentadmin");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentprof");
  localStorage.removeItem("token");
  localStorage.removeItem("userToken");
  localStorage.removeItem("profToken");
  sessionStorage.removeItem("currentadmin");
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("currentprof");
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("token");
  delete api.defaults.headers.common["Authorization"];
};

