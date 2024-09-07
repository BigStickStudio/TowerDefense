import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import CharacterController from './character_controller.js';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;

export default class Character extends CharacterController {
    constructor() 
        {
            super(self);
            this._animations = {};
            this.target = null;
            this._manager = null;
            this._mixer = null;
            this._mixers = [];
            this.setState = "Resting";
            this.createModel();
        }

    set setState(moving_state) 
        { 
            if (this.state === moving_state) { return; }
            
            this.state = moving_state; 
            state.moving_state = this.state;
        }

    loadAnimation = (name, animation) => 
        {
            if (!this._mixer) 
                {
                    console.error("Mixer not initialized");
                    this._mixer = new THREE.AnimationMixer(this.target);
                }

            //const clip = animation.clip;
            const action = this._mixer.clipAction(animation);
            action.enabled = true;
            action.setEffectiveWeight(0.5);
            action.play();
            this._animations = { ...this._animations, [name]: { animation, action } };
        }

    createModel = () => 
        {
            const loader = new GLTFLoader();
            loader.load('assets/models/MrMan.glb', (gltf) => {
                let model = gltf.scene;
                model.position.set(0, 1, 0); // TODO: Blender: Move model back 3
                model.traverse(child => { child.castShadow = true; });
        
                this.target = model;
                this.target.name = "MrMan";
                state.scene.add(this.target);
                this._mixer = new THREE.AnimationMixer(model);

                const animations = gltf.animations;
                animations.forEach((animation) => {
                    this.loadAnimation(animation.name, animation);
                });

                this._manager = new THREE.LoadingManager();
            });
        }

    update = (delta) => 
        {
            if (!this.target) { return; }

            super.update(delta);
        }
}
