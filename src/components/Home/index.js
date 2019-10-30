import React from 'react';
import { withAuthorization } from '../Session';

import './Home.css';

const HomePage = () => (
  <div>
    <header className="App-header" style={{ minHeight:'10px', height:'400px'}}>
      <img src={'/TNM-logo-FINAL-white.png'} className="App-logo" alt="logo" />
      <p>The Home Page is accessible by every signed in user.</p>
    </header>
    {/*<h1>TNMOffice Home Page</h1>*/}


  </div>
);
const condition = authUser => !!authUser;
export default withAuthorization(condition)(HomePage);
