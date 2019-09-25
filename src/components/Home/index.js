import React from 'react';
import { withAuthorization } from '../Session';

import {Button} from 'semantic-ui-react'

const HomePage = () => (
  <div>
    <h1>Home Page</h1>
    <p>The Home Page is accessible by every signed in user.</p>

    <Button> click Me</Button>
  </div>
);

const condition = authUser => !!authUser;
export default withAuthorization(condition)(HomePage);
