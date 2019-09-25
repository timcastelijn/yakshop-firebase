import React from 'react';
import { Link } from 'react-router-dom';
import {Menu} from 'semantic-ui-react'


import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import { AuthUserContext } from '../Session';
import * as ROLES from '../../constants/roles';


const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <NavigationAuth authUser={authUser} />
      ):(
        <NavigationNonAuth />
      )
    }
  </AuthUserContext.Consumer>
);

const NavigationAuth = ({ authUser }) => {

  var activeItem = 'landing'

  return (<Menu secondary>
    <Menu.Item as={Link} to={ROUTES.LANDING} name='landing' active={activeItem === 'landing'}  />
    <Menu.Item as={Link} to={ROUTES.HOME} name='home' active={activeItem === 'home'}  />
    <Menu.Item as={Link} to={'/millingstats'} name='millingstats' active={activeItem === 'millingstats'}  />

    <Menu.Menu position='right'>
      <Menu.Item as={Link} to={ROUTES.ACCOUNT} name='account' active={activeItem === 'account'}  />
        {!!authUser.roles[ROLES.ADMIN] && (
          <Menu.Item as={Link} to={ROUTES.ADMIN} name='admin' active={activeItem === 'admin'}  />
        )}
      <Menu.Item as={SignOutButton} name='logout' />
    </Menu.Menu>
  </Menu>)
}



const NavigationNonAuth = () => {
  var activeItem = 'landing'

  return (
    <Menu secondary>
        <Menu.Item as={Link} to={ROUTES.LANDING} name='landing' active={activeItem === 'landing'}  />
        <Menu.Menu position='right'>

          <Menu.Item as={Link} to={ROUTES.SIGN_IN} name='sign in' active={activeItem === 'sign in'}  />
        </Menu.Menu>
    </Menu>
  )
}


export default Navigation;
