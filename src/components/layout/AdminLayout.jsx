import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { logoutAdmin } from '../../api';
import {
  UsersIcon,
  UserGroupIcon,
  FolderIcon,
  BookOpenIcon,
  CreditCardIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const iconMap = {
  grid: Squares2X2Icon,
  users: UsersIcon,
  "user-group": UserGroupIcon,
  folder: FolderIcon,
  BookOpenIcon: BookOpenIcon,
  "credit-card": CreditCardIcon,
  collection: ClipboardDocumentListIcon,
  chat: ChatBubbleBottomCenterTextIcon,
  "chart-bar": ChartBarIcon,
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const currentadmin =
      JSON.parse(localStorage.getItem("currentadmin")) ||
      JSON.parse(sessionStorage.getItem("currentadmin"));

    if (!adminToken || !currentadmin) {
      navigate('/loginadmin');
    }
  }, [navigate]);

  const sidebarItems = [
    { name: "Tableau de bord", path: "/admin", icon: "grid" },
    {
      name: "User Mangement",
      icon: "user-group",
      subItems: [
        { name: "Instructors", path: "/admin/users/instructors" },
        { name: "Students", path: "/admin/users/students" },
      ],
    },
    {
      name: "Instructor apply",
      path: "/admin/instructor-applications",
      icon: "users",
    },
    { name: "Category", path: "/admin/categories", icon: "folder" },
    { name: "Course", path: "/admin/course-status", icon: "BookOpenIcon" },
    {
      name: "subscriptions",
      path: "/admin/subscriptions",
      icon: "credit-card",
    },
    { name: "Review", path: "/admin/course-review", icon: "collection" },
    { name: "Question", path: "/admin/feedback", icon: "chat" },
  
  ];

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/loginadmin');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
     
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-blue-700">
          <Link to="/admin" className="flex items-center">
            <div className="bg-white text-blue-800 p-2 rounded-lg mr-2">
              <span className="text-lg font-bold">ADMIN</span>
            </div>
            <span className="text-xl font-bold">Dashboard</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white hover:text-blue-200 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar navigation */}
        <nav className="mt-6 px-4 h-[calc(100vh-8rem)] overflow-y-auto">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => {
              const Icon = iconMap[item.icon];

              return (
                <li key={index}>
                  {item.path ? (
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? "bg-blue-700 text-white"
                          : "text-blue-100 hover:bg-blue-700"
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5 mr-3" />}
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <div className="text-blue-100">
                      <div className="flex items-center px-4 py-3 font-semibold">
                        {Icon && <Icon className="h-5 w-5 mr-3" />}
                        <span>{item.name}</span>
                      </div>
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm font-medium rounded-md ${
                              location.pathname === subItem.path
                                ? "bg-blue-700 text-white"
                                : "text-white hover:bg-blue-700"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-blue-100 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Desktop header */}
        <header className="hidden lg:flex bg-white h-16 shadow-sm items-center justify-between px-6">
          <div className="flex items-center"></div>

          {/* User profile */}
          <div className="flex items-center">
            <span className="text-gray-800 mr-2">Admin</span>

            <Link
              to="/admin/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <UsersIcon className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="pt-16 lg:pt-0 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
