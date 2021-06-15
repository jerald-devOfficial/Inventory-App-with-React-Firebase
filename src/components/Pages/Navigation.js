import React from 'react';
import { Link } from 'react-router-dom';

import { AuthUserContext } from '../Session';
import SignOutButton from './SignOut';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

const Navigation = () => (
  <div className="flex items-center justify-between">
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center text-3xl  text-true-gray-800 mr-8 font-dosis font-extrabold">
        <Link to={ROUTES.LANDING}>Inventory</Link>
      </div>
    </div>

    <div className="md:flex items-center justify-center">
      <AuthUserContext.Consumer>
        {(authUser) => (authUser ? <NavigationAuth authUser={authUser} /> : <NavigationNonAuth />)}
      </AuthUserContext.Consumer>
    </div>
  </div>
);

const NavigationAuth = ({ authUser }) =>
  needsEmailVerification(authUser) ? (
    <div className="md:flex items-center justify-center">
      <div className="mr-5 text-md font-bold font-dosis text-true-gray-800 hover:text-cool-gray-700 transition duration-150 ease-in-out rounded-full focus:bg-gray-200 px-2">
        <span className="uppercase">Account not verified: </span>&nbsp;
        <span className="text-red-500">Please Verify Email Address</span>
      </div>
      <SignOutButton />
    </div>
  ) : (
    <>
      <Link
        to={ROUTES.HOME}
        className="mr-5 text-md font-bold font-dosis text-gray-800 hover:text-gray-500  hover:bg-gray-200 transition duration-150 ease-in-out rounded-full focus:bg-gray-200 px-2"
      >
        Home
      </Link>
      <Link
        to={ROUTES.ACCOUNT}
        className="mr-5 text-md font-bold font-dosis text-gray-800 hover:text-gray-500  hover:bg-gray-200 transition duration-150 ease-in-out rounded-full focus:bg-gray-200 px-2"
      >
        Account
      </Link>
      {!!authUser.roles[ROLES.ADMIN] && (
        <Link
          to={ROUTES.ADMIN}
          className="mr-5 text-md font-bold font-dosis text-gray-800 hover:text-gray-500  hover:bg-gray-200 transition duration-150 ease-in-out rounded-full focus:bg-gray-200 active:bg-gray-200 px-2"
        >
          Admin
        </Link>
      )}

      {!!authUser.roles[ROLES.USER] && (
        <Link
          to={ROUTES.USER}
          className="mr-5 text-md font-bold font-dosis text-gray-800 hover:text-gray-500  hover:bg-gray-200 transition duration-150 ease-in-out rounded-full focus:bg-gray-200 active:bg-gray-200 px-2"
        >
          User
        </Link>
      )}

      <SignOutButton />
    </>
  );

const NavigationNonAuth = () => (
  <>
    <Link
      to={ROUTES.SIGN_IN}
      className="mr-5 text-md font-bold font-dosis text-gray-800 hover:text-gray-500  hover:bg-gray-200 transition duration-150 ease-in-out rounded-full focus:bg-gray-200 px-2"
    >
      Login
    </Link>
    <Link to={ROUTES.SIGN_UP}>
      <button
        type="button"
        className="px-3 py-1 rounded-3xl text-md font-bold font-dosis bg-gradient-to-b from-gray-900 to-black text-white outline-none focus:outline-none hover:shadow-md hover:from-gray-900 transition duration-200 ease-in-out focus:bg-gray-200"
      >
        Sign Up
      </button>
    </Link>
  </>
);

const needsEmailVerification = (authUser) =>
  authUser &&
  !authUser.emailVerified &&
  authUser.providerData.map((provider) => provider.providerId).includes('password');

export default Navigation;
