import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { updateProfil, updateProfilStart, updateProfilError } from "../../redux/slices/adminSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Le nom est requis"),
  email: Yup.string().email("Email invalide").required("L'email est requis"),
  password: Yup.string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  confirmPassword: Yup.string()
    .nullable()
    .test(
      "passwords-match",
      "Les mots de passe doivent correspondre",
      function (value) {
        return !this.parent.password || value === this.parent.password;
      }
    ),
});

const ProfilePageadmin = () => {
  const dispatch = useDispatch();
  const adminState = useSelector((state) => state.authadmin);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Vérifier si l'admin est connecté
    const token = localStorage.getItem("adminToken");
    const storedAdmin = JSON.parse(localStorage.getItem("currentadmin"));
    
    if (!token) {
      navigate("/loginadmin");
      return;
    }

    if (storedAdmin && (!adminState?.adminInfo?.name)) {
      dispatch(updateProfil(storedAdmin));
    }
  }, [navigate, dispatch, adminState?.adminInfo]);

  useEffect(() => {
    console.log("État actuel de l'admin:", adminState?.adminInfo);
    if (adminState?.adminInfo?.image) {
      const imageUrl = `http://192.168.1.17:3000/Public/Images/${adminState.adminInfo.image}`;
      console.log("URL de l'image:", imageUrl);
      setProfileImage(imageUrl);
    }
  }, [adminState?.adminInfo]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log("Début de handleSubmit avec les valeurs:", values);
      dispatch(updateProfilStart());
      setLoading(true);
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("email", values.email);

      if (values.password && values.password.trim() !== "") {
        if (values.password !== values.confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas");
          return;
        }
        formData.append("password", values.password);
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const token = localStorage.getItem("adminToken");
      console.log("Token récupéré:", token ? "Présent" : "Absent");
      
      if (!token) {
        toast.error("Veuillez vous reconnecter pour modifier votre profil");
        navigate("/loginadmin");
        return;
      }

      console.log("Envoi de la requête à l'API avec le token:", token);
      const response = await axios.put(
        "http://192.168.1.17:3000/adminprofile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Réponse reçue:", response.data);

      if (response.data) {
        // S'assurer que l'ID est inclus dans la réponse
        const updatedData = {
          ...response.data,
          _id: adminState?.adminInfo?._id
        };
        dispatch(updateProfil(updatedData));
        toast.success("Profil mis à jour avec succès");

        resetForm({
          values: {
            ...values,
            password: "",
            confirmPassword: "",
          },
        });

        if (response.data.image) {
          setProfileImage(
            `http://192.168.1.17:3000/Public/Images/${response.data.image}`
          );
        }
      } else {
        throw new Error("Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      console.error("Response error:", error.response);
      dispatch(updateProfilError(error.response?.data?.message || "Erreur lors de la mise à jour du profil"));
      toast.error(
        error?.response?.data?.message ||
          "Une erreur est survenue lors de la mise à jour du profil"
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Notification settings
  const [notifications, setNotifications] = useState({
    courseEnrollments: true,
    courseFeedback: true,
    newQuestions: true,
    promotionalEmails: false,
    weeklyDigest: true,
    courseCompletions: true,
  });

  // Handle notification toggle
  const handleNotificationToggle = (key) => {
    setNotifications((prevNotifications) => ({
      ...prevNotifications,
      [key]: !prevNotifications[key],
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez votre compte et vos préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Menu Paramètres
              </h3>
            </div>
            <nav className="px-3 py-3">
              <div className="space-y-1">
                <a
                  href="#profile"
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  <svg
                    className="mr-3 h-5 w-5 text-indigo-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Informations du profil
                </a>
                <a
                  href="#notifications"
                  className="text-gray-700 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  <svg
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Notification Preferences
                </a>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <div
            id="profile"
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Informations du profil
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Mettez à jour vos informations personnelles
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <Formik
                initialValues={{
                  name: adminState?.adminInfo?.name || "",
                  email: adminState?.adminInfo?.email || "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
                        <div className="flex items-center">
                          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <svg
                                  className="h-12 w-12"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-5">
                            <div className="flex items-center space-x-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="profile-image"
                              />
                              <label
                                htmlFor="profile-image"
                                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                              >
                                Changer
                              </label>
                              <button
                                type="button"
                                className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                onClick={() => {
                                  setProfileImage(null);
                                  setSelectedFile(null);
                                }}
                              >
                                Supprimer
                              </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              Dimensions recommandées : 400px x 400px. Taille maximale : 1MB.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nom complet
                        </label>
                        <Field
                          name="name"
                          type="text"
                          placeholder={adminState?.adminInfo?.name || "Votre nom"}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.name && touched.name && (
                          <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                        )}
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Adresse email
                        </label>
                        <Field
                          name="email"
                          type="email"
                          placeholder={adminState?.adminInfo?.email || "Votre email"}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.email && touched.email && (
                          <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                        )}
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Nouveau mot de passe
                        </label>
                        <Field
                          name="password"
                          type="password"
                          placeholder="Laisser vide pour garder l'actuel"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.password && touched.password && (
                          <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                        )}
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirmer le mot de passe
                        </label>
                        <Field
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirmer le nouveau mot de passe"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.confirmPassword && touched.confirmPassword && (
                          <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-5 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          {/* Notification Preferences */}
          <div
            id="notifications"
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Notification Preferences
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose which notifications you would like to receive.
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {Object.keys(notifications).map((key) => (
                <div key={key} className="flex items-center mb-3">
                  <input
                    id={key}
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={() => handleNotificationToggle(key)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={key}
                    className="ml-3 text-sm text-gray-700 capitalize"
                  >
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageadmin;
