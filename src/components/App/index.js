import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import {Container} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'


import Navigation from '../Navigation';
import LandingPage from '../Landing';
// import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
import HomePage from '../Home';
import Quotes from '../Quotes';
import Viewer from '../Viewer';
import Library from '../Library';
import Quote from '../Quote';
import AboutPage from '../AboutPage';
import AccountPage from '../Account';
import AdminPage from '../Admin';
import MillingStats from '../MillingStats.js';
import TimeTrackingPage from '../TimeTrackingPage.js';
import ResponseCode from '../ResponseCode.js';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

import { withAuthentication } from '../Session';


const App = () => (
  <Router>

      <div style={{height:'100vh', overflow:'hidden'}}>
        <Navigation/>

        <Route exact path={ROUTES.LANDING} component={Viewer} />
        {/*<Route path={ROUTES.SIGN_UP} component={SignUpPage} />*/}
        <Route path={'/builder'} component={Viewer} />
        <Route path={'/builder/:modelId'} component={Viewer} />
        <div style={{height:'100vh', overflow:'auto'}}>

        <Container>
          <Route path={ROUTES.SIGN_IN} component={SignInPage} />
          <Route
            path={ROUTES.PASSWORD_FORGET}
            component={PasswordForgetPage}
          />
          <Route path={'/Library'} component={Library} />
          <Route path={'/About'} component={AboutPage} />
          <Route path={ROUTES.HOME} component={HomePage} />
          <Route path={'/quotes'} component={Quotes} />
          <Route path={'/millingstats'} component={MillingStats} />
          <Route path={'/timetracking'} component={TimeTrackingPage} />
          <Route path={'/timetracking/:code'} component={ResponseCode} />

          <Route path={ROUTES.QUOTE} component={Quote} />
          <Route path={ROUTES.ACCOUNT} component={AccountPage} />
          <Route path={ROUTES.ADMIN} component={AdminPage} />
        </Container>
        </div>

      </div>

  </Router>
);
export default withAuthentication(App);
