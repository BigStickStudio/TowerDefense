import * as THREE from "three";
import config from '../configs/camera_config.js';
import StateManager from "./state_manager.js";

const state = StateManager.instance;

let mouse = new THREE.Vector2();
let prev_mouse = new THREE.Vector2();
let p_xy = new THREE.Vector2();

export default class CameraController {
    d_mouse = new THREE.Vector2();
    dp_xy = new THREE.Vector2();
    mouse_down_id = -1;
    rotator = false;

    constructor() {
        this.free_target = new THREE.Object3D();
        this.enable();
    }

    enable = () => 
        {
            console.log("Enabling Camera");
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

    mouseDown = (e) => 
        {
            this._mouse_button = e.button;
            this._mouse_down = true;

            // We only want to switch to free camera mode if we are in top down mode
            if (state.fixed_camera && state.top_down) 
                { state.toggleCameraMode(); }
        }
    
    get left_click() { return this._mouse_button === 0; }
    get middle_click() { return this._mouse_button === 1; }
    get right_click() { return this._mouse_button === 2; }

    mouseUp = (event) =>
        {
            this.rotator = false;
            this._mouse_down = false;
        }

    moveMouse = (event) => 
        {
            this.dp_xy.x = event.clientX - p_xy.x;
            this.dp_xy.y = event.clientY - p_xy.y;
            p_xy.x = event.clientX;
            p_xy.y = event.clientY;

            mouse.x = (p_xy.x / window.innerWidth) * 2 - 1;
            mouse.y = -(p_xy.y / window.innerHeight) * 2 + 1;

            this.d_mouse.x = +(mouse.x - prev_mouse.x).toFixed(3);
            this.d_mouse.y = +(mouse.y - prev_mouse.y).toFixed(3);
            prev_mouse.x = mouse.x;
            prev_mouse.y = mouse.y;

            if (this._mouse_down && !state.fixed_camera) 
                { this.moveCamera(); }
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

    updateFreeCamera = (target) =>
        {
            if (!target) { return; }
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

    zoom = (event) => 
        {
            let zoom = this._zoom_level;
            let zoom_height = this._zoom_height;
            let zoom_out = false

            if (event.deltaY > 0) 
                {
                    zoom += 0.15;
                    zoom_height += 0.2;
                } 
            else 
                {
                    zoom -= 0.15;
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
                else if (!zoom_out && state.fixed_camera && zoom < config.top_down_height) 
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
                        else if (state.fixed_camera ? zoom > config.min_zoom : zoom > config.top_down_height) // Otherwise scale down top down zoom 
                            { zoom *= 0.9; }
                    }
            }       

            // Handles Minimum Zoom Levels when Transitioning from 1st<->3rd Person
            else if (zoom < config.min_zoom && state.fixed_camera) 
                {
                    if (!zoom_out) 
                        {
                            state.camera_position = "first-person";
                            zoom = -0.6;
                        } 
                    else if (state.fixed_camera)
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
            else if (state.fixed_camera)
                {
                    this._target_offset.z = this._zoom_level * config.zoom_scalar;
                    this._target_offset.y = this._zoom_height * config.height_scalar;
                    this._target_lookat.z += Math.abs(this._target_offset.z);
                }
        }

    refresh = () => 
        { this.aspect = window.innerWidth / window.innerHeight; }
    
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

}