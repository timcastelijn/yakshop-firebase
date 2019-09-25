import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import {Container} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'


import Navigation from '../Navigation';
import LandingPage from '../Landing';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home';
import Quote from '../Quote';
import AccountPage from '../Account';
import AdminPage from '../Admin';
import MillingStats from '../MillingStats.js';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

import { withAuthentication } from '../Session';


const App = () => (
  <Router>
    <Navigation />

    <Container>
      <hr />
      <Route exact path={ROUTES.LANDING} component={LandingPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route
        path={ROUTES.PASSWORD_FORGET}
        component={PasswordForgetPage}
      />
      <Route path={ROUTES.HOME} component={HomePage} />
      <Route path={'/millingstats'} component={MillingStats} />
      <Route path={ROUTES.QUOTE} component={Quote} />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.ADMIN} component={AdminPage} />
    </Container>
  </Router>
);
export default withAuthentication(App);
