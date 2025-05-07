import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { fetchprofesseur } from "../../api";
import {  addProfesseur, updateProfesseur, deleteProfesseur } from '../../redux/slices/professorSlice';

const InstructorManagementPage = () => {
  const dispatch = useDispatch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const professeurs = useSelector((state) => state.professors.professors);

    useEffect(() => {
      const loadInitialData = async () => {
        try {
          setLoading(true);
          await dispatch(fetchprofesseur());
          setError(null);
        } catch (error) {
          console.error("Error loading instructors:", error);
        setError("Error loading instructors");
        } finally {
          setLoading(false);
        }
      };
  
      loadInitialData();
    }, [dispatch]);


    
  const handleEditInstructor = async () => {
    if (!selectedInstructor?.id) {
      alert("ID du professeur non défini");
      return;
    }
    
    try {
      // Vérifier si l'email existe déjà pour un autre professeur
      const existingProfessor = professeurs.find(
        (prof) => prof.email === selectedInstructor.email && 
        (prof._id !== selectedInstructor.id && prof.id !== selectedInstructor.id)
      );
      
      if (existingProfessor) {
        alert("An instructor with this email already exists");
        return;
      }

      const response = await axios.put(
        `http://192.168.1.17:3000/professeur/${selectedInstructor.id}`,
        {
          name: selectedInstructor.name,
          email: selectedInstructor.email,
          password: selectedInstructor.password || undefined
        }
      );

      if (response.status === 200) {
        // Mettre à jour le state Redux
        dispatch(updateProfesseur({
          _id: selectedInstructor.id,
          name: selectedInstructor.name,
          email: selectedInstructor.email
        }));
        
        // Mettre à jour le localStorage
        const updatedProfessors = professeurs.map(prof => 
          (prof._id === selectedInstructor.id || prof.id === selectedInstructor.id) 
            ? { ...prof, name: selectedInstructor.name, email: selectedInstructor.email }
            : prof
        );
        localStorage.setItem("professeurs", JSON.stringify(updatedProfessors));
        
        setIsEditModalOpen(false);
        setSelectedInstructor(null);
        alert("Professeur mis à jour avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert(error.response?.data?.message || "Erreur lors de la mise à jour du professeur");
    }
  };

  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return;
    
    try {
      const response = await axios.delete(
        `http://192.168.1.17:3000/professeur/${selectedInstructor.id}`
      );

      if (response.status === 200) {
        // Mettre à jour le state Redux
        dispatch(deleteProfesseur(selectedInstructor.id));
        
        // Mettre à jour le localStorage
        const updatedProfessors = professeurs.filter(prof => prof.id !== selectedInstructor.id);
        localStorage.setItem("professeurs", JSON.stringify(updatedProfessors));
        
        setIsDeleteModalOpen(false);
        setSelectedInstructor(null);
        alert("Instructor successfully deleted!");
      }
    } catch (error) {
      console.error("Error deleting instructor:", error);
      if (error.response?.status === 404) {
        alert("Instructor no longer exists");
      } else if (error.response?.status === 403) {
        alert("You do not have permission to delete this instructor");
      } else {
        alert(error.response?.data?.message ||"Error deleting instructor");
      }
    }
  };

  const handleAddInstructor = async (values, { resetForm }) => {
    try {
      // Vérifier si l'email existe déjà
      const existingProfessor = professeurs.find(
        (prof) => prof.email === values.email
      );
      if (existingProfessor) {
        alert("An instructor with this email already exists");
        return;
      }

      const response = await axios.post("http://192.168.1.17:3000/professeurcreate", {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (response.status === 201) {
        // Créer l'objet professeur avec les données de la réponse
        const newProfessor = {
          id: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          // Ne pas stocker le mot de passe
        };
        
        // Mettre à jour le state Redux
        dispatch(addProfesseur(newProfessor));
        
        // Mettre à jour le localStorage
        const updatedProfessors = [...professeurs, newProfessor];
        localStorage.setItem("professeurs", JSON.stringify(updatedProfessors));
        
        // Réinitialiser le formulaire et fermer la modal
        resetForm();
        setIsAddModalOpen(false);
        
        // Afficher un message de succès
        alert("Professeur créé avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la création du professeur:", error);
      alert(error.response?.data?.message || "Erreur lors de la création du professeur");
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Le nom est requis"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 caractères")
      .required("Password is required"),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
  <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Management</h1>
          <p className="text-gray-600">Manage the platform's instructors</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Instructor
        </button>
      </div>

      {/* Tableau des professeurs */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {professeurs.map((professeur) => (
              <tr key={professeur._id || professeur.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{professeur.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{professeur.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedInstructor({
                        id: professeur._id || professeur.id,
                        name: professeur.name,
                        email: professeur.email
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setSelectedInstructor({
                        id: professeur._id || professeur.id,
                        name: professeur.name
                      });
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal d'ajout */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ajouter un Professeur</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Formik
              initialValues={{ name: "", email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleAddInstructor}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom complet
                    </label>
                    <Field
                      name="name"
                      type="text"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.name && touched.name ? 'border-red-500' : ''
                      }`}
                      placeholder="Entrez le nom complet"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.email && touched.email ? 'border-red-500' : ''
                      }`}
                      placeholder="Entrez l'email"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <Field
                      name="password"
                      type="password"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.password && touched.password ? 'border-red-500' : ''
                      }`}
                      placeholder="Entrez le mot de passe"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
                        isSubmitting ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Création en cours...
                        </span>
                      ) : (
                        'Créer'
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {isEditModalOpen && selectedInstructor && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Modifier l'Instructeur</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={selectedInstructor.name}
                  onChange={(e) =>
                    setSelectedInstructor({
                      ...selectedInstructor,
                      name: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedInstructor.email}
                  onChange={(e) =>
                    setSelectedInstructor({
                      ...selectedInstructor,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <input
                      name="password"
                      type="password"
                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Entrez le mot de passe"
                    />
                    
                  </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleEditInstructor}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {isDeleteModalOpen && selectedInstructor && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Supprimer l'Instructeur</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'instructeur {selectedInstructor.name} ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteInstructor}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorManagementPage;
