import React from 'react';
import { Link } from 'react-router-dom';
import {Button, Icon, Container, Sidebar, Menu, Divider} from 'semantic-ui-react'


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
        <NavigationNonAuth />
      )
    }
  </AuthUserContext.Consumer>
);

class SideBarWrapper extends React.Component{
  constructor(props){
    super(props)
    this.state = { };

    this.state ={
      sidebarOpened:false,
      width: 0,
      height: 0
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  handleSidebarHide = () => this.setState({ sidebarOpened: false })

  handleToggle = () => this.setState({ sidebarOpened: true })

  render(){
    const { children } = this.props
    const { sidebarOpened, width } = this.state
    const isMobile = width <= 768;

    return(
      <div>
        {isMobile?
          <div>
            <Menu secondary style={menuStyle}>
              <Menu.Item onClick={this.handleToggle}>
                <Icon name='sidebar' />
              </Menu.Item>
              <Menu.Item position='right'>
                <Menu.Item as={Link} to={ROUTES.SIGN_IN} name='sign in' />
              </Menu.Item>
            </Menu>
            <Sidebar
              as={Menu}
              animation='push'
              inverted
              onHide={this.handleSidebarHide}
              vertical
              visible={sidebarOpened}
              {...this.props}/>
          </div>
          :
          <Menu secondary style={menuStyle} {...this.props}/>}
      </div>

    )
  }
}

const NavigationAuth = ({ authUser }) => {

  var activeItem = 'landing'

  // console.log(Object.keys(authUser.roles).length > 0);


  return (

    <SideBarWrapper>
      {/*<Menu.Item as={Link} to={ROUTES.LANDING} name='landing' active={activeItem === 'landing'}  />*/}
      <Menu.Item as={Link} to={ROUTES.LANDING} name='Builder' active={activeItem === 'Builder'}  />
      {/*<Menu.Item as={Link} to={ROUTES.LANDING} name='Builder' active={activeItem === 'Builder'}  />*/}
      <Menu.Item as={Link} to={'/Library'} name='Library' active={activeItem === 'Library'}  />
      <Menu.Item as={Link} to={'/About'} name='About' active={activeItem === 'About'}  />

      <Menu.Menu position='right'>
        <Menu.Item as={Link} to={ROUTES.ACCOUNT} name='account' active={activeItem === 'account'}  />
          {authUser.roles  && authUser.roles.ADMIN && (
            <Menu.Item as={Link} to={ROUTES.ADMIN} name='admin' active={activeItem === 'admin'}  />
          )}
        <Menu.Item as={SignOutButton} name='logout' />
      </Menu.Menu>
    </SideBarWrapper>)
}



const NavigationNonAuth = () => {
  var activeItem = 'landing'

  return (

    <SideBarWrapper>
        <Menu.Item as={Link} to={ROUTES.LANDING} name='Builder' active={activeItem === 'Builder'}  />
        <Menu.Item as={Link} to={'/Library'} name='Library' active={activeItem === 'Library'}  />
        <Menu.Item as={Link} to={'/About'} name='About' active={activeItem === 'About'}  />

        <Menu.Menu position='right'>

          <Menu.Item as={Link} to={ROUTES.SIGN_IN} name='sign in' active={activeItem === 'sign in'}  />
        </Menu.Menu>
    </SideBarWrapper>
  )
}


export default Navigation;
