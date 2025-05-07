import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'; // Assurez-vous d'avoir axios installé
import { fetchCourses } from '../../api'; // Assurez-vous que le chemin est correct

const InstructorDashboardPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer le professeur connecté et les cours depuis Redux
  const currentProfessor = useSelector((state) => state.authprof.prof);
  const courses = useSelector((state) => state.courses.courses || []);

  console.log("[Dashboard] Professeur connecté:", currentProfessor);
  console.log("[Dashboard] Tous les cours reçus:", courses);

  // Filtrer les cours du professeur connecté
  const instructorCourses = currentProfessor
    ? courses.filter(course => {
        console.log(`[Dashboard] Filtrage - Cours ID: ${course._id}, Professeur du cours: ${course.professeurId}, Professeur connecté: ${currentProfessor._id}`);
        // Accéder à l'_id dans l'objet professeurId du cours
        const courseProf = String(course.professeurId?._id);
        const currentProf = String(currentProfessor._id);
        // console.log(`Comparaison: courseProf=${courseProf}, currentProf=${currentProf}`); // Log précédent, peut être décommenté si besoin
        return courseProf === currentProf;
      })
    : [];

  console.log("[Dashboard] Cours filtrés:", instructorCourses);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Dispatch l'action pour charger les cours
        await dispatch(fetchCourses());
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des cours:", err);
        setError("Erreur lors du chargement des données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    // Charger les données uniquement si un professeur est potentiellement connecté
    // (fetchCourses chargera tous les cours, le filtrage se fait ensuite)
    loadData();
  }, [dispatch]);

  // Calculer les statistiques spécifiques demandées
  const numberOfCourses = instructorCourses.length;
  const totalStudents = instructorCourses.reduce((sum, course) => 
    sum + (course.apprenantEnroll?.length || course.enrolledCount || 0)
  , 0);
  const averageRating = instructorCourses.length > 0 
    ? (instructorCourses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / numberOfCourses).toFixed(1) 
    : '0.0';

  console.log("[Dashboard] Nombre de cours:", numberOfCourses);
  console.log("[Dashboard] Total étudiants:", totalStudents);
  console.log("[Dashboard] Note moyenne:", averageRating);

  // État de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Si aucun professeur n'est connecté
  if (!currentProfessor) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-600">Veuillez vous connecter en tant que professeur pour voir votre tableau de bord.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord du professeur</h1>
        <p className="text-gray-600">Bienvenue, {currentProfessor.name}</p>
      </div>

      {/* Métriques Résumées Spécifiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Nombre de cours */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Nombre de cours créés</p>
              <p className="text-2xl font-bold text-gray-900">{numberOfCourses}</p>
            </div>
          </div>
        </div>

        {/* Total des étudiants */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total des étudiants inscrits</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        {/* Note moyenne */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Note moyenne des cours</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
                <p className="ml-1 text-gray-500">/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vous pouvez ajouter ici d'autres sections si nécessaire, par exemple un lien vers la gestion des cours */}

    </div>
  );
};

export default InstructorDashboardPage; 

