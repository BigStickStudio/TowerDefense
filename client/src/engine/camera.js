import * as THREE from 'three';
import config from '../configs/camera_config.js';
import CameraController from './camera_controller.js';
import StateManager from "./state_manager.js";

const state = StateManager.instance;

export default class Camera extends CameraController {
    instance = null;

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
        }

    moveCamera = () => 
        {
            if (this.middle_click)
                {
                    let dx = this.dp_xy.x * this._zoom_level / 10;
                    let dy = this.dp_xy.y * this._zoom_level / 10;
                    let pos = this.instance.position.clone();
                    this.free_target.position.set(pos.x - dx, pos.y, pos.z - dy);
                }
            if (this.left_click)
                {
                }
        }
    
    update(target, elapsed) 
        {
            if (!target) { return; }

            let target_clone;
            let idealOffset;
            let idealLookat;
            
            if (state.top_down) 
                {
                    const t = 1.0 - Math.pow(0.00000001, elapsed);
                    target_clone = new THREE.Object3D();
                    
                    if (!this.rotator)
                        { target_clone.position.set(target.position.x, -1, target.position.z);} 
                    else 
                        { target_clone.position.set(target.position.x, this._zoom_level, target.position.z); }
                    
                    idealOffset = new THREE.Vector3(target.position.x, this._zoom_level, target.position.z);
                    let current_position = this.instance.position.clone();
                    current_position.lerp(idealOffset, t);
                    

                    idealLookat = target_clone.position.clone();
                    let current_lookat = new THREE.Vector3(this.instance.position.x, this.instance.position.y, this.instance.position.z);
                    current_lookat.lerp(idealLookat, t);

                    this.copyPosition = current_position;
                    this.lookAt = current_lookat;
                }
            else // This is when we're in First or Third Person Mode
                {
                    target_clone = target.clone();

                    const mouseRotation = this._CalculateMouseRotation();

                    if (this._mouse_down && this._zoom_level > config.min_zoom) 
                        { target_clone.quaternion.multiply(mouseRotation); }
                    else 
                        { 
                            this._mouse_rotation.y = 0; 
                            this._additional_zoom_height = 0;
                        }

                    idealOffset = this._CalculateIdealOffset(target_clone);

                    if (this._mouse_down) 
                        { idealOffset.y += this._additional_zoom_height; }   

                    idealLookat = this._CalculateIdealLookat(target_clone);

                    // Creates a 'lagging' camera that follows the target
                    if (this._zoom_level < config.min_zoom) 
                        {
                            this.copyPosition = idealOffset;
                            this.lookAt = idealLookat;
                        } 
                    else 
                        {
                            const t = 1.0 - Math.pow(0.00000001, elapsed);
                        
                            this._current_position.lerp(idealOffset, t);
                            this._current_lookat.lerp(idealLookat, t);
                        
                            this.instance.position.copy(this._current_position);
                            this.instance.lookAt(this._current_lookat);   
                        }
                }
        }
}