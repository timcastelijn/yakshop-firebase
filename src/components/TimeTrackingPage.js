import React from 'react';
import { compose } from 'recompose';
import { NavLink } from 'react-router-dom';
import * as moment from 'moment'
import uuid from 'uuidv4';
import queryString from 'query-string'
import axios from 'axios'


import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import { AuthUserContext } from './Session';

import {Button, Table, Icon, Confirm} from 'semantic-ui-react'



class TimeTrackingPage extends React.Component{

  constructor(props){
    super(props)

    this.state={
      quotes:[],
      loading:false,
      accessToken:null,
    }
  }


  async componentDidMount() {
    this.setState({ loading: true });

    const parsed = queryString.parse(this.props.location.search);

    if (parsed.code){
        try{
          const access_token = await this.getToken()
          localStorage.setItem('accessToken', access_token)
          this.state.accessToken = access_token

          console.log(localStorage.accessToken);

        }catch(e){
          console.log(e);
        }

    }else{
      const accessToken = localStorage.accessToken

      this.setState({accessToken})

      console.log('access token',   accessToken);

      if (accessToken) {
        let response = await fetch(`https://cors-anywhere.herokuapp.com/https://redbooth.com/api/3/me?access_token=${accessToken}`)

        console.log(await response.json());

        var start = moment.tz("Europe/Amsterdam").subtract(1, 'day').add(2, 'hours').unix();
        var end = moment.tz("Europe/Amsterdam").add(2, 'hours').unix();



        console.log(start, end);
        let response2 = await fetch(`https://cors-anywhere.herokuapp.com/https://redbooth.com/api/3/activities?target_type=comment&created_from=${start}&created_to=${end}&access_token=${accessToken}`)

        console.log(await response2.json());



      }
    }











    // this.props.firebase.db.ref('quotes/').on('value', snapshot => {
    //   const quotesObject = snapshot.val();
    //
    //   if (!quotesObject) { this.setState({loading: false}); return false; }
    //
    //   const usersList = Object.keys(quotesObject).map(key => ({
    //     ...quotesObject[key],
    //     uid: key,
    //   }));
    //
    //   this.setState({
    //     quotes: usersList,
    //     loading: false,
    //   });
    // });
  }

  async getToken() {

    const parsed = queryString.parse(this.props.location.search);


    const data = {
      client_id:'f9a9513c3e75c3c8fc569a5209fab7d297985af564d0806448c2b8307bf07c28',
      client_secret:'9d4553f286823462ca25a9bca590e85dfbf2854c8570f62d028b7ab42c923f76',
      code:parsed.code,
      grant_type:'authorization_code',
      redirect_uri:'http://localhost:3000/timetracking'
    }




    const body= `client_id=${data.client_id}&client_secret=${data.client_secret}&code=${data.code}&grant_type=authorization_code&redirect_uri=${data.redirect_uri}`

    let response = await fetch("https://cors-anywhere.herokuapp.com/https://redbooth.com/oauth2/token", {
      body: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST"
    })

    let json = await response.json()
    console.log(json);
    return json.access_token

  }





  signInRedbooth = async ()=>{
    console.log('sign in redbooth');


    var url = new URL('https://redbooth.com/oauth2/authorize')
    var params = {
      client_id:'f9a9513c3e75c3c8fc569a5209fab7d297985af564d0806448c2b8307bf07c28',
      redirect_uri:window.location.href,
      response_type:'code',
    }


    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    const oauthUrl = url.href
    this.setState({oauthUrl})

    window.location = oauthUrl


  }

  render(){

    const {loading, quotes, oauthUrl} = this.state;

    return (
      <AuthUserContext.Consumer>
        {(authUser) => {
            return (
              <div>
                {loading?   <div>Loading...</div>:null }
                <Button onClick={this.signInRedbooth}> sign in redbooth</Button>

              </div>
            )}
        }

      </AuthUserContext.Consumer>
    )
  }
}


const condition = authUser => !!authUser;
// export default withAuthorization(condition)(HomePage);

export default compose(
  withAuthorization(condition),
  withFirebase,
)(TimeTrackingPage);
