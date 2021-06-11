import React from 'react';
import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (
  <button
    type="button"
    onClick={firebase.doSignOut}
    className="px-3 py-1 rounded-3xl text-md font-bold font-dosis bg-gradient-to-r from-gray-900 to-black text-white outline-none focus:outline-none hover:shadow-md hover:from-gray-900 hover:to-gray-700 transition duration-200 ease-in-out"
  >
    Sign Out
  </button>
);

export default withFirebase(SignOutButton);
