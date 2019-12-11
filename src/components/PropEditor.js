import React from 'react'
import { NavLink } from 'react-router-dom';

import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import {Divider, Form, Table, Button, Checkbox, Icon, Input, Container, Select} from 'semantic-ui-react'
import {  Header, Image, Modal } from 'semantic-ui-react'


import { withFirebase } from './Firebase';
import { withAuthorization, AuthUserContext } from './Session';

import GoogleApi from './Quote/GoogleApi.js'
const googleApi = new GoogleApi()
const LIST = []
const PRICETABLE ={}


async function getData(){
  let sheet_id = '1zFOYXGWqCkAikd9tYFYlg-5wxXuC1biZ1RveHO_jWJk'
  let range = 'Materialen!A1:M88';

  let templist = await googleApi.getSheetData(sheet_id, range);

  let keys = []
  for (let item of templist) {
    if (keys.indexOf(item.id) != -1) {
      continue
    }
    keys.push(item.id)
    PRICETABLE[item.id] = item['prijs/pt']
    LIST.push({key:item.id, value:item.id, text:item.name, data:item})
  }
}

getData()







class TypedInput extends React.Component{
  constructor(props){
    super(props)

    this.state={
      value:this.props.value
    }
  }

  render(){


    const {prop, propType} = this.props

    console.log(prop.propname, this.state.value);

    switch (propType) {
      case 'Material':
        return(
          <Select value={this.state.value} options={LIST} onChange={(e, {value})=>{ setValue(prop, value, this.props.handleEntryPropChange)} } />
        )
        break;
      case 'Boolean':
        const value = (this.state.value === 'true') || (this.state.value === true);
        return(
          <Checkbox checked={value} onChange={(e, {checked})=>{ setValue(prop, checked, this.props.handleEntryPropChange) } }/>
        )
        break;
      default:
        return(
          <Input value={this.state.value} onChange={this.props.handleChange}/>

        )
    }

  }
}


// console.log(getTypeString(true))
// console.log(getTypeString(['a', 'b']))
// console.log(getTypeString('true'))
// console.log(getTypeString({'a':1, 'b':2}))
// console.log(getTypeString(function(){console.log('foo')}))
// console.log(getTypeString(1))
// console.log(getTypeString(3.5))
const getTypeString = (val) => {
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
      break;
    case '[object Boolean]':
      return 'boolean'
      break;
    case '[object Function]':
      return 'function'
      break;
    default:
      return 'string'
      // primitive
  }
}

function setValue(prop, value, handleEntryPropChange){
  prop.propValue = value
  handleEntryPropChange('item.uid', prop.propname, value)
}

const createCells = ( prop, handleEntryPropChange)=>{

  switch (getTypeString(prop)) {
    case 'number':
      return(
          <Table.Cell>
            <Input type='number' defaultValue={prop} />
          </Table.Cell>
      )
      break;

    case 'object':
      return Object.entries(prop).map(([k, v])=>(
            <Table.Cell key={k}>
              {k =='propValue'?
                <TypedInput value={v} propType={prop.propType} prop={prop} handleEntryPropChange={handleEntryPropChange} />
                :
                // <Input defaultValue={v} />
                null
              }
            </Table.Cell>
          ))
      break;

    case 'array':
      return prop.map((k, v)=>(
            <Table.Cell key={k}>
              <Input defaultValue={v} />
            </Table.Cell>
          ))
      break;
    default: //string
      return(
          <Table.Cell>
            <Input defaultValue={prop} />
          </Table.Cell>
      )

  }
}



class PropTable extends React.Component{

  constructor(props){
    super(props)

    this.state={
      object:this.props.object
    }
  }

  render(){

    const {object} = this.state;

    return(
      <Container>
        <Table>
          <Table.Body>
            {Object.entries(object).map(([k,v])=>(
              <Table.Row key={k}>
                  <Table.Cell>
                    {v.propname}
                  </Table.Cell>
                  {createCells(v, this.props.propHandler)}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    )
  }
}

class PropEditor extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      object:this.props.object
    }
  }

  componentDidMount(){
  }

  render(){
    const {onChange} = this.state

    return(
      <div>
        { this.props.object?
          <div>
            {
              this.props.showtable?
              <ul>
                {Object.entries(this.props.object).map(([k, item], index)=>(
                    <li key={index}>
                      {item.propname} {item.propValue !== undefined? JSON.stringify(item.propValue): <span style={{'color':'grey', 'fontStyle': 'oblique'}}>{item.default}</span>}
                    </li>
                ))}
              </ul>:null
            }
            <Modal
              trigger={<Button><Icon name='edit'/></Button>}
              header='Edit'
              content={ <PropTable object={this.state.object} propHandler={this.props.propHandler} /> }
              actions={[{ key: 'cancel', content: 'Cancel', positive: false },{ key: 'done', content: 'Done', positive: true }]}
            />


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
)(PropEditor);
