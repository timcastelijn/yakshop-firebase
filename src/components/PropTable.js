import React from 'react'
import { NavLink } from 'react-router-dom';

import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import {Divider, Form, Table, Button, Icon, Input, Container} from 'semantic-ui-react'
import {  Header, Image, Modal } from 'semantic-ui-react'


import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import { AuthUserContext } from './Session';



const getTypeString = (val)=>{
  const strType = Object.prototype.toString.call(val)

  switch (strType) {
    case '[object Object]':
      return 'object'

      break;
    case '[object Array]':
      return 'array'
      break;
    case '[object Number]':
      return 'number'

    default:
      return 'string'
      // primitive
  }
}

const createCells = ( item, onChange)=>{

  switch (getTypeString(item)) {
    case 'string':
      return(
          <Table.Cell>
            <input defaultValue={item} />
          </Table.Cell>
      )
      break;

    case 'object':
      return Object.entries(item).map(([k, v])=>(
            <Table.Cell key={k}>
              <input defaultValue={v} />
            </Table.Cell>
          ))
      break;

    case 'array':
      return item.map((k, v)=>(
            <Table.Cell key={k}>
              <input defaultValue={v} />
            </Table.Cell>
          ))
      break;
    default: //string
      return(
          <Table.Cell>
            <input type='number' defaultValue={item} />
          </Table.Cell>
      )

  }
}


class PropTable extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      object:this.props.object
    }
  }

  addProp = ()=>{

    // update state
    const newProp = {[uuid()]:{a:1, b:2, c:3}}

    let object = update(this.state.object, {
      $merge: newProp
    })

    this.setState({object})

    // send state to parent component
  }

  componentDidMount(){
  }

  render(){
    const {onChange} = this.state

    return(
      <div>
        { this.props.object?
          <div>
            <ul>
              {Object.entries(this.props.object).map(([k, item], index)=>(
                  <li key={index}>
                    {k} {JSON.stringify(item)}
                  </li>
              ))}
            </ul>

            <Modal trigger={ <Button> Long Modal </Button> } >
              <Modal.Header>Profile Picture</Modal.Header>
              {/*<Modal.Content image>*/}
                {/*<Image wrapped size='medium' src='https://react.semantic-ui.com/images/wireframe/image.png' />*/}
              <Modal.Content>
                <Modal.Description>
                  <Header>Modal Header</Header>
                  <Table>
                    <Table.Body>
                    {Object.entries(this.state.object).map(([k, item], index)=>(
                        <Table.Row key={index}>
                          <Table.Cell>
                            <Input value={k}  />
                          </Table.Cell>
                          {createCells( item )}
                        </Table.Row>
                    ))}

                    </Table.Body>
                  </Table>
                  <Button floated='right' icon onClick = {this.addProp}>
                    <Icon name='plus'/>
                  </Button>
                </Modal.Description>

              </Modal.Content>
              <Modal.Actions>
                <Button primary>
                  Proceed <Icon name='right chevron' />
                </Button>
              </Modal.Actions>
            </Modal>
          </div>:null
        }
      </div>
    )
  }
}



const condition = authUser => !!authUser;


export default compose(
  withAuthorization(condition),
  withFirebase,
)(PropTable);
