import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-4 bg-gray-800 p-4">
      <div className="container mx-auto text-center text-gray-300">
        &copy; {new Date().getFullYear()} MyWebsite. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
