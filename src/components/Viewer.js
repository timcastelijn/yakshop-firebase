import React from 'react';
import { Link } from 'react-router-dom';
import {Menu, Divider, Button, Form, Grid, Header, Image, Message, Segment} from 'semantic-ui-react'

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Scene} from './three/Scene.js'

class Renderer extends React.Component{
  componentDidMount(){


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
    return(
      <div className='fluid' style={{'background':'#cccccc', textAlign:'center', verticalAlign:'middle', height:'100%'}}>
        <Renderer/>
      </div>
    )
  }
}

export default Viewer
