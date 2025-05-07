import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const QuizResultsPage = () => {
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const { data } = await axios.get(
          `http://192.168.1.17:3000/quiz/${quizId}`
        );
        setQuiz(data);
        setResults(data.resultats || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des résultats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [quizId]);

  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Résultats du Quiz</h1>
        <div className="flex flex-col sm:flex-row justify-between mt-2">
          <h1 className="text-gray-600">
            Cours : {quiz?.courseId?.nom || "Non spécifié"}
          </h1>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Link
              to="/instructor/quizzes"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retour aux Quizzes
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apprenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedResults.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {result.apprenant_id?.userId?.name ||
                        "Apprenant non spécifié"}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {result.apprenant_id?.userId?.email ||
                        "Apprenant non spécifié"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{result.score}%</div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          result.score < 50
                            ? "bg-red-500"
                            : result.score < 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
