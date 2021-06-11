import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Navigation from './components/Pages/Navigation';
import LandingPage from './components/Pages/Landing';
import SignUpPage from './components/Pages/SignUp';
import SignInPage from './components/Pages/SignIn';
import HomePage from './components/Pages/Home';
import AccountPage from './components/Pages/Account';
import AdminPage from './components/Pages/Admin';

import * as ROUTES from './constants/routes';
import { withAuthentication } from './components/Session';

const App = () => (
  <Router>
    <div className="min-w-full bg-gray-100 flex flex-col">
      <div className="bg-white shadow-lg sm:rounded-3xl min-h-screen">
        <div className="px-20 py-6">
          <Navigation />

          <Route exact path={ROUTES.LANDING} component={LandingPage} />
          <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
          <Route path={ROUTES.SIGN_IN} component={SignInPage} />
          <Route path={ROUTES.HOME} component={HomePage} />
          <Route path={ROUTES.ACCOUNT} component={AccountPage} />
          <Route path={ROUTES.ADMIN} component={AdminPage} />
        </div>
      </div>
    </div>
  </Router>
);

export default withAuthentication(App);
