import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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

const walk_to_idle = 1.0;
const walk_to_run = 2.5;
const run_to_walk = 5.0;
const move_to_jump = 1.0;
const idle_jump = 1.0;
const walk_to_backwards = 1.5;

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
        this.state = "Resting";
        this.createModel();
        this.camera = new Camera();
    }

    refreshCamera = () => {
        this.camera.instance.aspect = window.innerWidth / window.innerHeight;
        this.camera.instance.updateProjectionMatrix();
    }

    setState = (state) => { this.state = state; }

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
        this._animations = { ...this._animations, [name]: { animation, action } };
    }

    createModel = () => {
        let obj = null;
        const loader = new GLTFLoader();
        loader.load('models/MrMan.glb', (gltf) => {
            let model = gltf.scene;
            model.scale.setScalar(4);
            model.position.set(0, 0, 0);
            model.traverse(child => { child.castShadow = true; });
    
            this._target = model;
            this._scene.add(this._target);
            this._mixer = new THREE.AnimationMixer(model);

            const animations = gltf.animations;
            animations.forEach((animation) => {
                this.loadAnimation(animation.name, animation);
            });

            this._manager = new THREE.LoadingManager();
        });
    }

    crossFade = (start, end, duration) => {
        if (end) {
            end.enabled = true;
            end.setEffectiveWeight(1);
            end.setEffectiveTimeScale(1);
            end.time = 0;

            start.crossFadeTo(end, duration, true);
        }
    }
    
    prepareCrossFade = (start, end, duration) => {
        if (this.set_state === 'Resting' || !start || !end) {
            this.crossFade(start, end, duration);
        } else {
            this.syncCrossfade(start, end, duration);
        }

        if (end) {
            this.setState(end);
        } else {
            this.setState(start);
        }
    }

    syncCrossfade = (start, end, duration) => {
        this._mixer.addEventListener('loop', onLoopFinished);

        function onLoopFinished(e) {
            if (e.action === start) {
                console.log(`Crossfade finished ${JSON.stringify(start)}`);
                this._mixer.removeEventListener('loop', onLoopFinished);
                this.crossFade(start, end, duration);
            }
        }
    }

    updateAnimation = (elapsed) => {
        if (this.state === "")
            { return; }

        let animation = this._animations[this.state];

        if (animation && this.state !== this.set_state) {
            let prev_animation = this._animations[this.set_state];

            if (prev_animation) {
                this.syncCrossfade(animation.action, prev_animation.action, 0.35);
            } else {
                animation.action.enabled = true;
                animation.action.setEffectiveWeight(1);
                animation.action.setEffectiveTimeScale(1);
                animation.action.play();
            }

            this.set_state = this.state;
        }

        this._mixer.update(elapsed);
    }

    update = (delta) => {
        if (!this._target) { return; }

        let elapsed = delta * 5;

        super.update(delta);
        this.camera.update(this._target, delta);
        this.updateAnimation(elapsed);
    }
}
