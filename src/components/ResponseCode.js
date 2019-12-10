import React from 'react';
import { compose } from 'recompose';
import { NavLink } from 'react-router-dom';
import * as moment from 'moment'
import uuid from 'uuidv4';

import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import { AuthUserContext } from './Session';

import {Button, Table, Icon, Confirm} from 'semantic-ui-react'



class ResponseCode extends React.Component{

  constructor(props){
    super(props)

  }


  componentDidMount() {
    console.log(this.props);

  }

  render(){


    const {code} = this.props.match.params

    return (
      <div>
          code: {code}
      </div>
    )
  }
}


const condition = authUser => !!authUser;
// export default withAuthorization(condition)(HomePage);

export default compose(
  withAuthorization(condition),
  withFirebase,
)(ResponseCode);
