import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {Container, Menu, Divider, Button, Form, Grid, Header, Image, Message, Segment, Label, Icon} from 'semantic-ui-react'

import { compose } from 'recompose';
import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Scene} from './three/Scene.js'

class ViewerUI extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    return(
        <div style={{position:'absolute', width:'100vw', bottom:'0px', padding:'10px', overflow:'hidden'}}>
          <Grid columns={3}>
            <Grid.Column textAlign='left'>
              <Form.Group inline>
                <Label size='large'>
                  <Icon name='euro' /> 23
                </Label>
                <Button icon='shopping cart' />
              </Form.Group>
            </Grid.Column>
            <Grid.Column>
              <Form.Group inline>
                <Button icon='mouse pointer' />
                <Button icon='undo' />
                <Button icon='redo' />
                <Button icon='trash' />
              </Form.Group>
            </Grid.Column>
            <Grid.Column textAlign='right'>
              <Form.Group inline>
                <Button icon='file' />
                <Button icon='save' />
                <Button icon='folder' />
                <Button icon='upload' />
              </Form.Group>
            </Grid.Column>
          </Grid>
        </div>
    )
  }
}

class Renderer extends React.Component{

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      user: null,
    };
  }

  async componentDidMount(){

    //get model data
    if(this.props.modelId){
      const cityRef = this.props.firebase.db.collection('models').doc(this.props.modelId);
      const doc = await cityRef.get();
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        console.log('Document data:', doc.data());
      }
    }

    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.set(   6,10,10);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio( window.devicePixelRatio );
    // this.renderer.setClearColor('#000000')
    this.renderer.setClearColor(0xA9E7DA);
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)

    this.scene = new Scene(this.camera, this.renderer)

    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize);

    this.start()
  }

  onWindowResize = () => {

    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( width , height );
  }


  componentWillUnmount(){
    this.unsubscribe && this.unsubscribe()

    this.stop()
    this.mount.removeChild(this.renderer.domElement)
    window.removeEventListener('resize', this.onWindowResize);
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {


   this.renderScene()
   this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render(){
      return(
        <div
          style={{ overflow:'hidden', width: '100%', height:"100%"}}
          ref={(mount) => { this.mount = mount }}
        />
      )
    }
}

class Viewer extends React.Component{

  constructor(props){
    super(props)
  }

  render(){
    console.log(this.props.match.params.id);

    const {id} = this.props.match.params
    return(
      <div className='fluid' style={{'background':'#cccccc', textAlign:'center', verticalAlign:'middle', height:'100vh', overflow:'hidden'}}>
        {/*<Renderer key={id} modelId={id}/>*/}
        <Renderer firebase={this.props.firebase} modelId={id}/>
        <ViewerUI/>
      </div>
    )
  }
}

const condition = (authUser) => {

  return authUser && !! ( authUser.roles.ADMIN ) ;
}

// export default Viewer
export default compose(
  withAuthorization(condition),
  withFirebase,
)(Viewer);
