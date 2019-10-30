import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

// import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const SignInPage = () => (
  <div>
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as='h2' textAlign='center'>
          <Image src='/logo_grey-zonder-tekst-100x100.png' /> Log-in to your account
        </Header>
        <SignInForm />
        <PasswordForgetLink />
      </Grid.Column>
    </Grid>

    {/*<SignUpLink />*/}
  </div>
);

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

class SignInFormBase extends Component {

  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { email, password } = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push( '/home' );
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === '' || email === '';
    return (
      <Form size='large' onSubmit={this.onSubmit}>
          <Form.Input fluid icon='user' name="email" value={email} iconPosition='left' placeholder='E-mail address' onChange={this.onChange}/>
          <Form.Input
            name="password"
            type='password'
            value={password}
            onChange={this.onChange}
            fluid
            icon='lock'
            iconPosition='left'
            placeholder='Password'
          />

          <Button type="submit" disabled={isInvalid} fluid size='large'>
            Login
          </Button>

      </Form>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

export default SignInPage;
export { SignInForm,  SignInPage};
