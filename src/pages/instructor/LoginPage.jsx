import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import google from "../../assets/images/google-icon.png";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { useDispatch } from "react-redux";
import { setprofToken } from "../../redux/slices/profSlice";
import * as Yup from "yup";
import axios from "axios";

const API_URL = "http://192.168.1.17:3000";

const LoginPageprof = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const from = location.state?.from || "/instructor";

  useEffect(() => {
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const { from } = location.state;
      window.history.replaceState({ from }, document.title);
    }
    const profToken = localStorage.getItem("profToken") || sessionStorage.getItem("profToken");
    const currentprof = JSON.parse(localStorage.getItem("currentprof")) || JSON.parse(sessionStorage.getItem("currentprof"));

    if (profToken && currentprof) {
      navigate(from);
      return;
    }

  }, [location, navigate, from]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Email invalide").required("Email requis"),
    password: Yup.string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères")
      .required("Mot de passe requis"),
   
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      console.log("Tentative de connexion avec:", values);
      const response = await axios.post("http://192.168.1.17:3000/professeurlogin", {
        email: values.email,
        password: values.password,
      });
      
      if (!response.data || !response.data.token) {
        throw new Error("Réponse invalide du serveur");
      }

      const { token } = response.data;
      
      // Tentative d'extraction des données prof depuis la racine de response.data
      // ou depuis un objet 'user' s'il existe
      const profDetails = response.data.prof || response.data.user || response.data;
      
      console.log("Détails extraits pour prof:", profDetails); // Log pour débogage

      // Utiliser userId comme _id si prof._id n'est pas disponible
      const profId = profDetails._id || profDetails.userId;

      if (!token) {
        throw new Error("Token manquant dans la réponse du serveur");
      }
      
      if (!profId) {
          console.error("ID du professeur introuvable dans la réponse:", profDetails);
          throw new Error("ID du professeur manquant dans la réponse du serveur");
      }

      const profData = {
        _id: profId,
        name: profDetails.name || "prof", // Valeur par défaut si name manque
        email: profDetails.email || values.email, // Utiliser l'email de connexion si besoin
        // Ajouter d'autres champs si nécessaire, en utilisant des valeurs par défaut ou en les laissant undefined
        image: profDetails.image,
        telephone: profDetails.telephone,
        dateNaissance: profDetails.dateNaissance,
        specialite: profDetails.specialite,
        // ... autres champs potentiels de l'objet prof/user/response.data
      };

      console.log("Données prof préparées:", profData); // Log pour débogage

      // Stocker les données dans le localStorage
      localStorage.setItem("profToken", token);
      localStorage.setItem("currentprof", JSON.stringify(profData));
      
      // Mettre à jour le state Redux
      dispatch(setprofToken({ token, prof: profData }));
      
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      const message = error.response?.data?.message || 
                     error.message || 
                     "Une erreur est survenue lors de la connexion";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue</h1>
            <p className="text-gray-600">
              Connectez-vous à votre compte pour continuer
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 text-green-600 font-medium">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="mb-4 text-red-600 font-medium">{errorMessage}</div>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="space-y-6 flex-grow">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="votre@email.com"
                  />
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-600" />
                </div>

                
           

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-[#1B45B4] text-white py-3 rounded-lg font-medium text-base ${
                    isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                  } transition-colors shadow-md`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
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
                      Connexion en cours...
                    </div>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-[#1B45B4] hover:text-blue-800">
                Sign up for free
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full py-3 px-6 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              >
                <img src={google} alt="Google" className="h-5 w-5 mr-2" />
                Google
              </button>
            </div>
          </div>
        </div>

        <div className="hidden md:block bg-[#1B45B4] text-white flex items-center justify-center">
          <div className="text-center px-10 py-6">
            <h2 className="text-3xl font-semibold mb-4">Start your learning journey</h2>
            <p className="text-lg mb-6">
              Access our wide range of courses and start learning today!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageprof;
