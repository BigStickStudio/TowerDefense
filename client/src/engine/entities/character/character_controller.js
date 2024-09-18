import * as THREE from 'three';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;

export default class CharacterController {
    constructor() 
        {
            this.enabled = true;
            this._decceleration = new THREE.Vector3(-4, -0.475, -3);
            this._acceleration = new THREE.Vector3(-0.1, 2.75, 0.7);
            this._velocity = new THREE.Vector3(0, -5, 0);
            this._max_velocity = 2;
            this.jumping = false;
        }

    update(delta) 
        {
            const velocity = this._velocity;
            const key_pressed = state.keyboard.key_pressed;
            let dec = this._decceleration.clone();
            let acc = this._acceleration.clone();
            let max_vel = this._max_velocity;

            if (key_pressed.shift) 
                {
                    acc.z *= 1.5;
                    acc.x /= velocity.z > 0 ? velocity.z * 2 : 1;
                    max_vel *= 1.5;
                }

            if (!key_pressed.shift) 
                { dec.z *= 2; }

            // Acceleration
            if (key_pressed.forward) 
                { velocity.z = THREE.MathUtils.clamp(velocity.z + acc.z * delta, 0, max_vel); }
            if (key_pressed.backward) 
                { velocity.z = THREE.MathUtils.clamp(velocity.z - acc.z * delta, -max_vel, 0); }


            if (this.target.position.y <= 0 && !key_pressed.space)
                { 
                    velocity.y = 0; 
                    this.target.position.y = 0;
                }
            else if (this.target.position.y > 5)
                { 
                    this.jumping = false;
                    velocity.y = THREE.MathUtils.lerp(velocity.y, dec.y, 0.1); 
                }
            else if ((key_pressed.space && this.target.position.y <= 0) || this.jumping)
                { 
                    if (!this.jumping) 
                        {
                            // This triggers our 'jumping' loop AND gives and 'explosive' jump
                            this.jumping = true;
                            velocity.y = THREE.MathUtils.clamp(velocity.y + acc.y * delta * 2, -dec.y, acc.y); 
                        }
                    else 
                        { velocity.y = THREE.MathUtils.lerp(velocity.y, acc.y, delta); }
                }
            

            if (!this.target) 
                { return; }

            const control = this.target;
            const _quat = new THREE.Quaternion();
            const _axis = new THREE.Vector3(0, 1, 0);

            if (control.quaternion === undefined) 
                { control.quaternion = new THREE.Quaternion(); }

            const _rotation = control.quaternion.clone();

            if (key_pressed.left) 
                {
                    _quat.setFromAxisAngle(_axis, 0.05);
                    _rotation.multiply(_quat);
                }

            if (key_pressed.right) 
                {
                    _quat.setFromAxisAngle(_axis, -0.05);
                    _rotation.multiply(_quat);
                }

            control.quaternion.copy(_rotation);

            // Deceleration
            if (!key_pressed.forward && !key_pressed.backward) 
                {
                    if (velocity.z > 0) 
                        {
                            const damping = Math.min(velocity.z, -dec.z * delta);
                            velocity.z -= damping;
                        } 
                    else 
                        {
                            const damping = Math.max(velocity.z, dec.z * delta);
                            velocity.z -= damping;
                        }
                }

            if (!key_pressed.left && !key_pressed.right) 
                {
                    if (velocity.x > 0) 
                        { velocity.x -= Math.min(velocity.x, -dec.x * delta); } 
                    else 
                        { velocity.x -= Math.max(velocity.x, dec.x * delta); }
                }

            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(control.quaternion);
            forward.normalize();

            const sideways = new THREE.Vector3(1, 0, 0);
            sideways.applyQuaternion(control.quaternion);
            sideways.normalize();

            sideways.multiplyScalar(velocity.x);
            forward.multiplyScalar(velocity.z);

            if (control?.position === undefined) 
                { control.position = new THREE.Vector3(); }

            control.position.add(forward);
            control.position.add(sideways);
            control.position.y += velocity.y;

            this._velocity.copy(velocity);
            this.target.position.copy(control.position);

            let total_velocity = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);

            if (!key_pressed.forward && !key_pressed.backward && total_velocity < 0.1) 
                {
                    if (this.state !== 'Resting') 
                        { this.setState = 'Resting'; }
                } 
            else if (velocity.y > 0) 
                {
                    if (key_pressed.shift) 
                        { this.setState = 'Jump'; } 
                    else 
                        { this.setState = 'Jump'; }
                } 
            else if (key_pressed.backward) 
                { this.setState = 'Reverse'; } 
            else if (key_pressed.shift) 
                { this.setState = 'Running'; } 
            else 
                { this.setState = 'Walking'; }
        }
}