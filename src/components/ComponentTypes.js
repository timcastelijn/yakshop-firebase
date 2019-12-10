import React from 'react'
import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import {Divider, Form, Table, Button, Icon, Input, Container, Checkbox} from 'semantic-ui-react'

import { NavLink } from 'react-router-dom';


import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import { AuthUserContext } from './Session';

import PropTable from './PropTable.js'

class PermissionTable extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      value:this.props.value
    }
  }

  componentDidMount(){

  }

  onChange = (e, data)=>{
    const id = e.currentTarget.dataset.id

    if (!this.state.value.permissions) {
      this.state.value.permissions = {}
    }

    let value = update(this.state.value, {
      permissions:{
        [id]:{$set: data.checked},
      }
    })

    this.setState({value})

    this.props.value.permissions[id] = data.checked


  }

  render(){
    return(
      <Form>
        <Form.Group grouped>
          <Form.Field control={Checkbox} label={'TNMOOSTUSER'}
            data-id={"TNMOOSTUSER"}
            onChange={this.onChange}
            checked={this.state.value.permissions? this.state.value.permissions.TNMOOSTUSER : false}
            />
          <Form.Field  control={Checkbox}  label={'TNMUSER'}
            data-id={"TNMUSER"}
            onChange={this.onChange}
            checked={this.state.value.permissions? this.state.value.permissions.TNMUSER : false}
            />
        </Form.Group>
      </Form>
    )
  }
}

class EditableObjectTable extends React.Component{
  constructor(props){
    super(props)

    this.state = {
    }
  }

  render(){

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
            <Button> <Icon name='edit' /></Button>
          </div>:null
        }
      </div>
    )
  }
}

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

    if(!this.state.typesObject[uid].properties[index][name]){
      this.state.typesObject[uid].properties[index][name] = null
    }

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
                <Table.HeaderCell>id, name</Table.HeaderCell>
                <Table.HeaderCell>permissions</Table.HeaderCell>
                {/*<Table.HeaderCell>category</Table.HeaderCell>*/}
                {/*<Table.HeaderCell>properties2</Table.HeaderCell>*/}
                <Table.HeaderCell>properties</Table.HeaderCell>
              </Table.Row>

            </Table.Header>
            <Table.Body>
              {typesObject && Object.entries(typesObject).map(([key, value], index)=>(
                <Table.Row key={index}>
                  <Table.Cell>{index}</Table.Cell>
                  <Table.Cell>
                    <Input value={value.id} onChange={(e)=>this.changeValue(key, 'id', e.target.value)} />
                    <Input value={value.name} onChange={(e)=>this.changeValue(key, 'name', e.target.value)} />
                    <Input value={value.image} onChange={(e)=>this.changeValue(key, 'image', e.target.value)} />
                    <Input value={value.category} onChange={(e)=>this.changeValue(key, 'category', e.target.value)} />

                    {key}
                  </Table.Cell>
                  {/*<Table.Cell><Input value={value.permissions} onChange={(e)=>this.changeValue(key, 'permissions', e.target.value)} /></Table.Cell>*/}
                  <Table.Cell collapsing>
                    {/*<PropTable object={value.permissions}/>*/}
                    <PermissionTable value={value}/>
                  </Table.Cell>
                  {/*<Table.Cell collapsing>
                    <Input value={value.category} onChange={(e)=>this.changeValue(key, 'category', e.target.value)} />
                  </Table.Cell>*/}
                  {/*<Table.Cell>
                    <PropTable object={value.properties}/>
                  </Table.Cell>*/}
                  <Table.Cell collapsing>
                    <Table>
                      <Table.Body>
                        {Array.isArray(value.properties) && value.properties.map((prop, i)=>(
                          <Table.Row key={i}>
                            <Table.Cell collapsing><Input value={prop.count} onChange={(e)=>this.changeProp(key, i, 'count', e.target.value)}></Input></Table.Cell>
                            <Table.Cell collapsing><Input value={prop.propname} onChange={(e)=>this.changeProp(key, i, 'propname', e.target.value)}></Input></Table.Cell>
                            <Table.Cell collapsing><Input value={prop.propType} onChange={(e)=>this.changeProp(key, i, 'propType', e.target.value)}></Input></Table.Cell>
                            <Table.Cell collapsing><Input value={prop.default} onChange={(e)=>this.changeProp(key, i, 'default', e.target.value)}></Input></Table.Cell>
                            <Table.Cell collapsing><Input value={prop.accessLevel} onChange={(e)=>this.changeProp(key, i, 'accessLevel', e.target.value)}></Input></Table.Cell>
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
