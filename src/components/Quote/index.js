import React from 'react'
import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import cloneDeep from 'lodash/cloneDeep'


import { withFirebase } from '../Firebase';
import { withAuthorization, AuthUserContext, hasRights } from '../Session';

import {Divider, Form, Table, Button, Checkbox, Icon, Input, Container, Select} from 'semantic-ui-react'
import { Header, Modal } from 'semantic-ui-react'

import GoogleApi from './GoogleApi.js'
import SelectWithDataSource from './../SelectWithDataSource.js'

import PropTable from '../PropTable.js'
import PropEditor from '../PropEditor.js'

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

class Block{
  constructor(type){
      this.type = type
  }


  changeType(type, properties){
    this.type = type

    for (let prop of this.properties) {

    }
  }
}

// const PropertyTable = ({item})=>(
//   <ul>
//     {Array.isArray(item.properties) && item.properties.map((prop, index2)=>(
//       <li key={index2}>{prop.propname}:{prop.default}</li>
//     ))}
//   </ul>
// )

function setValue(item, index, value, propHandler){
  item.properties[index].propValue = value
  propHandler(item.uid, index, value)
}

const PropertyTable = ({ item, propHandler }) => {
  console.log(item);
  return (
    <Table>
      <Table.Body>
        {Array.isArray(item.properties) && item.properties.map((prop, index2)=>(
          <Table.Row key={index2}>
            <Table.Cell>{prop.propname}</Table.Cell>
            <Table.Cell>
              <input defaultValue={prop.count}  onChange={(e)=>{ setValue(item, index2, e.target.value, propHandler)}} />
            </Table.Cell>
            { prop.propType === 'Material'?
              <Table.Cell><Select value={item.properties[index2].propValue? item.properties[index2].propValue: LIST[0].value} options={LIST} onChange={(e,data)=>{ setValue(item, index2, data.value, propHandler) }} ></Select></Table.Cell>:
              <Table.Cell><input defaultValue={prop.propValue? prop.propValue: prop.default} onChange={(e,data)=>{ setValue(item, index2, data.value, propHandler) }}></input></Table.Cell>
            }
          </Table.Row>
        ))}

      </Table.Body>

    </Table>
  )
}




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

      if(quote.items == null){
        quote.items = []
      }
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

    if (prop == 'type') {

      const propObject = this.typesObject[value] ? this.typesObject[value].properties : []

      for (let prop of propObject) {
        prop.propValue = prop.default
      }

      const quote = update(this.state.quote, {
        items:{
          [uid]:{
            [prop]:{$set:value},
            properties:{$set: propObject }
          }
        }
      })
      this.updatePriceTotal(quote)

      this.setState({quote})
    }else{
      const quote = update(this.state.quote, {
        items:{
          [uid]:{
            [prop]:{$set:value}
          }
        }
      })
      this.updatePriceTotal(quote)

      this.setState({quote})
    }



  }


  handleEntryPropChange = (uid, index, value)=>{

    console.log('updateprop', this.state.quote.items[uid].properties[index].propname, value);


    const quote = update(this.state.quote, {})


    this.updatePriceTotal(quote)
    this.setState({quote})


    // console.log('priceTotal', quote);


  }

  updatePriceTotal= (quote)=>{


    if(!this.state.quote){
      console.log('somethin');
      return false
    }


    let priceTotal = 0


    for (let [k,item] of Object.entries(quote.items) ) {
      let price = 0

      // calc price for each prop
      if (!item.properties) { continue }

      for (let prop of item.properties ) {

        if (prop.propName === 'priceOverride'){
          price = parseFloat(prop.default)
          alert(price)
        }else{
          let lookup = PRICETABLE[prop.propValue]

          if (! lookup) { continue }
          var unitprice = Number(lookup.replace(/[^0-9.-]+/g,""));
          if( unitprice && parseFloat(prop.count) ){
            price += unitprice * parseFloat(prop.count)
          }
        }


      }
      item.price = price

      // console.log(k, item, price);
      if (parseFloat(price)) {
        priceTotal += item.count * parseFloat(price)
      }
    }

    quote.priceTotal = priceTotal


  }

  addEntry = ()=>{
    const uid = uuid()
    const quote = update(this.state.quote, {
      items:{
        [uid]:{
          $set:{uid:uid, count:1, type:'none', raiseFactor:1, price:0}
        }
      }
    })
    this.setState({quote})
  }

  removeEntry = (uid)=>{

    console.log('remove: ', uid);

    var newItems = cloneDeep(this.state.quote.items)

    delete newItems[uid]

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
    const {ownerName, items, dateCreated, projectName, priceTotal} = this.state.quote;

    return(
      <AuthUserContext.Consumer>
        {authUser =>
          authUser ? (
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
              <div>roles: {JSON.stringify(authUser.roles)} </div>

              <div>uid: {uid}</div>
              <div>date created: {dateCreated}</div>

              <Divider hidden> </Divider>

              <Select placeholder='Bulk actions' disabled options={[{key:'edit properties', text:'edit properties', value:'edit properties'}]}/>
              <Divider hidden> </Divider>

              <Table compact celled definition>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell><Checkbox /></Table.HeaderCell>
                    <Table.HeaderCell>count</Table.HeaderCell>
                    <Table.HeaderCell>type</Table.HeaderCell>
                    <Table.HeaderCell>properties</Table.HeaderCell>
                    <Table.HeaderCell>price</Table.HeaderCell>
                    { hasRights(authUser, {"TNMUSER":true, 'ADMIN':true})?
                      <Table.HeaderCell>raise factor</Table.HeaderCell>:null
                    }
                    <Table.HeaderCell>subtotal</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {items && Object.entries(items).map(([k, item], index)=>(
                      <Table.Row key={index}>
                        <Table.Cell>{index}</Table.Cell>
                        <Table.Cell><Checkbox /></Table.Cell>
                        <Table.Cell collapsing><Input style={{width:'70px'}}  type='number' value={item.count} onChange={(e) => this.handleEntryChange(item.uid, 'count', e.target.value)}/></Table.Cell>
                        <Table.Cell >
                          <SelectWithDataSource placeholder='Select type' value={item.type} dataSource={'Firebase'} onChange={(e, data) => this.handleEntryChange(item.uid, 'type', data.value)}/>
                          {/*<Select placeholder='Select type' value={item.type} options={typeOptions} onChange={(e, data) => this.handleEntryChange(item.uid, 'type', data.value)}/>*/}
                        </Table.Cell>
                        <Table.Cell>
                          <PropEditor showtable object={item.properties} propHandler={this.handleEntryPropChange}/>
                          {/*<ul>
                            {Array.isArray(item.properties) && item.properties.map((prop, index2)=>(
                              <li key={index2}>{prop.propname}:{prop.propValue? prop.propValue : prop.default}</li>
                            ))}
                          </ul>
                          <Modal
                            trigger={<Button><Icon name='edit'/></Button>}
                            header='Edit'
                            content={ <PropertyTable item={item} propHandler={this.handleEntryPropChange}/> }
                            actions={[{ key: 'cancel', content: 'Cancel', positive: false },{ key: 'done', content: 'Done', positive: true }]}
                            basic
                          />*/}

                        </Table.Cell>
                        <Table.Cell collapsing>{Math.round(item.price * 100)/100}</Table.Cell>
                        { hasRights(authUser, {"TNMUSER":true, 'ADMIN':true})?
                            <Table.Cell collapsing ><Input style={{width:'70px'}} type='number' step={'0.1'}value={item.raiseFactor} onChange={(e) => this.handleEntryChange(item.uid, 'raiseFactor', e.target.value)}/></Table.Cell>
                            :null
                        }
                      <Table.Cell collapsing>{Math.round(item.count * item.raiseFactor * item.price*100)/100}</Table.Cell>
                        <Table.Cell collapsing><Button icon onClick={()=>this.removeEntry(item.uid)}><Icon name='minus'/></Button></Table.Cell>
                      </Table.Row>
                  ))}
                </Table.Body>
                <Table.Footer>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell colSpan='4'/>
                      { hasRights(authUser, {"TNMUSER":true, 'ADMIN':true})?
                          <Table.HeaderCell />:null
                      }
                    <Table.HeaderCell >{Math.round(priceTotal * 100)/100}</Table.HeaderCell >
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
        </div>)
        :null}
      </AuthUserContext.Consumer>

    )
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(Quote);
