import React, { Component } from 'react';
import {Button, Table, Icon, Confirm} from 'semantic-ui-react'

import axios from 'axios';
import moment from 'moment'

import { Timestamp } from "@firebase/firestore";
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import * as ROLES from '../../constants/roles';
import SignUpPage from '../SignUp'
// import ComponentTypes from '../ComponentTypes.js'

class AdminPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      users: [],
      models:[],
      selectedFile:null
    }
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .users()
      .onSnapshot(snapshot => {
        let users = [];

        snapshot.forEach(doc =>
          users.push({ ...doc.data(), uid: doc.id }),
        );

        this.setState({
          users,
          loading: false,
        });
      });

    this.unsubscribeModels = this.props.firebase
      .models()
      .onSnapshot(snapshot => {
        let models = [];

        snapshot.forEach(doc =>
          models.push({ ...doc.data(), uid: doc.id }),
        );

        this.setState({
          models,
          loading: false,
        });
      });
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
    this.unsubscribeModels && this.unsubscribeModels();
  }



  // On file upload (click the upload button)
  onFileUpload = () => {

    const {selectedFile} = this.state

    if (!selectedFile) {return false}

    const reader = new FileReader();
    reader.addEventListener('load', async (event) => {
      const data = JSON.parse(event.target.result)

      // set time format
      if(data.creation_date){
        data.creation_date = Timestamp.fromMillis( moment(data.creation_date, "YYYY-MM-DD hh:mm:ss").unix() * 1000);
      }
      if(data.modified){
        data.modified = Timestamp.fromMillis( moment(data.modified, "YYYY-MM-DD hh:mm:ss").unix() * 1000);
      }


      const res = await this.props.firebase.db.collection('models').doc(data.id).set(
        data
      );
      console.log('Added document with ID: ', res);

    });
    reader.readAsText(selectedFile, "UTF-8");
  };

  onFileChange = (event)=>{
    this.setState({ selectedFile: event.target.files[0] });
  }

  render() {
   const { users, loading, models } = this.state;


   return (
     <div>
        <h1>Admin</h1>
        <p>
          The Admin Page is accessible by every signed in admin user.
        </p>

        <SignUpPage />
        {loading && <div>Loading ...</div>}
        <UserList users={users} />

        <h1>Models</h1>
        <input type="file" onChange={this.onFileChange} />
        <Button onClick={this.onFileUpload}>Click Here</Button>
        <Table>
          <Table.Header>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>modified</Table.HeaderCell>
            <Table.HeaderCell>owner</Table.HeaderCell>
          </Table.Header>
          <Table.Body>
              {models && Object.entries(models).map(([uuid, model])=>(
                <Table.Row key={uuid}>
                  <Table.Cell>
                    {model.id}
                  </Table.Cell>
                  <Table.Cell>
                    {model.name}
                  </Table.Cell>
                  <Table.Cell>
                    {model.modified && model.modified.seconds? moment.unix(model.modified.seconds).format('YY/MM/DD hh:mm:ss'):null}
                  </Table.Cell>
                  <Table.Cell>
                    {model.user_name}
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>

        {/*<h1> componentTypes</h1>
        <ComponentTypes />*/}
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
