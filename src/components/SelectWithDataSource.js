import React, {useContext} from 'react'
import { compose } from 'recompose';
import uuid from 'uuidv4';
import update from 'immutability-helper';
import cloneDeep from 'lodash/cloneDeep'

import { withFirebase } from './Firebase';
import { withAuthorization, AuthUserContext, hasRights } from './Session';

import {Divider, Form, Table, Button, Icon, Input, Container, Select} from 'semantic-ui-react'
import { Header, Modal } from 'semantic-ui-react'

// function hasRights(authUser, permissions){
//   if (authUser.roles) {
//     if (authUser.roles.ADMIN || authUser.roles.TNMUSER) {
//         return true
//     }else{
//       for (let [role, value] of Object.entries(authUser.roles) ) {
//         if(permissions[role]){
//           return true
//         }
//       }
//     }
//   }
// }


const SelectWithDataSource = (props) => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <SelectWithDataSourceAuth {...props} authUser={authUser} />
      ):(
        null
      )
    }
  </AuthUserContext.Consumer>
);

class SelectWithDataSourceAuth extends React.Component{

  constructor(props){
    super(props)

    console.log(this.props.value);

    this.state = {
      value:this.props.value,
      options:[],
    }
  }

  componentDidMount(){
    let options = null



    if (this.props.dataSource == 'Firebase') {

      this.props.firebase.db.ref(`/componentTypes`).once('value').then((snapshot) => {
        this.typesObject = snapshot.val()  || {};

        const options =[]
        for (let [key, item]  of Object.entries(this.typesObject)) {

          if( hasRights(this.props.authUser, item.permissions)){
            console.log(item.name);
            options.push({
              key:key,
              value:key,
              text:item.name,
              image: { avatar: true, src: item.image },
          })

          }
        }
        this.setState({options})
      });

    }else if (this.props.dataSource == 'gSheets') {

    }
    //dataSource gsheets
    //dataSource firebase table
    //dataSource options
  }

  onChange = (e, { value }) => {
    this.setState({ value })
    this.props.onChange(e, {value:value})
  }

  render(){

    const {onChange, placeholder} = this.props
    const {options, value} = this.state

    return(
        <Select fluid placeholder={placeholder} value={value} options={options} onChange={this.onChange}/>
    )
  }
}




const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(SelectWithDataSource);
