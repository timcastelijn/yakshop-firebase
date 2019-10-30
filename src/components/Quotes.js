import React from 'react';
import { compose } from 'recompose';
import { NavLink } from 'react-router-dom';
import * as moment from 'moment'
import uuid from 'uuidv4';

import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import { AuthUserContext } from './Session';

import {Button, Table, Icon, Confirm} from 'semantic-ui-react'


class ConfirmExampleConfirm extends React.Component {
  state = { open: false }

  open = () => this.setState({ open: true })
  close = () => this.setState({ open: false })
  confirm = () => {
    this.props.onConfirm()
    this.setState({ open: false })
  }

  render() {
    return (
      <div>
        <Button onClick={this.open}>{this.props.children}</Button>
        <Confirm
          content={this.props.message}
          open={this.state.open}
          onCancel={this.close}
          onConfirm={this.confirm}
        />
      </div>
    )
  }
}

class Quotes extends React.Component{

  constructor(props){
    super(props)

    this.state={
      quotes:[],
      loading:false,
    }
  }


  componentDidMount() {
    this.setState({ loading: true });
    this.props.firebase.db.ref('quotes/').on('value', snapshot => {
      const quotesObject = snapshot.val();

      if (!quotesObject) { this.setState({loading: false}); return false; }

      const usersList = Object.keys(quotesObject).map(key => ({
        ...quotesObject[key],
        uid: key,
      }));

      this.setState({
        quotes: usersList,
        loading: false,
      });
    });
  }


  onAddQuote(authUser){

    var date = moment().format()

    this.props.firebase.db.ref('quotes/' + uuid() ).set({
        owner:authUser.uid,
        ownerName:authUser.username,
        projectName:'',
        items:[null],
        dateCreated:date,
    });

  }
  onDeleteQuote(quote){



    var date = moment().format()
    this.props.firebase.db.ref(`quotes/${quote.uid}` ).remove()


  }

  render(){

    const {loading, quotes} = this.state;

    return (
      <AuthUserContext.Consumer>
        {(authUser) => {
            return (
              <div>
                <h1>Quotes</h1>
                <p>This page is accessible by every signed in user.</p>

                <Button onClick={()=>this.onAddQuote(authUser)}>addQuote</Button>

                <hr></hr>

                {loading && <div>Loading ...</div>}

                <Table>
                  <Table.Body>
                    {quotes.map(quote => (
                        <Table.Row key={quote.uid}>
                            <Table.Cell>
                              <strong>owner:</strong> {quote.ownerName}
                            </Table.Cell>
                            <Table.Cell>
                              <strong>projectName:</strong> {quote.projectName}
                            </Table.Cell>
                            <Table.Cell>
                              <strong>itemCount:</strong> {quote.itemCount}
                            </Table.Cell>
                            <Table.Cell>
                              <strong>date:</strong> {quote.dateCreated}
                            </Table.Cell>
                            <Table.Cell collapsing>
                              <Button icon size='small'
                                as={ConfirmExampleConfirm}
                                message={'You are about to delete quote. Are you sure'}
                                onConfirm={()=>this.onDeleteQuote(quote)}>
                                <Icon name='minus' />
                              </Button>
                              <NavLink to={`/quote/${quote.uid}`}> <Icon name='edit' /></NavLink>

                            </Table.Cell>
                        </Table.Row>
                      )
                    )}
                  </Table.Body>
                </Table>


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
)(Quotes);
