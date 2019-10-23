import React from 'react'
import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import {Divider, Form, Table, Button, Icon, Input, Container} from 'semantic-ui-react'

import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import { AuthUserContext } from './Session';

class ComponentTypes extends React.Component{

  constructor(props){
    super(props)

    this.state = {
      typesObject:{},
      isLoading:false,
    }
  }

  componentDidMount(){
    this.setState({isLoading:true});

    this.props.firebase.db.ref(`/componentTypes`).once('value').then((snapshot) => {
      var typesObject = snapshot.val()  || {};
      this.setState({
        typesObject:typesObject,
        isLoading:false,})
    });
  }

  addEntry = ()=>{
    const uid = uuid()
    const typesObject = update(this.state.typesObject, {
      [uid]:{
        $set:{uid:uid, id:'FS017', name:'kruk laag', properties:[{propname:'m1', propType:'Material', "default":"Berken"}]}
      }
    })
    this.setState({typesObject})
  }

  changeValue(uid, prop, value){

    const typesObject = update(this.state.typesObject, {
      [uid]:{
        [prop]:{$set:value}
      }
    })
    this.setState({typesObject})
  }

  changeProp(uid, index, name, value){

    const typesObject = update(this.state.typesObject, {
      [uid]:{
        properties:{
          [index]:{
            [name]:{$set:value}
          }
        }
      }
    })
    this.setState({typesObject})
  }

  addProp(uid){
    const typesObject = update(this.state.typesObject, {
      [uid]:{
        properties:{
          $push:[{propname:'m1', propType:'Material', "default":"Berken"}]
        }
      }
    })
    this.setState({typesObject})

  }

  storeTypes = ()=>{

    const {uid, typesObject} = this.state;

    this.props.firebase.db.ref(`componentTypes`).set( typesObject );
  }

  render(){
    const {typesObject, isLoading} = this.state

    return(
      <div>
        {isLoading?
        <div>Loading...</div>:
        <div>
          <Table>
            <Table.Header>
              <Table.Row>

                <Table.HeaderCell>#</Table.HeaderCell>
                <Table.HeaderCell>id</Table.HeaderCell>
                <Table.HeaderCell>name</Table.HeaderCell>
                <Table.HeaderCell>properties</Table.HeaderCell>
              </Table.Row>

            </Table.Header>
            <Table.Body>
              {typesObject && Object.entries(typesObject).map(([key, value], index)=>(
                <Table.Row key={index}>
                  <Table.Cell>{index}</Table.Cell>
                  <Table.Cell><Input value={value.id} onChange={(e)=>this.changeValue(key, 'id', e.target.value)} /></Table.Cell>
                  <Table.Cell><Input value={value.name} onChange={(e)=>this.changeValue(key, 'name', e.target.value)} /></Table.Cell>
                  <Table.Cell collapsing>
                    <Table>
                      <Table.Body>
                        {Array.isArray(value.properties) && value.properties.map((prop, i)=>(
                          <Table.Row key={i}>
                            <Table.Cell><Input value={prop.count} onChange={(e)=>this.changeProp(key, i, 'count', e.target.value)}></Input></Table.Cell>
                            <Table.Cell><Input value={prop.propname} onChange={(e)=>this.changeProp(key, i, 'propname', e.target.value)}></Input></Table.Cell>
                            <Table.Cell><Input value={prop.propType} onChange={(e)=>this.changeProp(key, i, 'propType', e.target.value)}></Input></Table.Cell>
                            <Table.Cell><Input value={prop.default} onChange={(e)=>this.changeProp(key, i, 'default', e.target.value)}></Input></Table.Cell>
                          </Table.Row>
                        ))}
                        <Table.Row>
                          <Table.Cell><Button onClick={(e)=>this.addProp(key)}><Icon name='plus'/></Button></Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='4' >
                  <Button floated='right' icon onClick = {this.addEntry}>
                    <Icon name='plus'/>
                  </Button>
                </Table.HeaderCell>
              </Table.Row>

            </Table.Footer>
          </Table>
          <Divider hidden></Divider>
          <Container>
            <Button onClick={this.storeTypes}>Save</Button>
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
)(ComponentTypes);
