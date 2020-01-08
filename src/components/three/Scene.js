
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export class Scene{
    constructor(camera, renderer){

        this.camera = camera
        this.renderer = renderer

        //ADD SCENE
        this.scene = new THREE.Scene();
        // this.scene.background = new THREE.Color( 0x444444 );

        // ADD LIGHTS
        // var light = new THREE.DirectionalLight( 0xaaaaaa );
        // light.position.set( 2, 1, 3);
        // this.scene.add( light );

        // var light2 = new THREE.AmbientLight( 0x666666 );
        // this.scene.add( light2 );

        var light = new THREE.HemisphereLight(0xffffff, 0x0C056D, 0.6);
        this.scene.add(light);

        var light = new THREE.DirectionalLight(0x7fabc7, 1);
        light.position.set(2, 3, 4);
        this.scene.add(light);
        // var helper = new THREE.DirectionalLightHelper( light, 5 );
        // this.scene.add( helper );

        var light2 = light.clone();
        light2.position.set(2, 3, -4);
        this.scene.add(light2);


        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.25;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI / 2;

        // this.controls.target = new THREE.Vector3(2,4,0)


        const geometry = new THREE.BoxGeometry(3, 3, 3)
        const material = new THREE.MeshPhongMaterial({ color: '#433F81'     })
        this.cube = new THREE.Mesh(geometry, material)
        this.scene.add(this.cube)

        return this.scene
    }
}
