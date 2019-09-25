import React from 'react'
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorization } from '../Session';
import { AuthUserContext } from '../Session';

class Quote extends React.Component{

  constructor(props){
    super(props)

    this.state = {
      uid:null,
      quote:{}
    }
  }

  componentDidMount(){

    const {uid} = this.props.match.params

    this.props.firebase.db.ref(`/quotes/${uid}`).once('value').then((snapshot) => {
      var quote = snapshot.val()  || null;
      this.setState({uid, quote})
    });
  }

  render(){
    const {uid} = this.state;
    const {ownerName, items, dateCreated} = this.state.quote;

    return(
      <div>
        <h1>Quote</h1>
        <div>uid: {uid}</div>
        <div>owner: {ownerName}</div>
        <div>date created: {dateCreated}</div>
      </div>
    )
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(Quote);
