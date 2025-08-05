import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#8A2BE2] p-4 w-full text-center">
      <p className="text-white">
        © 2025{" "}
        <span className="text-2xl font-extrabold text-white flex justify-center items-center space-x-1">
          <span className="relative">
            <span className="absolute -top-1 left-0 text-lg font-medium text-[#FFD700]">
              ₹
            </span>
            <span className="ml-5">H</span>
          </span>
          <span className="text-[#FFD700]">i</span>
          <span>s</span>
          <span className="text-[#FFD700]">a</span>
          <span>a</span>
          <span className="text-[#FFD700]">b</span>
        </span>
      </p>
    </footer>
  );
};

export default Footer;
