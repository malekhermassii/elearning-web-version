import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchdemandes } from "../../api";
import { accepterDemande, refuserDemande } from "../../redux/slices/demandeSlice";

const InstructorApplicationsPage = () => {
  const dispatch = useDispatch();
  const demandes = useSelector((state) => state.demandes.demandes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInstructorData, setNewInstructorData] = useState({
    meetLink: "",
    dateEntretien: "",
  });

  useEffect(() => {
    const loadDemandes = async () => {
      try {
        setLoading(true);
        await dispatch(fetchdemandes());
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        setError("Impossible de charger les demandes.");
      } finally {
        setLoading(false);
      }
    };

    loadDemandes();
  }, [dispatch]);

  const handleInputChange = (e) => {
    setNewInstructorData({ ...newInstructorData, [e.target.name]: e.target.value });
  };

  const generateMeetLink = () => {
    const randomLink = "https://meet.google.com/" + Math.random().toString(36).substring(2, 7);
    setNewInstructorData({ ...newInstructorData, meetLink: randomLink });
  };

  const handleScheduleInterview = async () => {
    try {
      const response = await axios.put(
        `http://192.168.1.17:3000/demandes/${selectedApplication._id}/accepter`,
        newInstructorData
      );
      if (response.status === 200) {
        alert("Maintenance scheduled successfully !");
        dispatch(accepterDemande({ id: selectedApplication._id }));
       
     
        setIsCreateModalOpen(false);
        setSelectedApplication(null);
        await dispatch(fetchdemandes());
      }
    } catch (err) {
      console.error("Error while accepting :", err);
      alert("An error has occurred.");
    }
  };

  const rejectApplication = async (id) => {
    try {
      const response = await axios.put(
        `http://192.168.1.17:3000/demandes/${id}/refuser`
      );
      if (response.status === 200) {
        alert("Request successfully denied !");
        dispatch(refuserDemande(id));
       
        closeViewModal();
        await dispatch(fetchdemandes());
      }
    } catch (err) {
      console.error("Refusal error:", err);
      alert("Error while refusing the request.");
    }
  };

  const openViewModal = (application) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedApplication(null);
    setIsViewModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 mt-10">
        <h1 className="text-2xl font-bold text-gray-900">Instructor Applications</h1>
        <p className="text-gray-600">
          Review and manage applications from potential instructors.
        </p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Instructor", "Speciality", "Country", "BirthDate", "CV", "Topic", "Status", "Actions"].map(
                    (heading, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demandes?.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          {application.name?.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-semibold text-gray-900">
                            {application.name}
                          </div>
                          <div className="text-xs text-gray-500">{application.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{application.speciality}</td>
                    <td className="px-6 py-4">{application.country}</td>
                    <td className="px-6 py-4">{application.birthDate}</td>
                    <td className="px-6 py-4">{application.cv}</td>
                    <td className="px-6 py-4">{application.topic}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.statut === "approved"
                          ? "bg-green-100 text-green-800"
                          : application.statut === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-yellow-800"
                      }`}>
                        {application.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => openViewModal(application)}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 mr-2"
                      >
                        View
                      </button>
                     
                        <>
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setIsCreateModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectApplication(application._id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </>
                  
                    </td>
                  </tr>
                ))}
                {demandes?.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      No instructor applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-md max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Application Details</h2>
              <button onClick={closeViewModal} className="text-gray-500">×</button>
            </div>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedApplication.name}</p>
              <p><strong>Email:</strong> {selectedApplication.email}</p>
              <p><strong>Speciality:</strong> {selectedApplication.speciality}</p>
              <p><strong>Country:</strong> {selectedApplication.country}</p>
              <p><strong>Birth Date:</strong> {selectedApplication.birthDate}</p>
              <p><strong>CV:</strong> {selectedApplication.cv}</p>
              <p><strong>Topic:</strong> {selectedApplication.topic}</p>
              <p><strong>Status:</strong> {selectedApplication.statut}</p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isCreateModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Schedule Interview</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Google Meet Link</label>
              <div className="flex">
                <input
                  type="text"
                  name="meetLink"
                  value={newInstructorData.meetLink}
                  onChange={handleInputChange}
                  placeholder="https://meet.google.com/xxx"
                  className="flex-1 border px-3 py-2 rounded-l-md"
                />
                <button
                  onClick={generateMeetLink}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Interview Date</label>
              <input
                type="datetime-local"
                name="dateEntretien"
                value={newInstructorData.dateEntretien}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorApplicationsPage;
