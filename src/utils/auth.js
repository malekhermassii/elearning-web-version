/**
 * Check if a user is currently logged in
 * @returns {boolean} True if a user is logged in
 */
import { logoutUser } from '../api';
import axios from 'axios';
//Vérifier si un utilisateur est connecté
export const isAuthenticated = () => {
  const localUser = localStorage.getItem('currentUser');
  const sessionUser = sessionStorage.getItem('currentUser');
  
  return !!(localUser || sessionUser);
};

/**
 * Get the currently logged in user's data
 * @returns {Object|null} The current user object or null if not logged in
 */
//Récupère les données de l'utilisateur depuis localStorage ou sessionStorage.
export const getCurrentUser = () => {
  const localUser = localStorage.getItem('currentUser');
  const sessionUser = sessionStorage.getItem('currentUser');
  
  if (localUser) {
    return JSON.parse(localUser);
  } else if (sessionUser) {
    return JSON.parse(sessionUser);
  }
  
  return null;
};



// Dans votre composant
export const logout = async () => {
  try {
    await logoutUser();
    // Nettoyer le stockage local
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("userToken");
    // Supprimer le token des headers axios
    delete axios.defaults.headers.common["Authorization"];
    // Rediriger vers la page de connexion appropriée
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/instructor')) {
      window.location.href = '/loginprof';
    } else if (currentPath.startsWith('/admin')) {
      window.location.href = '/loginadmin';
    } else {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // Même en cas d'erreur, on nettoie le stockage et on redirige
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("userToken");
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = '/login';
  }
};



/**Ajouter un abonnement à un utilisateur
 * Add a subscription to user profile
 * @param {Object} subscriptionData - The subscription data to save
 */

export const addSubscription = (subscriptionData) => {
  const user = getCurrentUser();
  
  if (!user) return false;
  
  // Add subscription info to user data
  const updatedUser = {
    ...user,
    subscription: {
      ...subscriptionData,
      startDate: new Date().toISOString(),
      isActive: true
    }
  };
  
  // Save updated user data
  if (localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  } else {
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }
  
  return true;
};

/**
 * Check if user has an active subscription
 * @returns {boolean} True if user has an active subscription
 */
export const hasActiveSubscription = () => {
  const user = getCurrentUser();
  return !!(user && user.subscription && user.subscription.isActive);
};

/**
 * Récupère la liste des cours auxquels l'utilisateur est inscrit.
 * @returns {Array} Array of enrolled course IDs
 */
export const getEnrolledCourses = () => {
  const user = getCurrentUser();
  return (user && user.enrolledCourses) || [];
};

/**
 * inscrit user in a course
 * @param {string} courseId - The course ID to enroll in
 * @returns {boolean} True if enrollment was successful
 */
export const enrollInCourse = (courseId) => {
  const user = getCurrentUser();
  
  if (!user) return false;
  
  // Initialize enrolledCourses array if it doesn't exist
  const enrolledCourses = user.enrolledCourses || [];
  
  // verifier user 3ml inscrit 3l cours ou non
  if (enrolledCourses.includes(courseId)) return true;
  
  // Add course to enrolled courses
  const updatedUser = {
    ...user,
    enrolledCourses: [...enrolledCourses, courseId],
    enrollmentDates: {
      ...(user.enrollmentDates || {}),
      [courseId]: new Date().toISOString()
    }
  };
  
  // Save updated user data
  if (localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  } else {
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }
  
  return true;
};

/**
 * Update user profile information
 * @param {Object} updatedData - User profile data to update (fullName, email, password)
 * @returns {boolean} True if update was successful
 */
export const updateUserProfile = (updatedData) => {
  const user = getCurrentUser();
  
  if (!user) return false;
  
  // Create updated user object
  const updatedUser = {
    ...user,
    ...updatedData,
    // Add a lastUpdated timestamp
    lastUpdated: new Date().toISOString()
  };
  
  // Save updated user data
  if (localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  } else {
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }
  
  return true;
}; 