import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-blue-900 text-white py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <img src="hospital.png" alt="Hospital Icon" className="w-8 h-8 mr-2" /> {/* Adjust the path and size as needed */}
          <h1 className="text-2xl font-semibold">Hospital</h1>
        </div>
        <nav>
          <a href="#services" className="mx-4 hover:text-gray-300">Services</a>
          <a href="http://localhost:3000/signin" className="mx-4 hover:text-gray-300">Login</a>
          <a href="http://localhost:3000/signup" className="mx-4 hover:text-gray-300">Signup</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
