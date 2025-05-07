import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchapprenants } from "../../api";
import { deleteApprenant } from "../../redux/slices/apprenantSlice";

const StudentManagementPage = () => {
  const dispatch = useDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apprenants = useSelector((state) => state.apprenants.apprenants);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchapprenants());
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement des apprenants:", error);
        setError("Erreur lors du chargement des apprenants");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      const response = await axios.delete(
        `http://192.168.1.17:3000/apprenant/${selectedStudent._id}`
      );

      if (response.status === 200) {
        dispatch(deleteApprenant(selectedStudent._id));
        setIsDeleteModalOpen(false);
        setSelectedStudent(null);
        alert("Apprenant supprimé avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert(
        error.response?.data?.message ||
          "Erreur lors de la suppression de l'apprenant"
      );
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600">Manage students on the platform</p>
      </div>

      {loading ? (
        <p>Loading learners...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    DateOfBirth
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Certificat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Subscription
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(apprenants) && apprenants.length > 0 ? (
                  apprenants.map((student) => (
                    <tr
                      key={student._id || student.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.userId?.name || "Non spécifié"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {student.userId?.email || "Non spécifié"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {student.userId?.dateNaissance || "Non spécifié"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {student.userId?.telephone || "Non spécifié"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {student.certificat_id?.length > 0 ? "Oui" : "Non"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {student.certificat_id?.length > 0
                          ? student.certificat_id
                              .map((c) => c.courseId?.nom)
                              .filter(Boolean)
                              .join(", ")
                          : "Non spécifié"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {student.abonnement_id?.planId?.name || "Non spécifié"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsViewModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      No learners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal de visualisation */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Learner Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {selectedStudent.userId?.name || "Non spécifié"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">
                  {selectedStudent.userId?.email || "Non spécifié"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">DateOfBirth</p>
                <p className="font-medium">
                  {selectedStudent.userId?.dateNaissance || "Non spécifié"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">
                  {selectedStudent.userId?.telephone || "Non spécifié"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Certificat</p>
                <p className="font-medium">
                  {selectedStudent.certificat_id?.length > 0 ? "Oui" : "Non"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">course</p>
                <p className="font-medium">
        
                  {selectedStudent.certificat_id?.length > 0
                    ? selectedStudent.certificat_id
                        .map((c) => c.courseId?.nom)
                        .filter(Boolean)
                        .join(", ")
                    : "Non spécifié"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SubscriptionType</p>
                <p className="font-medium">
                  {selectedStudent.abonnement_id?.planId?.name ||
                    "Non spécifié"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {isDeleteModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete the learner{" "}
              {selectedStudent.userId?.[0]?.name || "this learner"} ? This
              action is irreversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Exit
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

export default StudentManagementPage;
