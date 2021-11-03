import {g} from '../globals.js';
import * as THREE from 'three';
import {Scene} from './Scene.js'
import {SceneManager} from './SceneManager.js'

export class Renderer{
  constructor(firebase){

    const width = window.clientWidth
    const height = window.clientHeight

    console.log(width,height);


    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.set( 6,10,10);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio( window.devicePixelRatio );
    // this.renderer.setClearColor('#000000')
    this.renderer.setClearColor(0xA9E7DA);
    this.renderer.setSize(width, height)

    console.log('newScene');
    this.scene = new Scene(this.camera, this.renderer)
    this.sceneManager = new SceneManager(firebase, this.renderer, this.scene)



    this.onWindowResize();
    // window.addEventListener('resize', this.onWindowResize);

    this.start()



    g.renderer = this

  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  onWindowResize = () => {

    if(!this.mount){return}

    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( width , height );
  }




  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {


   this.renderScene()
   this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    // console.log(new Date());
    this.renderer.render(this.scene, this.camera)
  }
}
