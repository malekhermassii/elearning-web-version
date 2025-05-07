import React from 'react';
import { Link } from 'react-router-dom';
import { coursesData } from '../../data/coursesData';
import CourseCard from './CourseCard';

const PopularCourses = () => {
  // Get first 8 courses from coursesData
  const popularCourses = coursesData.slice(0, 8);

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-blue-900">Popular Course</h2>
        <Link to="/courses" className="text-blue-600 hover:text-blue-800">
          See all
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {popularCourses.map((course) => (
          <CourseCard 
            key={course.id}
            id={course.id}
            image={course.image}
            title={course.title}
            lessons={course.lessons}
            students={course.students}
            level={course.level}
            rating={course.rating}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularCourses;
