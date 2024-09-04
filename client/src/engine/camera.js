import * as THREE from 'three';
import config from '../configs/camera_config.js';
import StateManager from "./state_manager.js";

const state = StateManager.instance;

let mouse = new THREE.Vector2();
let prev_mouse = new THREE.Vector2();
let d_mouse = new THREE.Vector2();

export default class Camera {
    camera_enabled = false;
    _target_offset = new THREE.Vector3(0, 20, -10);
    _target_lookat = new THREE.Vector3(0, 16, 10);
    _zoom_level = config.default_zoom;
    _zoom_height = config.default_zoom_height;
    _additional_zoom_height = 0;
    _mouse_down = false;
    _mouse_rotation = new THREE.Euler(0, 0, 0); 
    _current_position = new THREE.Vector3();
    _current_lookat = new THREE.Vector3();
 
    constructor(_renderer) 
        {
            this._renderer = _renderer; // TODO: Move this to State and Make State into Singleton Engine

            this.init();

            // Set the camera to the default zoom level
            this._target_offset.z = -10 * this._zoom_level;
        }

    enable = () => 
        {
            //console.log("Enabling Camera");
            if (this.camera_enabled) { return; }
            
            document.addEventListener('wheel', this.zoom, false);
            document.addEventListener('mousemove', this.moveMouse, false);
            document.addEventListener('mousedown', this.mouseDown, false);
            document.addEventListener('mouseup', this.mouseUp, false);

            this.camera_enabled = true;
        }

    disable = () => 
        {
            //console.log("Disabling Camera");
            if (!this.camera_enabled) { return; }

            document.removeEventListener('wheel', this.zoom, false);
            document.removeEventListener('mousemove', this.moveMouse, false);
            document.removeEventListener('mousedown', this.mouseDown, false);
            document.removeEventListener('mouseup', this.mouseUp, false);
            this.camera_enabled = false;
        }

    init = () => 
        {
            this.instance = new THREE.PerspectiveCamera(config.fov, window.innerWidth / window.innerHeight, config.near, config.far);
            this.instance.position.set(this._target_offset.x, this._target_offset.y, this._target_offset.z);
            this.instance.lookAt(this._target_lookat);

            this.enable();
        }

    refresh = () => 
        {
            this.instance.aspect = window.innerWidth / window.innerHeight;
            this.instance.updateProjectionMatrix();
        }

    mouseDown = (event) => { this._mouse_down = true; }
    mouseUp = (event) => { this._mouse_down = false; }

    moveMouse = (event) => 
        {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            d_mouse.x = mouse.x - prev_mouse.x;
            d_mouse.y = mouse.y - prev_mouse.y;
            prev_mouse.x = mouse.x;
            prev_mouse.y = mouse.y;
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
                        state.camera_mode = "top-down";
                    }
                // If we are zooming in under top down mode, switch to third person 
                else if (!zoom_out && zoom < config.top_down_height) 
                    {
                        zoom = config.max_zoom;
                        zoom_height = config.max_zoom_height;
                        state.camera_mode = "third-person";                
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
                            state.camera_mode = "first-person";
                            zoom = -0.6;
                        } 
                    else 
                        {
                            zoom = config.min_zoom;
                            zoom_height = config.default_zoom_height;
                            state.camera_mode = "third-person";
                        }
                }

            if (zoom < config.default_zoom) 
                { zoom_height = config.default_zoom_height; }

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
            this._mouse_rotation.y -= d_mouse.x * 2.0;
            this._additional_zoom_height -= d_mouse.y * 10.0;
            const quaternion = new THREE.Quaternion().setFromEuler(this._mouse_rotation);
            return quaternion;
        }

    update(target, elapsed) 
        {
            // There is a bug somewhere that causes 
            // this to be called before the target is set
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

                this.instance.position.copy(current_position);
                this.instance.lookAt(current_lookat);
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
                    this.instance.position.copy(idealOffset);
                    this.instance.lookAt(idealLookat);
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