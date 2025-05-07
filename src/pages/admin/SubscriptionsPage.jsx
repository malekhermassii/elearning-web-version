import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchabonnements, fetchpayement, fetchplan } from "../../api";
import axios from "axios";
import { addPlan, updatePlan, deletePlan } from "../../redux/slices/planSlice";
import * as Yup from "yup";

const SubscriptionsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "monthly",
    offers: "",
  });

  // Récupération des données depuis Redux
  const plans = useSelector((state) => state.plans.plans);
  const abonnements = useSelector((state) => state.abonnement.subscriptions);
  const paiements = useSelector((state) => state.paiement.paiements);

  // Configuration axios
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchplan());
        await dispatch(fetchabonnements());
        await dispatch(fetchpayement());
        setError(null);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Le nom est requis"),
    price: Yup.number()
      .required("Le prix est requis")
      .positive("Le prix doit être positif"),
    duration: Yup.string().required("La durée est requise"),
    offers: Yup.string(),
  });

  // Gestion des formulaires
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getPlanName = (planId) => {
    // Si planId est un objet peuplé
    if (planId && typeof planId === "object") {
      return planId.name || "Plan inconnu";
    }
    // Si c'est juste un ID
    const plan = plans.find((p) => p._id === planId);
    return plan ? plan.name : "Plan inconnu";
  };

  // Fonction pour obtenir les détails de l'apprenant
  const getApprenantDetails = (abonnement) => {
    if (!abonnement)
      return { name: "Utilisateur inconnu", email: "Email inconnu" };

    if (
      abonnement.apprenant_id &&
      typeof abonnement.apprenant_id === "object"
    ) {
      // Vérifier si l'apprenant a un userId peuplé
      if (
        abonnement.apprenant_id.userId &&
        typeof abonnement.apprenant_id.userId === "object"
      ) {
        return {
          name: abonnement.apprenant_id.userId.name || "Utilisateur inconnu",
          email: abonnement.apprenant_id.userId.email || "Email inconnu",
        };
      }
    }
    return {
      name: "Utilisateur inconnu",
      email: "Email inconnu",
    };
  };

  // Ouvrir modal d'ajout
  const handleAddClick = () => {
    setFormData({
      name: "",
      price: "",
      duration: "",
      offers: "",
    });
    setError(null);
    setIsAddModalOpen(true);
  };

  // Ouvrir modal d'édition
  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration,
      offers: plan.offers,
    });
    setError(null);
    setIsEditModalOpen(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validation des données
      if (
        !formData.name ||
        !formData.price ||
        !formData.duration ||
        !formData.offers
      ) {
        throw new Error("Tous les champs sont requis");
      }

      // Conversion du prix en nombre
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Le prix doit être un nombre positif");
      }

      // Préparation des données
      const planData = {
        name: formData.name.trim(),
        price: price,
        duration: formData.duration,
        offers: formData.offers.trim(),
      };

      let response;
      if (selectedPlan) {
        // Mise à jour du plan
        response = await axios.put(
          `http://192.168.1.17:3000/planabonnement/${selectedPlan._id}`,
          planData
        );
        dispatch(updatePlan(response.data));
      } else {
        // Création d'un nouveau plan
        response = await axios.post(
          "http://192.168.1.17:3000/planabonnement",
          planData
        );
        dispatch(addPlan(response.data));
      }

      // Fermer les modals et réinitialiser
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
      setSelectedPlan(null);
      setFormData({
        name: "",
        price: "",
        duration: "",
        offers: "",
      });

      // Recharger les données
      await dispatch(fetchplan());
    } catch (error) {
      console.error("Error saving plan:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Erreur lors de la sauvegarde"
      );
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un plan
  const handleDelete = async (planId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) {
      try {
        setLoading(true);
        setError(null);

        await axios.delete(
          `http://192.168.1.17:3000/planabonnement/${planId}`
        );

        dispatch(deletePlan(planId));
        await dispatch(fetchplan());
      } catch (error) {
        console.error("Error deleting plan:", error);
        setError(
          error.response?.data?.message || "Erreur lors de la suppression"
        );
      } finally {
        setLoading(false);
      }
    }
  };

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
    <div className="p-6">
      <div className="mb-6 mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
          Subscription Management
          </h1>
          <p className="text-gray-600">
          View and manage subscriptions and payments
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "plans"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("plans")}
          >
           Subscription plans
          </button>
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "abonnements"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("abonnements")}
          >
          Active subscriptions
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "paiements"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("paiements")}
          >
         
Payment history
          </button>
        </nav>
      </div>

      {/* Plans d'abonnement */}
      {activeTab === "plans" && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Subscription plans</h2>
            <button
              onClick={handleAddClick}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Plan
            </button>
          </div>
          {error && <div className="p-4 bg-red-100 text-red-700">{error}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
Offers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans?.map((plan) => (
                  <tr key={plan._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.price} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.duration === "monthly" ? "yearly" : "Monthly"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {plan.offers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(plan)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Abonnements actifs */}
      {activeTab === "abonnements" && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                   
Start date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  End date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {abonnements?.map((abonnement) => {
                  const apprenant = getApprenantDetails(abonnement);
                  return (
                    <tr key={abonnement._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {apprenant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {apprenant.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPlanName(abonnement.planId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(abonnement.dateDebut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(abonnement.dateFin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            abonnement.statut === "actif"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {abonnement.statut}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historique des paiements */}
      {activeTab === "paiements" && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    
Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paiements?.map((paiement) => {
                  const abonnement = paiement.abonnement_id;
                  const apprenant = abonnement?.apprenant_id;
                  const plan = abonnement?.planId;

                  return (
                    <tr key={paiement._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {apprenant?.userId?.name || "Utilisateur inconnu"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {apprenant?.userId?.email || "Email inconnu"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {plan?.name || "Plan inconnu"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {paiement.montant} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {paiement.methodePaiement}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(paiement.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span>{abonnement.statut}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal d'ajout/édition */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {selectedPlan ? "Modifier le plan" : "Ajouter un plan"}
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                  Plan Type *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: Plan Premium"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Price (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 19.99"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Duration *
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={loading}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Offres 
                  </label>
                  <textarea
                    name="offers"
                    value={formData.offers}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Ex: Accès illimité, Support prioritaire"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      setSelectedPlan(null);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    disabled={loading}
                  >
                    Exit
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading
                      ? "In progress..."
                      : selectedPlan
                      ? "To update"
                      : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
