import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { deleteQuiz } from "../../redux/slices/quizSlice";
import { toast } from "react-toastify";
import { fetchCourses , fetchQuiz} from "../../api";

const CourseQuizzesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer le professeur connecté, les cours et les quiz
  const currentProfessor = useSelector((state) => state.authprof.prof);
  const allCourses = useSelector((state) => state.courses.courses || []);
  const allQuizs = useSelector((state) => state.quizs.quizs || []);

  // Vérifier l'authentification
  useEffect(() => {
    if (!currentProfessor) {
      toast.warning("Vous devez être connecté pour accéder à cette page");
      navigate("/loginprof");
      return;
    }
  }, [currentProfessor, navigate]);

  // Charger les cours et les quiz
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(fetchCourses()),
          dispatch(fetchQuiz())
        ]);
        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Filtrer d'abord les cours du professeur
  const professorCourses = allCourses.filter(course => {
    const courseProf = course.professeurId;
    if (typeof courseProf === "object" && courseProf !== null) {
      return courseProf._id === currentProfessor?._id;
    } else if (courseProf) {
      return courseProf === currentProfessor?._id;
    }
    return false;
  });

  // Filtrer les quiz qui appartiennent aux cours du professeur
  const quizs = allQuizs.filter(quiz => {
    // Vérifier que courseId existe et a un _id avant de comparer
    if (!quiz.courseId || !quiz.courseId._id) return false;
    
    return professorCourses.some(course => course._id === quiz.courseId._id);
  });

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      const response = await axios.delete(
        `http://192.168.1.17:3000/quiz/${quizToDelete._id}`
      );

      if (response.status === 200) {
        dispatch(deleteQuiz({ _id: quizToDelete._id }));
        setShowDeleteConfirmation(false);
        setQuizToDelete(null);
        await dispatch(fetchQuiz());
        alert("Quiz supprimé avec succès !");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      if (error.response?.status === 404) {
        alert("Ce quiz n'existe plus.");
      } else if (error.response?.status === 403) {
        alert("Vous n'avez pas la permission de supprimer ce quiz.");
      } else {
        alert(error.response?.data?.message || "Erreur lors de la suppression du quiz.");
      }
    }
  };

  const initiateDelete = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteConfirmation(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setQuizToDelete(null);
  };

  const getLimitedQuestions = (quiz) => {
    if (!quiz || !quiz.questionQuiz_id) return [];
    return quiz.questionQuiz_id.slice(0, 5);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Course Quizzes</h1>
        <p className="text-gray-600">Create and manage quizzes for your courses</p>
      </div>

      <div className="mb-6 flex justify-between">
        <div></div>
        <Link
          to="/instructor/quizzes/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Create New Quiz
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      ) : professorCourses.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-yellow-700">Vous n'avez pas encore créé de cours. Créez d'abord un cours pour pouvoir ajouter des quiz.</p>
        </div>
      ) : quizs.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-yellow-700">Vous n'avez pas encore créé de quiz pour vos cours.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {quizs.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {quiz.courseId?.nom || "Cours non spécifié"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {quiz.questionQuiz_id.length} {quiz.questionQuiz_id.length > 1 ? "questions" : "question"}
                  </p>
                </div>
                <div className="flex space-x-2">
              
                  <Link 
                     to={`/instructor/quizzes/${quiz._id}/detail`}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                  >
                    View
                  </Link>
                  <Link 
                    to={`/instructor/quizzes/${quiz._id}/edit`} 
                    className="inline-flex items-center px-3 py-1.5 text-sm text-green-600 bg-green-50 rounded-md hover:bg-green-100"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => initiateDelete(quiz)} 
                    className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Options</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réponse correcte</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getLimitedQuestions(quiz).map((question, index) => (
                      <tr key={`${quiz._id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{question.question}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {question.options?.length > 0 ? (
                            <ul className="list-disc pl-5">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex}>{option}</li>
                              ))}
                            </ul>
                          ) : (
                            "Aucune option"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">{question.reponseCorrecte}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer ce quiz ?</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button onClick={cancelDelete} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Exit</button>
              <button onClick={handleDeleteQuiz} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseQuizzesPage;
