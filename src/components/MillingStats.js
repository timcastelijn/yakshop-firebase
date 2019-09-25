import React from 'react';

import { AuthUserContext, withAuthorization } from './Session';
import {Stats} from './stats.js'


const MillingStats = () => (
  <div>
      <h1>MillingStats</h1>
      <Stats />
  </div>
);

const condition = authUser => !!authUser;
export default withAuthorization(condition)(MillingStats);
