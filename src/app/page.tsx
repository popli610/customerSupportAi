//from new branch

import React from "react";
import Header from "../components/Chat/Header"
import ServicesSection from "../components/Chat/Services";
//import Login from "@/components/auth/Login";

import ChatToggle from "../components/Chat/ChatToggle";
import Image from "next/image";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <Header />

      {/* landing image Section */}
      <section className="relative w-full flex items-center justify-center bg-blue-900 text-white py-20">
        <div className="absolute inset-0">
          <Image
            src="/h1.jpg"
            alt="Hospital"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-50"
          />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl font-bold mb-4">Welcome to Our Hospital</h1>
          <p className="text-lg mb-8">Providing exceptional healthcare services with compassionate care.</p>
          
          <ChatToggle />
        </div>
      </section>

      {/* Navigation */}
      <nav className="bg-blue-900 text-white py-4">
        <div className="container mx-auto flex justify-center">
          <a href="#services" className="mx-4 hover:text-gray-300"></a>
        </div>
      </nav>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-blue-900 mb-8 text-center"></h2>
          <ServicesSection />
        </div>
      </section>

     

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Hospital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;