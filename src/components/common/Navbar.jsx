import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../../utils/auth";
import profilePicture from "../../assets/images/profile-picture.svg";
import enFlag from "../../assets/images/en.png"; // Add the flag image for English
import arFlag from "../../assets/images/ar.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Check authentication status on component mount and route changes
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);

      if (authStatus) {
        const user = getCurrentUser();
        setCurrentUser(user);

        // Load user profile image if it exists
        if (user && user.id) {
          const savedProfileImage = localStorage.getItem(
            `user_${user.id}_profile_image`
          );
          if (savedProfileImage) {
            setUserProfileImage(savedProfileImage);
          } else {
            setUserProfileImage(null);
          }
        }
      } else {
        setCurrentUser(null);
        setUserProfileImage(null);
      }
    };

    checkAuth();

    // Handle authentication updates between multiple tabs
    const handleStorageChange = (event) => {
      // Check if the changed item is related to user profile image
      if (event.key && event.key.includes("_profile_image")) {
        checkAuth();
      } else {
        checkAuth();
      }
    };

    // Handle user profile updates
    const handleProfileUpdate = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, [location]);

  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close profile menu when main menu is toggled
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <nav className="bg-transparent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <span className="text-xl font-bold">LOGO</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4 mr-4">
              {["Home", "Courses", "Contact"].map((item) => (
                <Link
                  key={item}
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className={`${
                    isHomePage ? "text-white" : "text-gray-800"
                  } hover:text-blue-300 px-3 py-2 text-sm font-medium`}
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Language Selector */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center ${
                isHomePage ? "text-white" : "text-black"
              } hover:text-blue-300`}
            >
              <span className="mr-1">
                <img
                  src={language === "en" ? enFlag : arFlag}
                  alt={language === "en" ? "English" : "Arabic"}
                  className="h-5 w-5"
                />
              </span>
            </button>

            {/* Profile or Login Button */}
            {isLoggedIn ? (
              <div className="relative flex items-center space-x-4 ">
                {/* Notification bell */}
                <div className="relative mt-3">
                  <button
                   className={`${
                    isHomePage ? "text-white" : "text-gray-800"
                  } hover:text-blue-300  text-sm font-medium`}
                    aria-label="Notifications"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
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
                    {/* Red dot for new notifications */}
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                  </button>
                </div>
                {/* Profile Button */}
                <div className="relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center focus:outline-none"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full border-2 border-blue-300"
                      src={userProfileImage || profilePicture}
                      alt="Profile"
                    />
                    <span
                      className={`ml-2 font-medium ${
                        isHomePage ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {currentUser?.fullName?.split(" ")[0]}
                    </span>
                    <svg
                      className={`ml-1 h-4 w-4 ${
                        isHomePage ? "text-white" : "text-gray-800"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Profile dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {currentUser?.fullName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {currentUser?.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/profile"
                        state={{ editMode: true }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Edit Profile
                      </Link>
                      <Link
                        to="/my-courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Courses
                      </Link>
                      <Link
                        to="/logout"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Sign out
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium ${
                  isHomePage ? "text-white" : "border-black text-black"
                } shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            {isLoggedIn && (
              <button
                type="button"
                className="mr-2 flex items-center focus:outline-none"
                onClick={toggleProfileMenu}
              >
                <img
                  className="h-8 w-8 rounded-full border-2 border-blue-300"
                  src={userProfileImage || profilePicture}
                  alt="Profile"
                />
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-dark hover:text-blue-300 hover:bg-blue-600/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Profile Menu */}
      {isProfileMenuOpen && isLoggedIn && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg mx-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {currentUser?.fullName}
            </p>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              Your Profile
            </Link>
            <Link
              to="/profile"
              state={{ editMode: true }}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              Edit Profile
            </Link>
            <Link
              to="/my-courses"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              My Courses
            </Link>
            <Link
              to="/logout"
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden bg-gray-900/80 backdrop-blur-sm"
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {["Home", "Courses", "Contact"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-blue-300 hover:bg-blue-600/20"
              >
                {item}
              </Link>
            ))}

            <div className="mt-4 flex flex-col space-y-3 px-3">
              {/* Language Selector */}
              <button
                onClick={toggleLanguage}
                className="flex items-center text-white hover:text-blue-300"
              >
                <span className="mr-2">
                  {language === "en" ? "🇺🇸 English" : "🇸🇦 العربية"}
                </span>
              </button>

              {/* Login Button (shown only if not logged in) */}
              {!isLoggedIn && (
                <Link
                  to="/login"
                  className={`inline-flex items-center justify-center rounded-md border border-white bg-transparent px-4 py-2 text-sm font-medium ${
                    isHomePage ? "text-white" : "text-white"
                  } shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
