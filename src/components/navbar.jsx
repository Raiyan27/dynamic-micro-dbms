import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-xl font-semibold">DMDS</div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-sm font-medium">
          <li>
            <a href="#employee" className="hover:text-gray-300 transition">
              Employee Profile
            </a>
          </li>
          <li>
            <Link to="/payment" className="hover:text-gray-300 transition">
              Payment Profile
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-2 space-y-2 px-2">
          <a
            href="#employee"
            className="block py-2 px-3 rounded hover:bg-gray-700"
          >
            Employee Profile
          </a>
          <a
            href="#payroll"
            className="block py-2 px-3 rounded hover:bg-gray-700"
          >
            Payment Profile
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
