import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab) => {
    navigate(`/${tab.toLowerCase()}`);
    setIsMobileMenuOpen(false);
  };

  const tabs = ["Groups", "Friends", "Activity", "Account", "Self"];

  return (
    <header className="bg-[#8A2BE2] py-4 px-6 md:px-8 w-full shadow-md relative z-40">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Styled App Name */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center">
          <span className="relative">
            <span className="absolute -top-1 left-0 text-lg md:text-xl font-medium text-[#FFD700]">
              ₹
            </span>
            <span className="ml-5">H</span>
          </span>
          <span className="text-[#FFD700] mx-1">i</span>
          <span>s</span>
          <span className="text-[#FFD700]">a</span>
          <span>a</span>
          <span className="text-[#FFD700]">b</span>
        </h1>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-2 px-4 text-white font-semibold transition-colors duration-200 ${
                location.pathname === `/${tab.toLowerCase()}`
                  ? "border-b-2 border-white"
                  : "hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="block md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-[#8A2BE2] mt-4 py-4 px-6 rounded-md shadow-md relative z-30">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`block w-full py-2 text-white font-semibold transition-colors duration-200 ${
                location.pathname === `/${tab.toLowerCase()}`
                  ? "bg-[#6A1DB6]"
                  : "hover:bg-[#6A1DB6]"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
