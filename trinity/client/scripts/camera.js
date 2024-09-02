
import * as THREE from 'three';
import config from './camera_config.js';

let mouse = new THREE.Vector2();
let prev_mouse = new THREE.Vector2();
let d_mouse = new THREE.Vector2();

export default class Camera {
    constructor() {
        this._target_offset = new THREE.Vector3(0, 20, -10);
        this._target_lookat = new THREE.Vector3(0, 16, 10);
        this.initCamera();
        this._zoom_level = config.default_zoom;
        this._target_offset.z = -10 * this._zoom_level;
        this._zoom_height = config.default_zoom_height;
        this._lookat_point = 0;
        this._additional_zoom_height = 0;
        this._mouse_down = false;
        this._mouse_rotation = new THREE.Euler(0, 0, 0); 

        this._current_position = new THREE.Vector3();
        this._current_lookat = new THREE.Vector3();

        document.addEventListener('wheel', this.zoom, false);
        document.addEventListener('mousemove', this.moveMouse, false);
        document.addEventListener('mousedown', this.mouseDown, false);
        document.addEventListener('mouseup', this.mouseUp, false);
    }

    mouseDown = (event) => { this._mouse_down = true; }
    mouseUp = (event) => { this._mouse_down = false; }

    moveMouse = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        d_mouse.x = mouse.x - prev_mouse.x;
        d_mouse.y = mouse.y - prev_mouse.y;
        prev_mouse.x = mouse.x;
        prev_mouse.y = mouse.y;
    }

    zoom = (event) => {
        let zoom = this._zoom_level;
        let camera_offset = this._camera_offset;
        let zoom_height = this._zoom_height;
        let lookat_point = this._lookat_point;
        
        if (event.deltaY > 0) {
            zoom += 0.3;
            zoom_height += 0.2;
            lookat_point -= 0.3;
        } else {
            zoom -= 0.3;
            zoom_height -= 0.2;
            lookat_point += 0.3;
        }

        if (zoom > config.max_zoom) {
            if (!third_person) {
                zoom = config.max_zoom;
                zoom_height = config.top_down_height;
                lookat_point = config.top_down_zoom;
            }

            zoom = config.max_zoom;
            zoom_height = this._zoom_height;
        }
        else if (zoom < config.min_zoom) {
            zoom = -0.1;
            lookat_point = 0;
        }

        if (zoom > config.default_zoom) {
            lookat_point = 0;
        }

        if (zoom < config.default_zoom) {
            zoom_height = config.default_zoom_height;
        }

        this._zoom_level = zoom;
        this._zoom_height = zoom_height;
        this._lookat_point = lookat_point;
        this._camera_offset = camera_offset;

        this._target_offset.z = -10 * this._zoom_level;
        this._target_offset.y = 6.6 * this._zoom_height;
        this._target_lookat.z += Math.abs(this._target_offset.z);
    }

    initCamera = () => {
        this.instance = new THREE.PerspectiveCamera(config.fov, window.innerWidth / window.innerHeight, config.near, config.far);
        this.instance.position.set(this._target_offset.x, this._target_offset.y, this._target_offset.z);
        this.instance.lookAt(this._target_lookat);
    }


    _CalculateIdealOffset(target) {
        const idealOffset = this._target_offset.clone();
        idealOffset.applyQuaternion(target.quaternion);
        idealOffset.add(target.position);
        return idealOffset;
        }

    _CalculateIdealLookat(target) {
        const idealLookat = this._target_lookat.clone();
        idealLookat.applyQuaternion(target.quaternion);
        idealLookat.add(target.position);
        return idealLookat;
    }

    _CalculateMouseRotation() {
        this._mouse_rotation.y -= d_mouse.x * 2.0;
        this._additional_zoom_height -= d_mouse.y * 10.0;
        const quaternion = new THREE.Quaternion().setFromEuler(this._mouse_rotation);
        return quaternion;
    }

    update(target, elapsed) {   
        let target_clone = target.clone();
        const mouseRotation = this._CalculateMouseRotation();

        if (this._mouse_down && this._zoom_level > config.min_zoom) { 
            target_clone.quaternion.multiply(mouseRotation); 
        }
        else { 
            this._mouse_rotation.y = 0; 
            this._additional_zoom_height = 0;
        }

        const idealOffset = this._CalculateIdealOffset(target_clone);

        if (this._mouse_down) {
            idealOffset.y += this._additional_zoom_height;
        }   

        const idealLookat = this._CalculateIdealLookat(target_clone);

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