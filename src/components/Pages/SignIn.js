import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'react-recompose';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import { faAt, faKey, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SignInPage = () => (
  <div className="flex flex-col items-center justify-center mt-20">
    <div className="flex flex-col bg-white shadow-md px-4 sm:px-6 md:px-8 lg:px-10 py-8 rounded-md w-full max-w-md">
      <div className="font-medium self-center text-xl sm:text-2xl uppercase text-gray-800">
        Login To Your Account
      </div>

      <div className="relative mt-10 h-px bg-gray-300">
        <div className="absolute left-0 top-0 flex justify-center w-full -mt-2">
          <span className="bg-white px-4 text-xs text-gray-500 uppercase">Login With Email</span>
        </div>
      </div>

      {/* Email and Password */}
      <SignInForm />

      <div className="flex justify-center items-center mt-6">
        <Link
          to={ROUTES.SIGN_UP}
          className="inline-flex items-center font-bold text-blue-500 hover:text-blue-700 text-xs text-center"
        >
          <FontAwesomeIcon icon={faUserPlus} size="lg" />
          <span className="ml-2">Don't have an account? SignUp!</span>
        </Link>
      </div>
    </div>
  </div>
);
const INITIAL_STATE = { email: '', password: '', error: null };
class SignInFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }
  onSubmit = (event) => {
    const { email, password } = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)

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
  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === '' || email === '';
    return (
      <div className="mt-10">
        {error && <p className="mb-4 text-center text-xs text-red-500">{error.message}</p>}
        <form onSubmit={this.onSubmit}>
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
              htmlFor="password"
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
                  name="password"
                  value={password}
                  onChange={this.onChange}
                />
              </div>
            </label>
          </div>

          <div className="flex w-full">
            <button
              disabled={isInvalid}
              type="submit"
              className={`flex items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 rounded py-2 w-full transition duration-150 ease-in ${
                isInvalid && 'opacity-50'
              }`}
            >
              <span className="mr-2 uppercase">Login</span>
              <FontAwesomeIcon icon={faSignInAlt} size="lg" />
            </button>
          </div>
        </form>
      </div>
    );
  }
}
const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);
export default SignInPage;
export { SignInForm };
