import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'react-recompose';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';

import { faAt, faKey, faSignInAlt, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SignUpPage = () => (
  <div className="flex flex-col items-center justify-center mt-20 flex-grow">
    <div className="flex flex-col bg-white shadow-md px-4 sm:px-6 md:px-8 lg:px-10 py-8 rounded-md w-full max-w-md">
      <div className="font-medium self-center text-xl sm:text-2xl uppercase text-gray-800">
        Create a new account
      </div>

      <div className="relative mt-10 h-px bg-gray-300">
        <div className="absolute left-0 top-0 flex justify-center w-full -mt-2">
          <span className="bg-white px-4 text-xs text-gray-500 uppercase"> SignUp With Email</span>
        </div>
      </div>

      <SignUpForm />

      <div className="flex justify-center items-center mt-6">
        <Link
          to={ROUTES.SIGN_IN}
          className="inline-flex items-center font-bold text-blue-500 hover:text-blue-700 text-xs text-center"
        >
          <FontAwesomeIcon icon={faUserPlus} size="lg" />
          <span className="ml-2">Already have an account? SignIn!</span>
        </Link>
      </div>
    </div>
  </div>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  isAdmin: false,
  error: null
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { username, email, passwordOne, isAdmin } = this.state;

    const roles = {};
    if (isAdmin) {
      roles[ROLES.ADMIN] = ROLES.ADMIN;
    }

    if (!isAdmin) {
      roles[ROLES.USER] = ROLES.USER;
    }

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then((authUser) => {
        // Create a user in your Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set({
          username,
          email,
          roles
        });
      })
      .then(() => {
        return this.props.firebase.doSendEmailVerification();
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch((error) => {
        this.setState({ error });
      });
    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onChangeCheckbox = (event) => {
    if (event.target.checked) {
      this.setState({ [event.target.name]: event.target.checked });
    } else {
      this.setState({ [event.target.name]: false });
    }
  };

  render() {
    const { username, email, passwordOne, passwordTwo, isAdmin, error } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo || passwordOne === '' || email === '' || username === '';

    return (
      <div className="mt-10">
        {error && <p className="mb-4 text-xs text-center text-red-500">{error.message}</p>}
        <form onSubmit={this.onSubmit}>
          <div className="flex flex-col mb-6">
            <label
              htmlFor="username"
              className="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
            >
              Full Name:
              <div className="relative">
                <div className="inline-flex items-center justify-center absolute left-0 top-0 h-full w-10 text-gray-400">
                  <FontAwesomeIcon icon={faUser} size="lg" />
                </div>

                <input
                  aria-label="Enter your full name"
                  type="text"
                  placeholder="Full name"
                  className="text-sm sm:text-base placeholder-gray-500 pl-10 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                  name="username"
                  value={username}
                  onChange={this.onChange}
                />
              </div>
            </label>
          </div>

          <div className="flex flex-col mb-6">
            <label htmlFor="email" className="mb-1 text-xs sm:text-sm tracking-wide text-gray-600">
              E-Mail Address:
              <div className="relative">
                <div className="inline-flex items-center justify-center absolute left-0 top-0 h-full w-10 text-gray-400">
                  <FontAwesomeIcon icon={faAt} size="lg" />
                </div>

                <input
                  aria-label="Enter your email address"
                  type="email"
                  placeholder="Email address"
                  className="text-sm sm:text-base placeholder-gray-500 pl-10 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                  name="email"
                  value={email}
                  onChange={this.onChange}
                />
              </div>
            </label>
          </div>
          <div className="flex flex-col mb-6">
            <label
              htmlFor="passwordOne"
              className="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
            >
              Password:
              <div className="relative">
                <div className="inline-flex items-center justify-center absolute left-0 top-0 h-full w-10 text-gray-400">
                  <FontAwesomeIcon icon={faKey} size="lg" />
                </div>

                <input
                  aria-label="Enter your password"
                  type="password"
                  placeholder="Password"
                  className="text-sm sm:text-base placeholder-gray-500 pl-10 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                  name="passwordOne"
                  value={passwordOne}
                  onChange={this.onChange}
                />
              </div>
            </label>
          </div>
          <div className="flex flex-col mb-6">
            <label
              htmlFor="passwordTwo"
              className="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
            >
              Confirm Password:
              <div className="relative">
                <div className="inline-flex items-center justify-center absolute left-0 top-0 h-full w-10 text-gray-400">
                  <FontAwesomeIcon icon={faKey} size="lg" />
                </div>

                <input
                  aria-label="Confirm your password"
                  type="password"
                  placeholder="Confirm Password"
                  className="text-sm sm:text-base placeholder-gray-500 pl-10 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                  name="passwordTwo"
                  value={passwordTwo}
                  onChange={this.onChange}
                />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-8 mb-6 items-center">
            <div className="p-4 max-w-xs mx-auto bg-white rounded-xl shadow-md">
              <label className="flex items-center space-x-3">
                <input
                  name="isAdmin"
                  type="checkbox"
                  checked={isAdmin}
                  onChange={this.onChangeCheckbox}
                  className="form-tick appearance-none h-6 w-6 border border-gray-300 rounded-md checked:bg-blue-600 checked:border-transparent focus:outline-none"
                />
                <span className="text-gray-900 font-medium">Admin</span>
              </label>
            </div>
          </div>
          <div className="flex w-full">
            <button
              disabled={isInvalid}
              type="submit"
              className={`flex items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 rounded py-2 w-full transition duration-150 ease-in ${
                isInvalid && 'opacity-50'
              }`}
            >
              <span className="mr-2 uppercase">Signup</span>
              <FontAwesomeIcon icon={faSignInAlt} size="lg" />
            </button>
          </div>
        </form>
      </div>
    );
  }
}

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpPage;
export { SignUpForm };
