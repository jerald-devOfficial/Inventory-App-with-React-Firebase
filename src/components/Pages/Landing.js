import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

const Landing = () => {
  return (
    <>
      <div class="lg:2/6 xl:w-2/4 mt-20 lg:mt-40 lg:ml-16 text-left">
        <div class="text-6xl font-semibold text-gray-900 leading-none">
          Future of Inventory Systems
        </div>
        <div class="mt-6 text-xl font-light text-true-gray-500 antialiased">
          A better experience for inventory management for users and admins.
        </div>
        <Link to={ROUTES.HOME}>
          <button class="mt-6 px-8 py-4 rounded-full font-normal tracking-wide bg-gradient-to-b from-blue-600 to-blue-700 text-white outline-none focus:outline-none hover:shadow-lg hover:from-blue-700 transition duration-200 ease-in-out">
            Get Started
          </button>
        </Link>
      </div>
    </>
  );
};

export default Landing;
