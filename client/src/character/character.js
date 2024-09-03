import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Camera from '../world/camera_controller.js';
import State from '../world/state.js';
import CharacterController from './character_controller.js';

const state_instance = State.instance;

export default class Character extends CharacterController {
    constructor(scene, renderer) {
        super(self);
        this._scene = scene;
        this._animations = {};
        this._controls = null;
        this._target = null;
        this._manager = null;
        this._mixer = null;
        this._mixers = [];
        this.state = "Resting";
        state_instance.movingState = this.state;
        this.createModel();
        this.camera = new Camera(renderer);
    }

    refreshCamera = () => {
        this.camera.instance.aspect = window.innerWidth / window.innerHeight;
        this.camera.instance.updateProjectionMatrix();
    }

    setState = (state) => { 
        this.state = state; 
        state_instance.moving_state = this.state;
    }

    loadAnimation = (name, animation) => {
        console.log(`Loading animation ${name}`);

        if (!this._mixer) {
            console.error("Mixer not initialized");
            this._mixer = new THREE.AnimationMixer(this._target);
        }

        //const clip = animation.clip;
        const action = this._mixer.clipAction(animation);
        action.enabled = true;
        action.setEffectiveWeight(0.5);
        action.play();
        this._animations = { ...this._animations, [name]: { animation, action } };
    }

    createModel = () => {
        let obj = null;
        const loader = new GLTFLoader();
        loader.load('assets/models/MrMan.glb', (gltf) => {
            let model = gltf.scene;
            model.scale.setScalar(4);
            model.position.set(0, 0, 0); // TODO: Blender: Move model back 3
            model.traverse(child => { child.castShadow = true; });
    
            this._target = model;
            state_instance.camera_target = this._target;
            this._scene.add(this._target);
            this._mixer = new THREE.AnimationMixer(model);

            const animations = gltf.animations;
            animations.forEach((animation) => {
                this.loadAnimation(animation.name, animation);
            });

            this._manager = new THREE.LoadingManager();
        });
    }

    update = (delta) => {
        if (!this._target) { return; }

        super.update(delta);
        this.camera.update(this._target, delta);
    }
}
