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
        this._mixer = null;
        this._manager = null;
        this._mixers = [];
        this.state = "idle";
        this.createModel();
        this.camera = new Camera();
    }

    refreshCamera = () => {
        this.camera.instance.aspect = window.innerWidth / window.innerHeight;
        this.camera.instance.updateProjectionMatrix();
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
            animation.load('models/Idle.fbx', (anim) => {
                const mixer = new THREE.AnimationMixer(object);
                this._mixers.push(mixer);
                const action = mixer.clipAction(anim.animations[0]);
                action.play();
            });
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
