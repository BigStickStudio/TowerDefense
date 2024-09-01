import * as THREE from 'three';

export default class CharacterController {
    constructor() {
        this._move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            run: false
        };
        this._decceleration = new THREE.Vector3(-4, -3, -3);
        this._acceleration = new THREE.Vector3(-0.1, 3, 0.7);
        this._velocity = new THREE.Vector3(0, -5, 0);
        this._max_velocity = 2;

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
            case 32: // space
                this._move.jump = true;
                break;
            case 16: // shift
                this._move.run = true;
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
            case 32: // space
                this._move.jump = false;
                break;
            case 16: // shift
                this._move.run = false;
                break
        }
    }

    update(delta) {
        const velocity = this._velocity;
        const move = this._move;
        let dec = this._decceleration.clone();
        let acc = this._acceleration.clone();
        let max_vel = this._max_velocity;

        if (move.run) {
            acc.z *= 1.5;
            acc.x /= velocity.z > 0 ? velocity.z * 2 : 1;
            max_vel *= 1.5;
        }

        if (!move.run) {
            dec.z *= 2;
        }

        // Acceleration
        if (move.forward) {
            velocity.z = THREE.MathUtils.clamp(velocity.z + acc.z * delta, 0, max_vel);
        }
        if (move.backward) {
            velocity.z = THREE.MathUtils.clamp(velocity.z - acc.z * delta, -max_vel, 0);
        }

        if (move.jump) {
            velocity.y = THREE.MathUtils.clamp(velocity.y + acc.y * delta, -max_vel, max_vel);
        }

        if (!this._target) 
            { return; }

        const control = this._target;
        const _quat = new THREE.Quaternion();
        const _axis = new THREE.Vector3(0, 1, 0);

        if (control.quaternion === undefined) {
            control.quaternion = new THREE.Quaternion();
        }

        const _rotation = control.quaternion.clone();

        if (move.left) {
            _quat.setFromAxisAngle(_axis, 0.05);
            _rotation.multiply(_quat);
        }

        if (move.right) {
            _quat.setFromAxisAngle(_axis, -0.05);
            _rotation.multiply(_quat);
        }

        control.quaternion.copy(_rotation);

        // Deceleration
        if (!move.forward && !move.backward) {
            if (velocity.z > 0) {
                const damping = Math.min(velocity.z, -dec.z * delta);
                velocity.z -= damping;
            } else {
                const damping = Math.max(velocity.z, dec.z * delta);
                velocity.z -= damping;
            }
        }

        if (!move.left && !move.right) {
            if (velocity.x > 0) {
                velocity.x -= Math.min(velocity.x, -dec.x * delta);
            } else {
                velocity.x -= Math.max(velocity.x, dec.x * delta);
            }
        }

        if (!move.jump) {
            if (velocity.y > -10) {
                velocity.y -= Math.min(velocity.y, -dec.y * delta);
            } 
        }

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(control.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(control.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x);
        forward.multiplyScalar(velocity.z);

        if (control?.position === undefined) {
            control.position = new THREE.Vector3();
        }

        control.position.add(forward);
        control.position.add(sideways);
        control.position.y += velocity.y;

        this._velocity.copy(velocity);
        this._target.position.copy(control.position);

        let total_velocity = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);

        if (!move.forward && !move.backward && total_velocity < 0.1) {
            console.log('Resting');
            if (this._state !== 'Resting') {
                this.setState('Resting');
            }
        } else if (velocity.y > 0) {
            if (move.run) {
                console.log('Jump');
                this.setState('Jump');
            } else {
                console.log('Jump');
                this.setState('Jump');
            }
        } else if (move.backward) {
            console.log('Walking backwards');
            this.setState('Walking');
        } else if (move.run) {
            console.log('Running');
            this.setState('Running');
        } else {
            console.log('Walking');
            this.setState('Walking');
        }
    }
}