import React from 'react'
import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import cloneDeep from 'lodash/cloneDeep'


import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import { AuthUserContext } from '../Session';

import {Divider, Form, Table, Button, Icon, Input, Container, Select} from 'semantic-ui-react'

class Quote extends React.Component{

  constructor(props){
    super(props)

    this.state = {
      uid:null,
      isLoading:false,
      quote:{
        projectName:'',
        items:{}
      },
      typeOptions:[]

    }
    this.typesObject ={}
  }

  componentDidMount(){

    this.setState({isLoading:true})

    const {uid} = this.props.match.params

    this.props.firebase.db.ref(`/quotes/${uid}`).once('value').then((snapshot) => {
      var quote = snapshot.val()  || null;
      this.setState({
        uid:uid,
        quote:quote,
        isLoading:false,})
    });

    this.props.firebase.db.ref(`/componentTypes`).once('value').then((snapshot) => {
      this.typesObject = snapshot.val()  || {};

      const typeOptions =[]
      for (let [key, item]  of Object.entries(this.typesObject)) {
        typeOptions.push({key:key, value:key, text:`${item.id} - ${item.name}`})
      }
      this.setState({typeOptions})
    });

  }

  handleChange(prop, val){

    const quote = update(this.state.quote, {
      [prop]:{$set:val}
    })
    this.setState({quote})
  }

  handleEntryChange = (uid, prop, value)=>{

    console.log(uid, prop, value);
    const quote = update(this.state.quote, {
      items:{
        [uid]:{
          [prop]:{$set:value}
        }
      }
    })
    this.setState({quote})
  }

  addEntry = ()=>{
    const uid = uuid()
    const quote = update(this.state.quote, {
      items:{
        [uid]:{
          $set:{uid:uid, count:1, type:'none'}
        }
      }
    })
    this.setState({quote})
  }

  removeEntry = (uid)=>{

    console.log('remove: ', uid);

    var newItems = cloneDeep(this.state.quote.items)

    delete newItems[uid]

    console.log(newItems);

    const quote = update(this.state.quote, {
        items:{$set:newItems}
      }
    )
    this.setState({quote})
  }

  storeQuote = ()=>{

    const {uid, quote} = this.state;

    this.props.firebase.db.ref(`/quotes/${uid}`).set( quote );
  }

  render(){
    const {uid, isLoading, typeOptions} = this.state;
    const {ownerName, items, dateCreated, projectName} = this.state.quote;

    console.log(items);

    return(
      <div >
        <h1>Quote</h1>
        {isLoading?
        <div>Loading...</div>:
        <div>
          <Form style={{maxWidth:'300px'}}>
            <Form.Field>
              <label>Project Name</label>
              <input placeholder='project Name' value={projectName}  onChange={(event)=>{ this.handleChange('projectName', event.target.value) }} />
            </Form.Field>
          </Form>
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
                <Table.HeaderCell>price</Table.HeaderCell>
                <Table.HeaderCell>subtotal</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {Object.entries(items).map(([k, item], index)=>(
                  <Table.Row key={index}>
                    <Table.Cell>{index}</Table.Cell>
                    <Table.Cell collapsing><Input type='number' value={item.count} onChange={(e) => this.handleEntryChange(item.uid, 'count', e.target.value)}/></Table.Cell>
                    <Table.Cell collapsing>
                      <Select placeholder='Select type' value={item.type} options={typeOptions} onChange={(e, data) => this.handleEntryChange(item.uid, 'type', data.value)}/>
                    </Table.Cell>
                    <Table.Cell>
                      <ul>
                        {Array.isArray(item.properties) && item.properties.map((prop)=>(
                          <li>{prop}</li>
                        ))}
                      </ul>
                    </Table.Cell>
                    <Table.Cell>price</Table.Cell>
                    <Table.Cell>count * price</Table.Cell>
                    <Table.Cell collapsing><Button icon onClick={()=>this.removeEntry(item.uid)}><Icon name='minus'/></Button></Table.Cell>
                  </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell colSpan='5'/>
                <Table.HeaderCell >
                  <Button icon onClick = {this.addEntry}>
                    <Icon name='plus'/>
                  </Button>
                </Table.HeaderCell>
              </Table.Row>

            </Table.Footer>

          </Table>
          <Divider hidden></Divider>
          <Container>
            <Button onClick={this.storeQuote}>Save</Button>
          </Container>
          <Divider hidden></Divider>
        </div>
      }
      </div>
    )
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(Quote);
