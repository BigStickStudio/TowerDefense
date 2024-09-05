import * as THREE from 'three';
import config from '../configs/camera_config.js';
import CameraController from './camera_controller.js';
import StateManager from "./state_manager.js";

const state = StateManager.instance;

let mouse = new THREE.Vector2();
let prev_mouse = new THREE.Vector2();

export default class Camera extends CameraController {
    instance = null;
    camera_enabled = false;

    _zoom_level = config.default_zoom;
    _zoom_height = config.default_zoom_height;
    _target_offset = new THREE.Vector3(0, config.default_zoom_height, -10);
    _target_lookat = new THREE.Vector3(0, 8, 5);
    _additional_zoom_height = 0;
    _mouse_down = false;
    _mouse_rotation = new THREE.Euler(0, 0, 0); 
    _current_position = new THREE.Vector3();
    _current_lookat = new THREE.Vector3();
 
    constructor(_renderer) 
        {
            super();
            this.init();
            this._renderer = _renderer; // TODO: Move this to State and Make State into Singleton Engine

        }


    init = () => 
        {
            this.instance = new THREE.PerspectiveCamera(config.fov, window.innerWidth / window.innerHeight, config.near, config.far);
            this.position = this._target_offset.x, this._target_offset.y, this._target_offset.z;
            this.lookAt = this._target_lookat;

            this.enable();
        }


    enable = () => 
        {
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

    refresh = () => 
        { this.aspect = window.innerWidth / window.innerHeight; }

    mouseDown = (event) => { this._mouse_down = true; }
    mouseUp = (event) => { this._mouse_down = false; }

    moveMouse = (event) => 
        {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.d_mouse.x = mouse.x - prev_mouse.x;
            this.d_mouse.y = mouse.y - prev_mouse.y;
            prev_mouse.x = mouse.x;
            prev_mouse.y = mouse.y;
        }

}