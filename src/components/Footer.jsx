import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 text-center py-4 text-gray-700 dark:text-gray-300 w-full bottom-0">
      <p className="text-sm">
        © {new Date().getFullYear()} Telepathy. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
