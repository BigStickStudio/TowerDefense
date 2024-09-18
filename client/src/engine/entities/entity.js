import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;

export default class Entity {
    _animations = {};
    _mixer = null;
    _manager = null;
    target = null;
    state = "Resting";


    constructor(name, path, position) 
        {
            this.createModel(name, path, position);
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
    createModel = (name, path, position) => 
        {
            console.log("Creating model: ", path);
            const loader = new GLTFLoader();
            loader.load(path, (gltf) => {
                let model = gltf.scene;
                model.position.set(0, 1, 0); // TODO: Blender: Move model back 3
                model.traverse(child => { 
                    if (child.isObject3D && child.name === "wall004") 
                        { 
                            // child.scale.set(100, 100, 100);
                            child.scale.set(0.1, 0.1, 0.1);
                            let object = new THREE.Object3D();
                            console.log(position);
                            object.copy(child.clone());
                            object.position.set(position.x, position.y, position.z);
                            object.rotation.y = Math.PI / 2;
                            //console.log("Adding model to state: ", object);
                            state.addModel(object); 
                        }
                 });
        
                this.target = model;
                this._mixer = new THREE.AnimationMixer(model);

                const animations = gltf.animations;
                animations.forEach((animation) => {
                    this.loadAnimation(animation.name, animation);
                });

                this._manager = new THREE.LoadingManager();
            });
        }
}
