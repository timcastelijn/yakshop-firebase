import React from 'react';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { AuthUserContext } from '../Session';
import { SignInPage } from '../SignIn'
import { PasswordForgetLink } from '../PasswordForget';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';
import { Link, withRouter } from 'react-router-dom';


class Landing extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    return(
      <AuthUserContext.Consumer>
        {(authUser) => {
          if (authUser) {
            this.props.history.push( '/home' );
          }else{
            return (
              <SignInPage />
            )
          }
        }

        }
      </AuthUserContext.Consumer>
    )
  }
}

export default compose(
  withRouter,
  withFirebase,
)(Landing);
