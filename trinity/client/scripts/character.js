import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class CharacterControls {
    constructor(params) {
        this._params = params;
        this._move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        };
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);

        document.addEventListener('keydown', (event) => this.keyDown(event), false);
        document.addEventListener('keyup', (event) => this.keyUp(event), false);
    }

    keyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this._move.forward = true;
                break;
            case 65: // a
                this._move.left = true;
                break;
            case 83: // s
                this._move.backward = true;
                break;
            case 68: // d
                this._move.right = true;
                break;
        }
    }

    keyUp(event) {
        switch (event.keyCode) {
            case 87: // w
                this._move.forward = false;
                break;
            case 65: // a
                this._move.left = false;
                break;
            case 83: // s
                this._move.backward = false;
                break;
            case 68: // d
                this._move.right = false;
                break;
        }
    }

    update(delta) {
        const velocity = this._velocity;
        const move = this._move;
        const acc = this._acceleration.clone();
        const dec = this._decceleration.clone();

        if (move.forward) {
            velocity.z = THREE.MathUtils.clamp(velocity.z + acc.z * delta, -this._params.maxVelocity, this._params.maxVelocity);
        }
        if (move.backward) {
            velocity.z = THREE.MathUtils.clamp(velocity.z - acc.z * delta, -this._params.maxVelocity, this._params.maxVelocity);
        }
        if (move.left) {
            velocity.x = THREE.MathUtils.clamp(velocity.x - acc.x * delta, -this._params.maxVelocity, this._params.maxVelocity);
        }
        if (move.right) {
            velocity.x = THREE.MathUtils.clamp(velocity.x + acc.x * delta, -this._params.maxVelocity, this._params.maxVelocity);
        }

        if (!move.forward && !move.backward) {
            if (velocity.z > 0) {
                const damping = Math.min(velocity.z, -dec.z * delta);
                velocity.z += damping;
            } else {
                const damping = Math.max(velocity.z, dec.z * delta);
                velocity.z += damping;
            }
        }

        if (!move.left && !move.right) {
            if (velocity.x > 0) {
                const damping = Math.min(velocity.x, -dec.x * delta);
                velocity.x += damping;
            } else {
                const damping = Math.max(velocity.x, dec.x * delta);
                velocity.x += damping;
            }
        }

        this._params.target.position.add(velocity.clone().multiplyScalar(delta));
    }
}

class Animations {
    constructor(a) {
        this._animations = a;
    }

    get animations() {
        return this._animations;
    }
}

export default class Character{
    constructor(params) {
        this._params = params;
        this._animations = {};
        this._controls = null;
    }

    createModel = (camera) => {
        const loader = new FBXLoader();
        loader.load('models/character.fbx', (object) => {
            object.scale.setScalar(0.1);
            object.position.set(0, 0, 0);
            object.traverse(child => { child.castShadow = true; });
    
            this._controls = new CharacterControls({
                target: object,
                camera: camera,
            });
    
            const animation = new FBXLoader();
            animation.load('models/Idle.fbx', (anim) => {
                const mixer = new THREE.AnimationMixer(object);
                this._mixers.push(mixer);
                const action = mixer.clipAction(anim.animations[0]);
                action.play();
            });
    
            return object, mixers;
        });
    }
}
