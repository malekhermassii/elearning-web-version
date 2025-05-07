import React from 'react';

const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="bg-[#1B45B4] mt-20 pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          Find Your Perfect Course
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search your favorite Course"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white pr-32 text-lg"
          />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-blue-600 px-6 py-2.5 rounded-full hover:bg-blue-50 transition-colors font-medium"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 