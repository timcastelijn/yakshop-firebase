import React from 'react';
import { withAuthorization } from '../Session';

import './Home.css';

const HomePage = () => (
  <div>
    <header className="App-header" style={{ minHeight:'10px', height:'400px'}}>
      <img src={'/tnm-logo-final-white.png'} style={{height:'50%'}}className="App-logo" alt="logo" />
      {/*<p>The Home Page is accessible by every signed in user.</p>*/}
    </header>
    {/*<h1>TNMOffice Home Page</h1>*/}
    <h1>TNMOffice</h1>


  </div>
);
const condition = authUser => !!authUser;
export default withAuthorization(condition)(HomePage);
