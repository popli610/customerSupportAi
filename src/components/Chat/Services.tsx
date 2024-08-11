//from a new branch 

"use client"; 

import React from "react";


const services = [
  {
    title: "Emergency Care",
    description: "24/7 emergency care for urgent medical situations.",
    icon: "🚑",
  },
  {
    title: "Outpatient Services",
    description: "Comprehensive outpatient services including consultations and minor procedures.",
    icon: "🏥",
  },
  {
    title: "Surgical Services",
    description: "State-of-the-art surgical services for various medical conditions.",
    icon: "🛠️",
  },
];

const ServicesSection: React.FC = () => {
  return (
    <div className="container mx-auto text-center p-6">
      <h2 className="text-4xl font-bold mb-8 text-blue-900">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;