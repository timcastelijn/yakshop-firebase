import React, { Component } from 'react';
import { compose } from 'recompose';
import {Button, Table, Icon, Confirm} from 'semantic-ui-react'

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import * as ROLES from '../../constants/roles';
import SignUpPage from '../SignUp'
import ComponentTypes from '../ComponentTypes.js'

class AdminPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      users: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val();

      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key,
      }));

      this.setState({
        users: usersList,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
   const { users, loading } = this.state;
   return (
     <div>
        <h1>Admin</h1>
        <p>
          The Admin Page is accessible by every signed in admin user.
        </p>

        <SignUpPage />
        {loading && <div>Loading ...</div>}
        <UserList users={users} />

        <h1> componentTypes</h1>
        <ComponentTypes />
      </div>
    );
  }
}

const UserList = ({ users }) => (
  <Table>
    <Table.Body>
      {users.map(user => (
        <Table.Row key={user.uid}>
          <Table.Cell>
            <strong>ID:</strong> {user.uid}
          </Table.Cell>
          <Table.Cell>
            <strong>E-Mail:</strong> {user.email}
          </Table.Cell>
          <Table.Cell>
            <strong>Username:</strong> {user.username}
          </Table.Cell>
          <Table.Cell>
            { user.roles && Object.entries(user.roles).map((role, i)=>(
                <div key={i}>{role}</div>
              ))}
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>

  </Table>

);

const condition = (authUser) => {

  return authUser && !! ( authUser.roles.ADMIN ) ;
}


export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage);
