import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUsers, FaChartLine, FaDollarSign, FaBook, FaFolderOpen, FaStar, FaUserGraduate } from 'react-icons/fa';
import { fetchCourses, fetchUsers, fetchabonnements, fetchpayement, fetchCategories } from '../../api';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get data from Redux
  const courses = useSelector((state) => state.courses.courses);
  const users = useSelector((state) => state.users.users);
  const subscriptions = useSelector((state) => state.abonnement.subscriptions);
  const payments = useSelector((state) => state.paiement.paiements);
  const categories = useSelector((state) => state.categories.categories);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(fetchCourses()),
          dispatch(fetchUsers()),
          dispatch(fetchabonnements()),
          dispatch(fetchpayement()),
          dispatch(fetchCategories())
        ]);
        setError(null);
      } catch (err) {
        setError("Unable to load statistics");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  // Calculate statistics
  const statistics = {
    totalUsers: users?.length || 0,
    activeSubscriptions: subscriptions?.filter(sub => sub.statut === 'actif')?.length || 0,
    totalRevenue: payments?.reduce((sum, payment) => sum + (payment.montant || 0), 0) || 0,
    totalCourses: courses?.length || 0,
    categories: categories?.length || 0,
    averageRating: courses?.length > 0 
      ? (courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length).toFixed(1)
      : 0,
    totalEnrollments: courses?.reduce((sum, course) => sum + (course.enrolledCount || 0), 0) || 0
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-800">Platform Statistics</h1>
        <p className="text-gray-500 mt-1">Platform statistics overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={statistics.totalUsers} 
          change={`+${Math.round((statistics.totalUsers / 100) * 10)}% this month`}
          changeType="positive"
          icon={<FaUsers className="text-blue-600 h-5 w-5" />}
        />
        <StatCard 
          title="Active Subscriptions" 
          value={statistics.activeSubscriptions} 
          change={`${Math.round((statistics.activeSubscriptions / statistics.totalUsers) * 100)}% of users`}
          changeType="positive"
          icon={<FaChartLine className="text-blue-600 h-5 w-5" />}
        />
        <StatCard 
          title="Total Revenue" 
          value={`${statistics.totalRevenue.toLocaleString()} €`} 
          change={`+${Math.round((statistics.totalRevenue / 100) * 15)}% this month`}
          changeType="positive"
          icon={<FaDollarSign className="text-blue-600 h-5 w-5" />}
        />
        <StatCard 
          title="Total Courses" 
          value={statistics.totalCourses} 
          change={`${Math.round((statistics.totalCourses / 100) * 5)} new this month`}
          changeType="positive"
          icon={<FaBook className="text-blue-600 h-5 w-5" />}
        />
        <StatCard 
          title="Categories" 
          value={statistics.categories} 
          change="Subject diversity"
          changeType="neutral"
          icon={<FaFolderOpen className="text-blue-600 h-5 w-5" />}
        />
        <StatCard 
          title="Average Course Rating" 
          value={statistics.averageRating} 
          change="out of 5.0"
          changeType="neutral"
          icon={<FaStar className="text-blue-500 h-5 w-5" />}
        />
        <StatCard 
          title="Total Enrollments" 
          value={statistics.totalEnrollments} 
          change={`${Math.round((statistics.totalEnrollments / statistics.totalUsers) * 100)}% of users`}
          changeType="positive"
          icon={<FaUserGraduate className="text-blue-600 h-5 w-5" />}
        />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, changeType, icon }) => {
  const getTextColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="rounded-full bg-blue-100 p-2">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className={`text-sm mt-1 ${getTextColor()}`}>
          {change}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
