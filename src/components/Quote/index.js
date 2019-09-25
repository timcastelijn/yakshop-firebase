import React from 'react'
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import { AuthUserContext } from '../Session';
import update from 'immutability-helper';

import {Divider, Form, Table} from 'semantic-ui-react'

class Quote extends React.Component{

  constructor(props){
    super(props)

    this.state = {
      uid:null,
      quote:{
        projectName:'',
        items:[]
      }
    }
  }

  componentDidMount(){

    const {uid} = this.props.match.params

    this.props.firebase.db.ref(`/quotes/${uid}`).once('value').then((snapshot) => {
      var quote = snapshot.val()  || null;
      this.setState({uid, quote})
    });

    console.log(this.state.quote);
  }

  handleChange(prop, val){

    const quote = update(this.state.quote, {
      [prop]:{$set:val}
    })
    this.setState({quote})

  }

  render(){
    const {uid} = this.state;
    const {ownerName, items, dateCreated, projectName} = this.state.quote;

    return(
      <div style={{maxWidth:'300px'}}>
        <h1>Quote</h1>
        <Form>
          <Form.Field>
            <label>Project Name</label>
            <input placeholder='project Name' value={projectName}  onChange={(event)=>{ this.handleChange('projectName', event.target.value) }} />
          </Form.Field>
        </Form>
        <div>projectName: {projectName} </div>
        <div>owner: {ownerName} </div>
        <div>uid: {uid}</div>
        <div>date created: {dateCreated}</div>

        <Divider hidden> </Divider>

        <Table compact celled definition>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell>count</Table.HeaderCell>
              <Table.HeaderCell>type</Table.HeaderCell>
              <Table.HeaderCell>properties</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>price</Table.HeaderCell>
              <Table.HeaderCell>subtotal</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>

          </Table.Body>
        </Table>

      </div>
    )
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(Quote);
