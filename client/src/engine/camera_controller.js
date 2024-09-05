import * as THREE from "three";
import config from '../configs/camera_config.js';
import StateManager from "./state_manager.js";


const state = StateManager.instance;

export default class CameraController {
    d_mouse = new THREE.Vector2();

    constructor() {
        this.free_target = new THREE.Object3D();
    }

    updateFreeCamera = (target) =>
        {
            if (state.top_down) 
                {
                    this.free_target.position.set(target.position.x, -1, target.position.z);
                    this.free_target.lookAt(new THREE.Vector3(target.position.x, 0, target.position.z));
                }
            else 
                {
                    this.free_target.position.copy(target.position);
                    this.free_target.rotation.copy(target.rotation);
                }
        }

    set position(pos) 
        { 
            this.instance.position.set(pos.x, pos.y, pos.z); 
            this.free_target.position.set(pos.x, pos.y, pos.z);
        }

    set copyPosition(pos) 
        { 
            this.instance.position.copy(pos); 
            this.free_target.position.copy(pos);
        }

    set rotation(rot) 
        { 
            this.instance.rotation.set(rot.x, rot.y, rot.z); 
            this.free_target.rotation.set(rot.x, rot.y, rot.z);
        }
    
    set lookAt(pos) 
        { 
            this.instance.lookAt(pos); 
            this.free_target.lookAt(pos);
        }

    set aspect(aspect) 
        { 
            this.instance.aspect = aspect; 
            this.instance.updateProjectionMatrix();
        }

    zoom = (event) => 
        {
            let zoom = this._zoom_level;
            let zoom_height = this._zoom_height;
            let zoom_out = false

            if (event.deltaY > 0) 
                {
                    zoom += 0.3;
                    zoom_height += 0.2;
                } 
            else 
                {
                    zoom -= 0.3;
                    zoom_height -= 0.2;
                }

            zoom_out = zoom > this._zoom_level;

            // If we are over the max third person zoom
            if (zoom > config.max_zoom) {
                // If we are not in top down mode, switch to top down
                if (!state.top_down) 
                    {
                        zoom = config.top_down_height;
                        zoom_height = 0;
                        state.camera_position = "top-down";
                    }
                // If we are zooming in under top down mode, switch to third person 
                else if (!zoom_out && zoom < config.top_down_height) 
                    {
                        zoom = config.max_zoom;
                        zoom_height = config.max_zoom_height;
                        state.camera_position = "third-person";                
                    } 
                else 
                    {
                        // Else we want to scale top down zoom
                        if (zoom_out) 
                            {
                                if (zoom > config.max_top_down_height) 
                                    {
                                        zoom = config.max_top_down_height;
                                        zoom_height = 0;
                                    } 
                                else 
                                    {
                                        zoom *= 1.1;
                                        zoom_height = 0;
                                    }
                            } 
                        else // Otherwise scale down top down zoom 
                            { zoom *= 0.9; }
                    }
            }       

            else if (zoom < config.min_zoom) 
                {
                    if (!zoom_out) 
                        {
                            state.camera_position = "first-person";
                            zoom = -0.6;
                        } 
                    else 
                        {
                            zoom = config.min_zoom;
                            zoom_height = config.standard_zoom_height;
                            state.camera_position = "third-person";
                        }
                }

            if (zoom < config.standard_zoom) 
                { zoom_height = config.standard_zoom_height; }

            this._zoom_level = zoom;
            this._zoom_height = zoom_height;

            if (state.top_down) 
                {
                    this._target_offset.y = this._zoom_level;
                    this._target_offset.z = 0;
                }
            else 
                {
                    this._target_offset.z = -10 * this._zoom_level;
                    this._target_offset.y = 6.6 * this._zoom_height;
                    this._target_lookat.z += Math.abs(this._target_offset.z);
                }
        }

    _CalculateIdealOffset(target) 
        {
            const idealOffset = this._target_offset.clone();
            idealOffset.applyQuaternion(target.quaternion);
            idealOffset.add(target.position);

            return idealOffset;
        }

    _CalculateIdealLookat(target) 
        {
            if (state.top_down) 
                { return new THREE.Vector3(0, 0, 0); }

            const idealLookat = this._target_lookat.clone();
            idealLookat.applyQuaternion(target.quaternion);
            idealLookat.add(target.position);
            return idealLookat;
        }

    _CalculateMouseRotation() 
        {
            this._mouse_rotation.y -= this.d_mouse.x * 2.0;
            this._additional_zoom_height -= this.d_mouse.y * 10.0;
            const quaternion = new THREE.Quaternion().setFromEuler(this._mouse_rotation);
            return quaternion;
        }

    update(target, elapsed) 
        {
            if (!target) { return; }

            let target_clone;
            let idealOffset;
            let idealLookat;

            
            
            if (state.top_down) {
                target_clone = new THREE.Object3D();
                target_clone.position.set(target.position.x, -1, target.position.z);
                
                idealOffset = new THREE.Vector3(target.position.x, this._zoom_level, target.position.z);
                idealLookat = target_clone.position.clone();
                
                const t = 1.0 - Math.pow(0.00000001, elapsed);
                
                let current_position = this.instance.position.clone();
                let current_lookat = new THREE.Vector3(this.instance.position.x, 0, this.instance.position.z);

                current_position.lerp(idealOffset, t);
                current_lookat.lerp(idealLookat, t);

                this.copyPosition = current_position;
                this.lookAt = current_lookat;
            }
            else {
                target_clone = target.clone();

                const mouseRotation = this._CalculateMouseRotation();

                if (this._mouse_down && this._zoom_level > config.min_zoom) { 
                    target_clone.quaternion.multiply(mouseRotation); 
                }
                else { 
                    this._mouse_rotation.y = 0; 
                    this._additional_zoom_height = 0;
                }

                idealOffset = this._CalculateIdealOffset(target_clone);

                if (this._mouse_down) {
                    idealOffset.y += this._additional_zoom_height;
                }   

                idealLookat = this._CalculateIdealLookat(target_clone);

                // Creates a 'lagging' camera that follows the target
                if (this._zoom_level < config.min_zoom) {
                    this.copyPosition = idealOffset;
                    this.lookAt = idealLookat;
                } else {
                    const t = 1.0 - Math.pow(0.00000001, elapsed);
                
                    this._current_position.lerp(idealOffset, t);
                    this._current_lookat.lerp(idealLookat, t);
                
                    this.instance.position.copy(this._current_position);
                    this.instance.lookAt(this._current_lookat);   
                }
            }
        }
}