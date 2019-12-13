import React from 'react'
import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import cloneDeep from 'lodash/cloneDeep'

import XLSX, {writeFile} from 'xlsx'

import { withFirebase } from '../Firebase';
import { withAuthorization, AuthUserContext, hasRights, AuthFilter } from '../Session';

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
  let range = 'Materialen!A1:P100';

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



function setValue(item, index, value, propHandler){
  item.properties[index].propValue = value
  propHandler(item.uid, index, value)
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
      const image = this.typesObject[value] && this.typesObject[value].image ? this.typesObject[value].image : ''

      for (let prop of propObject) {
        prop.propValue = prop.default
      }

      const quote = update(this.state.quote, {
        items:{
          [uid]:{
            [prop]:{$set:value},
            image:{$set:image},
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

  exportQuote = ()=>{


    const {quote} = this.state



    const otherdata = []

    otherdata.push( [ 'quoteid', quote.uid]     )
    otherdata.push( [   'project name', quote.projectName ] )
    otherdata.push( [   'date', quote.creationDate ] )
    otherdata.push( [   'timestamp', quote.timeStamp ] )
    otherdata.push( [    ] )

    otherdata.push( ['id', 'type', 'count', 'price', 'subtotal'])

    for (let [k, item] of Object.entries(quote.items)) {
      otherdata.push( [item.uid, item.name, item.count, item.price, item.price * item.count])
    }


    /* original data */
    var filename = quote.projectName + '.xlsx';
    var ws_name = "SheetJS";

    if(typeof console !== 'undefined') console.log(new Date());
    var wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(otherdata);

    /* add worksheet to workbook */
    XLSX.utils.book_append_sheet(wb, ws, ws_name);

    /* write workbook */
    if(typeof console !== 'undefined') console.log(new Date());
    XLSX.writeFile(wb, filename);
    if(typeof console !== 'undefined') console.log(new Date());

  }


  handleEntryPropChange = ()=>{



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

    console.log('LOOKUP', PRICETABLE);


    let priceTotal = 0


    for (let [k,item] of Object.entries(quote.items) ) {
      let price = 0

      // calc price for each prop
      if (!item.properties) { continue }

      for (let prop of item.properties ) {

        if (prop.unitprice){
          if(prop.propValue === 'true' || prop.propValue === true){
            price += parseFloat(prop.unitprice)
            prop.price = parseFloat(prop.unitprice)
          }
        }

        let lookup = PRICETABLE[prop.propValue]

        if (! lookup) { continue }
        var unitprice = Number(lookup.replace(/[^0-9.-]+/g,""));
        if( unitprice && parseFloat(prop.count) ){
          price += unitprice * parseFloat(prop.count)
          prop.price = unitprice * parseFloat(prop.count)
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
                <Form.Field inline>
                  <label>Project Name</label>
                  <input placeholder='project Name' value={projectName}  onChange={(event)=>{ this.handleChange('projectName', event.target.value) }} />
                </Form.Field>
              </Form>
              <div>owner: {ownerName} </div>
              <Divider hidden> </Divider>
              {/*<div>roles: {JSON.stringify(authUser.roles)} </div>*/}

              <div>uid: {uid}</div>
              <div>date created: {dateCreated}</div>

              <Divider hidden> </Divider>
                <Form>
                  <Form.Field inline>
                    <label>Materiaal Fronten</label>
                    <Select disabled value={'SPAN-MEL-WHI18'} options={LIST} onChange={(e, {value})=>{ console.log('ja zeetie')} } />
                  </Form.Field>
                  <Form.Field inline>
                    <label>Materiaal Blad</label>
                    <Select disabled value={'SPAN-MEL-WHI18'} options={LIST} onChange={(e, {value})=>{ console.log('ja zeetie')} } />
                  </Form.Field>
                </Form>
              <Divider hidden> </Divider>

              <Select placeholder='Bulk actions' disabled options={[{key:'edit properties', text:'edit properties', value:'edit properties'}]}/>
              <Divider hidden> </Divider>

              <Table compact celled definition>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell><Checkbox /></Table.HeaderCell>
                    <Table.HeaderCell>count</Table.HeaderCell>
                    <Table.HeaderCell>image</Table.HeaderCell>
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
                        <Table.Cell>
                          <img style={{'width':'200px'}}src={item.image}></img>
                        </Table.Cell>
                        <Table.Cell >
                          <SelectWithDataSource placeholder='Select type' value={item.type} dataSource={'Firebase'} onChange={(e, data) => this.handleEntryChange(item.uid, 'type', data.value)}/>
                          {/*<Select placeholder='Select type' value={item.type} options={typeOptions} onChange={(e, data) => this.handleEntryChange(item.uid, 'type', data.value)}/>*/}
                        </Table.Cell>
                        <Table.Cell>
                          <PropEditor showtable object={item.properties} propHandler={this.handleEntryPropChange}/>
                        </Table.Cell>
                        <Table.Cell collapsing>{Math.round(item.price * 100)/100}</Table.Cell>
                        <AuthFilter Component={Table.Cell} auth={{"TNMUSER":true, 'ADMIN':true}}>
                          <Input style={{width:'70px'}} type='number' step={'0.1'}value={item.raiseFactor} onChange={(e) => this.handleEntryChange(item.uid, 'raiseFactor', e.target.value)}/>
                        </AuthFilter>
                      <Table.Cell collapsing>{Math.round(item.count * item.raiseFactor * item.price*100)/100}</Table.Cell>
                        <Table.Cell collapsing><Button icon onClick={()=>this.removeEntry(item.uid)}><Icon name='minus'/></Button></Table.Cell>
                      </Table.Row>
                  ))}
                </Table.Body>
                <Table.Footer>
                  <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell colSpan='6'/>
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
                <Button onClick={this.exportQuote}>Export</Button>
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
