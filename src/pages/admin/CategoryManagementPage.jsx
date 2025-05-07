import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { fetchCategories } from "../../api";
import {
  addCategorie,
  updateCategorie,
  deleteCategorie,
} from "../../redux/slices/categorieSlice";

const CategoryManagementPage = () => {
  const dispatch = useDispatch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = useSelector((state) => state.categories.categories);
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log("Selected file:", file);
    // Add your logic here (e.g., upload the file, preview it, etc.)
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchCategories());
        setError(null);
      } catch (error) {
        console.error("Error loading Categories:", error);
        setError("Error loading Categories");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [dispatch]);

  const handleEditCategorie = async () => {
    if (!selectedCategorie?.id) {
      alert("ID du categorie non défini");
      return;
    }
    try {
      const existingCategorie = categories.find(
        (cat) =>
          cat.titre === selectedCategorie.titre &&
          cat._id !== selectedCategorie.id &&
          cat.id !== selectedCategorie.id
      );

      if (existingCategorie) {
        alert("A category with this title already exists");
        return;
      }
      const formData = new FormData();
      formData.append("titre", selectedCategorie.titre);

      // Check si l'image est un fichier (sinon on ne la modifie pas)
      if (selectedCategorie.image instanceof File) {
        formData.append("image", selectedCategorie.image);
      }
      const response = await axios.put(
        `http://192.168.1.17:3000/categorie/${selectedCategorie.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const updatedCategorie = {
          _id: selectedCategorie.id,
          titre: selectedCategorie.titre,
          image: response.data.image, // updated image filename from server
        };

        dispatch(updateCategorie(updatedCategorie));
        const updatedcategories = categories.map((cat) =>
          cat._id === selectedCategorie.id || cat.id === selectedCategorie.id
            ? updatedCategorie
            : cat
        );
        localStorage.setItem("categories", JSON.stringify(updatedcategories));

        setIsEditModalOpen(false);
        setSelectedCategorie(null);
        alert("Categorie mise à jour avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du categorie"
      );
    }
  };
  const handleDeleteCategorie = async () => {
    if (!selectedCategorie) return;

    try {
      const response = await axios.delete(
        `http://192.168.1.17:3000/categorie/${selectedCategorie.id}`
      );

      if (response.status === 200) {
        // Mettre à jour le state Redux
        dispatch(deleteCategorie(selectedCategorie.id));

        // Mettre à jour le localStorage
        const updatedcategories = categories.filter(
          (cat) => cat._id !== selectedCategorie.id && cat.id !== selectedCategorie.id
        );
        localStorage.setItem("categories", JSON.stringify(updatedcategories));

        // Fermer la modal et réinitialiser l'état
        setIsDeleteModalOpen(false);
        setSelectedCategorie(null);
        
        // Rafraîchir la liste des catégories
        await dispatch(fetchCategories());
        
        alert("Categorie successfully deleted!");
      }
    } catch (error) {
      console.error("Error deleting Categorie:", error);
      if (error.response?.status === 404) {
        alert("Categorie no longer exists");
      } else if (error.response?.status === 403) {
        alert("You do not have permission to delete this Categorie");
      } else {
        alert(error.response?.data?.message || "Error deleting Categorie");
      }
    }
  };
  const handleAddCategorie = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("titre", values.titre);
      formData.append("image", values.image);
      const response = await axios.post(
        "http://192.168.1.17:3000/categorie",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  

      if (response.status === 201) {
        const newCategorie = response.data;
        dispatch(addCategorie(newCategorie));
     
      }
    
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  

  const validationSchema = Yup.object().shape({
    titre: Yup.string().required("Titre is required"),
    image: Yup.mixed().required("Image is required"),
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
          <h1 className="text-2xl font-bold text-gray-900">
            Categorie Management
          </h1>
          <p className="text-gray-600">Manage the platform's Categories</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Categorie
        </button>
      </div>

      {/* Tableau des categories */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Picture
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((categorie) => (
              <tr key={categorie._id || categorie.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{categorie.titre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={`http://192.168.1.17:3000/Public/Images/${categorie.image}`}
                    alt={categorie.titre}
                    className="h-12 w-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedCategorie({
                        id: categorie._id || categorie.id,
                        titre: categorie.titre,
                        image: categorie.image,
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategorie({
                        id: categorie._id || categorie.id,
                        titre: categorie.titre,
                        image: categorie.image,
                      });
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
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
              <h2 className="text-xl font-semibold">Add category</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <Formik
              initialValues={{ titre: "", image: "" }}
              validationSchema={validationSchema}
              onSubmit={handleAddCategorie}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Titre
                    </label>
                    <Field
                      name="titre"
                      type="text"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        errors.titre && touched.titre ? "border-red-500" : ""
                      }`}
                      placeholder="Entrez le nom complet"
                    />
                    <ErrorMessage
                      name="titre"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Picture
                    </label>
                    <Field name="image">
                      {({ field, form }) => (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            form.setFieldValue(
                              "image",
                              event.currentTarget.files[0]
                            );
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      )}
                    </Field>
                    <ErrorMessage
                      name="image"
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
                      Exit
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
                        isSubmitting ? "cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Création en cours...
                        </span>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedCategorie && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Category</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCategorie(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditCategorie();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  type="text"
                  value={selectedCategorie.titre}
                  onChange={(e) =>
                    setSelectedCategorie({
                      ...selectedCategorie,
                      titre: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedCategorie({
                      ...selectedCategorie,
                      image: e.target.files[0],
                    })
                  }
                  className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                />
                {/* Afficher un aperçu si l'image existante est présente */}
                {typeof selectedCategorie.image === "string" && (
                  <img
                    src={`http://192.168.1.17:3000/Public/Images/${selectedCategorie.image}`}
                    alt="Preview"
                    className="h-16 w-16 mt-2 object-cover rounded"
                  />
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {isDeleteModalOpen && selectedCategorie && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Supprimer l'Instructeur
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'instructeur{" "}
              {selectedCategorie.titre} ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteCategorie}
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

export default CategoryManagementPage;
