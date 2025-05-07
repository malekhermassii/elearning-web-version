import React from 'react';
import UserTypeCards from './UserTypeCards';

const WhoIsElearning = () => {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">
                        Who e-learning ?
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto">
                        E-learning is a platform that allows educators to create online classes whereby they 
                        can store the course materials online; manage assignments, quizzes and exams; 
                        monitor due dates; grade results and provide students with feedback all in one place.
                    </p>
                </div>
                
                <UserTypeCards />
            </div>
        </section>
    );
};

export default WhoIsElearning;