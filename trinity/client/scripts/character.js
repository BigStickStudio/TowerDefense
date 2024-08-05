import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.167.1/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import Camera from './camera.js';
import CharacterController from './controls.js';

class Animations {
    constructor(a) {
        this._animations = a;
    }

    get animations() {
        return this._animations;
    }
}

export default class Character extends CharacterController {
    constructor(scene) {
        super(self);
        this._scene = scene;
        this._animations = {};
        this._controls = null;
        this._target = null;
        this._manager = null;
        this._mixer = null;
        this._mixers = [];
        this.state = "idle";
        this.createModel();
        this.camera = new Camera();
    }

    refreshCamera = () => {
        this.camera.instance.aspect = window.innerWidth / window.innerHeight;
        this.camera.instance.updateProjectionMatrix();
    }

    setState = (state) => {
        if (this.state === state) { return; }
        this.state = state;
        this._mixer.stopAllAction();
        this._mixer.uncacheAction(this._animations[state].clip);
        this._animations[state].action.play();
    }

    loadAnimation = (name, animation) => {
        const clip = animation.animations[0];
        const action = this._mixer.clipAction(clip);
        this._animations[name] = { clip: clip, action: action };
    }

    createModel = () => {
        let obj = null;
        const loader = new FBXLoader();
        loader.load('models/character.fbx', (object) => {
            object.scale.setScalar(0.1);
            object.position.set(0, 0, 0);
            object.traverse(child => { child.castShadow = true; });
    
            this._target = object;
            this._scene.add(this._target);
            this._mixer = new THREE.AnimationMixer(object);
            this._manager = new THREE.LoadingManager();
 

            const animation = new FBXLoader();
            animation.load('models/Idle.fbx', (a) => { this.loadAnimation('idle', a); });
            animation.load('models/Walking.fbx', (a) => { this.loadAnimation('walk', a); });
            animation.load('models/Running.fbx', (a) => { this.loadAnimation('run', a); });
            animation.load('models/StillJump.fbx', (a) => { this.loadAnimation('jump', a); });
            animation.load('models/RunningJump.fbx', (a) => { this.loadAnimation('runjump', a); });
            animation.load('models/BackWalk.fbx', (a) => { this.loadAnimation('backwards', a); });
        });
    }

    update = (delta) => {
        if (!this._target) { return; }

        let elapse = delta * 5;

        super.update(delta);
        this.camera.update(this._target, delta);
        this._mixers?.map(mixer => mixer.update(elapse));
    }
}
