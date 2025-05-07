import React, { useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import WhoIsElearning from '../components/home/WhoIsElearning';
import PopularCourses from '../components/home/PopularCourses';
import PricingPlans from '../components/home/PricingPlans';
import SuccessStats from '../components/home/SuccessStats';
import { useLocation } from 'react-router-dom';


const HomePage = () => {
    const location = useLocation();

    useEffect(() => {
        // Handle hash navigation for scrolling to specific sections
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                // Add a slight delay to ensure the element is properly rendered
                setTimeout(() => {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        } else {
            // If no hash is present, scroll to the top
            window.scrollTo(0, 0);
        }
    }, [location]);
    return (
        <div className="min-h-screen">
            <HeroSection />
            <CategorySection />
            <WhoIsElearning />
            <PopularCourses />
            <PricingPlans />
            <SuccessStats />
           
            {/* Other sections will be added here */}
        </div>
    );
};

export default HomePage;