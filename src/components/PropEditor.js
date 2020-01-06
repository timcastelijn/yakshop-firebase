import React from 'react'
import { NavLink } from 'react-router-dom';

import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import {Divider, Form, Table, Button, Checkbox, Icon, Input, Container, Select} from 'semantic-ui-react'
import {  Header, Image, Modal } from 'semantic-ui-react'


import { withFirebase } from './Firebase';
import { withAuthorization, AuthUserContext, hasRights, AuthFilter } from './Session';

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
    LIST.push(item)
  }
}

getData()

const PriceTag = (value)=>(
  <span>{Math.round(value*100 )/100}</span>
)



const setPropValue = (prop, value) =>{
  console.log(prop.propname, value);
  prop.propValue = value
}


export const FilteredSelect = (props)=> {
  const options = []


  for (let item of props.options) {
    // skip items that are not in filterarray if a filterarray is provided
    if(props.filterarray && props.filterarray.indexOf(item.id) == -1){ continue };

    options.push({key:item.id, value:item.id, text:item.name, data:item})
  }

  return (
    options.length > 0?
    <Select {...props} options={options} />:<Select options={[]} disabled></Select>
  )
}

class TypedInput extends React.Component{
  constructor(props){
    super(props)

    this.state={
      value:this.props.prop.propValue
    }

    this.setValue = this.setValue.bind(this)
  }

  setValue(prop, value, updateFunc){
    prop.propValue = value

    this.setState({value:value})

    updateFunc()
  }

  render(){


    const {prop, updateFunc} = this.props
    const {value} = this.state

    switch (prop.propType) {
      case 'Material':
        return(
          // <Select value={prop.propValue} options={LIST} onChange={(e, {value})=>{ setValue(prop, value, this.props.handleEntryPropChange)} } />
          // <Select value={value} list={optionList(LIST, ['SPAN_MEL_WHI18', 'SPAN_MEL_RED18'])} onChange={(e, {value})=>{ this.setValue(prop, value, updateFunc)} } />
          <FilteredSelect value={value} options={LIST} filterarray={['SPAN-MST-GRN18', 'SPAN-MEL-WHI18', 'SPAN-MEL-RED18']} onChange={(e, {value})=>{ this.setValue(prop, value, updateFunc)} } />
        )
        break;
      case 'Boolean':
        return(
          <Checkbox checked={ (value === 'true') || (value === true) } onChange={(e, {checked})=>{ this.setValue(prop, checked, updateFunc) } }/>
        )
        break;
      case 'Number':
        return(
          <Input type='number' value={value} onChange={(e, {value})=>{ this.setValue(prop, value, updateFunc)} }/>
        )
        break;
      default:
        return(
          <Input value={value} onChange={(e, {value})=>{ this.setValue(prop, value, updateFunc)} }/>

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

const createCells = ( prop, updateFunc)=>{

  switch (getTypeString(prop)) {
    case 'number':
      return(
          <Table.Cell>
            <Input type='number' defaultValue={prop} />
          </Table.Cell>
      )
      break;

    case 'object':
      return Object.entries(prop).map(([k, v])=>
          ( k == 'propname' || k =='propValue' ?
            <Table.Cell key={k}>
              {k =='propValue'?
                <TypedInput value={v} propType={prop.propType} prop={prop} updateFunc={updateFunc} />
                :
                // <Input defaultValue={v} />
                null
              }
            </Table.Cell>:null
          )

          )
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

    const {object} = this.props;

    return(
      <Container>
        <Table>
          <Table.Body>
            {Object.entries(object).map(([k,v])=>
              ( hasRights( this.props.authUser, v.permissions)?
                <Table.Row key={k}>
                    <Table.Cell>
                      {v.propname}
                    </Table.Cell>
                    {createCells(v, this.props.updateFunc)}
                </Table.Row>
                :
                null
              )

            )}
          </Table.Body>
        </Table>
      </Container>
    )
  }
}

const Span = (props) =>(
  <span>{props.children}</span>
)

class PropEditor extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      object:this.props.object
    }
  }

  componentDidMount(){
  }

  updateDisplay=()=>{
    this.setState({object:this.props.object})
  }

  render(){

    return(
      <AuthUserContext.Consumer>
        { authUser =>
          authUser? (
            <div>
              { this.props.object?
                <div>
                  {
                    this.props.showtable?
                    <ul>
                      {Object.entries(this.props.object).map(([k, item], index)=>{
                        if (hasRights(authUser, item.permissions)) {
                          return (
                              <li key={index}>
                                  <span>{item.propname}:</span>
                                  <span>
                                    {item.propValue !== undefined?
                                      JSON.stringify(item.propValue):
                                      <span style={{'color':'grey', 'fontStyle': 'oblique'}}>{item.default}</span>}
                                  </span>
                                  <AuthFilter as={Span} auth={{'ADMIN':true}}>
                                    {' - '}€{Math.round(item.price*100)/100}
                                  </AuthFilter>
                              </li>:null
                            )
                        }
                      }



                      )}
                    </ul>:null
                  }
                  <Modal
                    trigger={<Button><Icon name='edit'/></Button>}
                    header='Edit'
                    content={ <PropTable object={this.props.object} authUser={authUser} updateFunc={this.props.propHandler}/> }
                    actions={[{ key: 'cancel', content: 'Cancel', positive: false },{ key: 'done', content: 'Done', positive: true }]}
                  />


                </div>:null
              }
            </div>
          ):null

        }
      </AuthUserContext.Consumer>

    )
  }
}



const condition = authUser => !!authUser;


export default compose(
  withAuthorization(condition),
  withFirebase,
)(PropEditor);
