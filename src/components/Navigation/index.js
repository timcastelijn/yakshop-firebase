import React from 'react';
import { Link } from 'react-router-dom';
import {Menu, Divider} from 'semantic-ui-react'


import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import { AuthUserContext } from '../Session';
import * as ROLES from '../../constants/roles';

const menuStyle = {
  margin:'5px'
}
const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <NavigationAuth authUser={authUser} />
      ):(
        null
      )
    }
  </AuthUserContext.Consumer>
);

const NavigationAuth = ({ authUser }) => {

  var activeItem = 'landing'

  // console.log(Object.keys(authUser.roles).length > 0);


  return (<Menu secondary style={menuStyle}>
    {/*<Menu.Item as={Link} to={ROUTES.LANDING} name='landing' active={activeItem === 'landing'}  />*/}
    <Menu.Item as={Link} to={ROUTES.HOME} name='home' active={activeItem === 'home'}  />
    <Menu.Item as={Link} to={'/quotes'} name='quotes' active={activeItem === 'quotes'}  />
    {authUser.roles  && (authUser.roles.ADMIN ||  authUser.roles.TNMUSER) && (
      <Menu.Item as={Link} to={'/millingstats'} name='millingstats' active={activeItem === 'millingstats'}  />
    )}
    {/*<Menu.Item as={Link} to={'/timetracking'} name='timetracking' active={activeItem === 'millingstats'}  />*/}

    <Menu.Menu position='right'>
      <Menu.Item as={Link} to={ROUTES.ACCOUNT} name='account' active={activeItem === 'account'}  />
        {authUser.roles  && authUser.roles.ADMIN && (
          <Menu.Item as={Link} to={ROUTES.ADMIN} name='admin' active={activeItem === 'admin'}  />
        )}
      <Menu.Item as={SignOutButton} name='logout' />
    </Menu.Menu>
  </Menu>)
}



const NavigationNonAuth = () => {
  var activeItem = 'landing'

  return (
    <Menu secondary style={menuStyle}>
        {/*<Menu.Item as={Link} to={ROUTES.LANDING} name='landing' active={activeItem === 'landing'}  />*/}
        <Menu.Menu position='right'>

          {/*<Menu.Item as={Link} to={ROUTES.SIGN_IN} name='sign in' active={activeItem === 'sign in'}  />*/}
        </Menu.Menu>
    </Menu>
  )
}


export default Navigation;
