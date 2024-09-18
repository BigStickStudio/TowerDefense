import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import CharacterController from './character_controller.js';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;

export default class Character extends CharacterController {
    _animations = {};
    _mixer = null;
    _manager = null;
    target = null;
    state = "Resting";


    constructor(path, position) 
        {
            super(self);
            this.createModel(path, position);
        }

    set setState(moving_state) 
        { 
            if (this.state === moving_state) { return; }
            
            this.state = moving_state; 
            state.moving_state = this.state;
        }

    loadAnimation = (name, animation) => 
        {
            console.log("Loading animation: ", name);
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

    // '/assets/models/towers/heavy_cannon_tower.glb'
    createModel = (path, position) => 
        {
            console.log("Creating model: ", path);
            const loader = new GLTFLoader();
            loader.load(path, (gltf) => {
                let model = gltf.scene;
                model.position.set(0, 1, 0); // TODO: Blender: Move model back 3
                model.traverse(child => { 
                    if (child.isObject3D) 
                        { 
                            child.scale.set(100, 100, 100);
                            let object = new THREE.Object3D();
                            object.copy(child.clone());
                            object.position.set(position.x, position.y, position.z);
                            //console.log("Adding model to state: ", object);
                            state.addModel(object); 
                        }
                 });
        
                this.target = model;
                // this._mixer = new THREE.AnimationMixer(model);

                // const animations = gltf.animations;
                // animations.forEach((animation) => {
                //     this.loadAnimation(animation.name, animation);
                // });

                // this._manager = new THREE.LoadingManager();
            });
        }

    update = (delta) => 
        {
            if (!this.target) { return; }

            super.update(delta);
        }
}
