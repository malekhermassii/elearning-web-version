import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import scoreIcon from '../../assets/images/Score.svg';

const CourseCard = ({ id, image, title, lessons, students, level, rating }) => {
  const navigate = useNavigate();

  const handleStartCourse = () => {
    navigate(`/courses/${id}`);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img src={image} alt={title} className="w-full h-48 object-cover"/>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2 min-h-[56px]">{title}</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <span className="font-medium">Lesson: {lessons}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <span className="font-medium">Student: {students}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="font-medium">{level}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button 
            onClick={handleStartCourse}
            className="flex items-center bg-[#3f51b5] text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
          
            Start Course
          </button>
          <div className="relative w-10 h-10">
            <img src={scoreIcon} alt="Score" className="w-full h-full" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-900 font-semibold">
              {rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

//valider les types des propriétés (props)
CourseCard.propTypes = {
  id: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  lessons: PropTypes.number.isRequired,
  students: PropTypes.number.isRequired,
  level: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired
};

export default CourseCard;
