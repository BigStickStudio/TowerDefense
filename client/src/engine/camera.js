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
            this._renderer = _renderer; // TODO: Move this to State and Make State into Singleton Engine
            this.init();
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
                    if (state.key_pressed.shift)
                        {
                            let scalar = config.max_top_down_height / this._zoom_level / 2;

                            let dx = this.d_mouse.x * scalar * this._zoom_level;
                            let dy = -this.d_mouse.y * scalar * this._zoom_level / 2;
                            
                            let direction = new THREE.Vector3();
                            this.instance.getWorldDirection(direction);
                            direction.y = 0;
                            direction.normalize();

                            let right = new THREE.Vector3();
                            right.crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();

                            let forward = direction.multiplyScalar(dy);
                            let strafe = right.multiplyScalar(dx);

                            this.instance.position.add(forward).add(strafe);
                            this.free_target.position.add(forward).add(strafe);
                        }
                    else
                        {
                            let scalar = config.max_top_down_height / this._zoom_level / 2;
                            console.log(this.d_mouse);
                            let dx = this.d_mouse.x * (this._zoom_level / 10) * scalar;
                            let dy = this.d_mouse.y / (10 / this._zoom_level) * scalar / 2;
        
                            // Used to rotate the target around the camera
                            let y_offset = new THREE.Vector3(0, 0, 0);
                            y_offset.subVectors(this.free_target.position, this.instance.position);
        
                            let camera_spherical = new THREE.Spherical().setFromVector3(y_offset);
                            camera_spherical.theta -= dx;
                            camera_spherical.phi -= dy;
                            let phi = 1 / this._zoom_level;
                            camera_spherical.phi = Math.max(phi, Math.min(Math.PI - phi, camera_spherical.phi)); // Stops Flipping
                            
                            y_offset.setFromSpherical(camera_spherical);
                            
                            // Used to rotate the camera around the target
                            let x_offset = new THREE.Vector3(0, 0, 0);
                            x_offset.subVectors(this.instance.position, this.free_target.position);
        
                            let target_spherical = new THREE.Spherical().setFromVector3(x_offset);
                            target_spherical.theta -= dx / 2;
                            target_spherical.theta = target_spherical.theta % (Math.PI * 2);
        
                            x_offset.setFromSpherical(target_spherical);
        
                            if (this.free_target.position.y > 0) 
                                { 
                                    let new_target_position = new THREE.Vector3().addVectors(this.instance.position, y_offset);
                                    this.free_target.position.lerp(new_target_position, 0.06);
        
                                    let new_camera_position = new THREE.Vector3().addVectors(this.free_target.position, x_offset);
                                    this.instance.position.lerp(new_camera_position, 0.1);
                                }
        
                            this.free_target.position.y = 1;
                        }
                }
        }
    
    // This mainly handles static zoom as well as Character based zoom effects
    update(target, elapsed) 
        {
            if (!target)
                { return; }
        
            // TODO: We can do better than this if we actually swap targets entirely
            // and stop passing it as a parameter
            if (state.camera_target.name !== target.name)
                { state.camera_target_name = target.name; }

            let idealOffset;
            let idealLookat;

            ; // TODO: Move to state machine
            const t = 1.0 - Math.pow(0.00000001, elapsed);
            //console.log("[Camera]::update::t:", t);

            // This is triggered from Game when we are in 'Free' mode
            if (!state.fixed_camera)
                {
                    state.camera_target.position.setFromMatrixPosition(target.matrixWorld);
                    //console.log(_target_clone.position);

                    // This is used to handle the rotation of the camera when the mouse is down
                    idealOffset = new THREE.Vector3(this.instance.position.x, this._zoom_level, this.instance.position.z);
                    let current_position = this.instance.position.clone();
                    current_position.lerp(idealOffset, t);

                    idealLookat = state.camera_target.position.clone();
                    let current_lookat = this.free_target.position.clone();
                    current_lookat.lerp(idealLookat, t);

                    this.instance.position.copy(idealOffset);
                    this.instance.lookAt(current_lookat);
                }
            else if (state.top_down) 
                {
                    state.camera_target.position.set(target.position.x, -1, target.position.z);
                    
                    let current_position = this.instance.position.clone();
                    idealOffset = new THREE.Vector3(
                            target.position.x, 
                            this._zoom_level, 
                            target.position.z
                        );
                    current_position.lerp(idealOffset, t);


                    idealLookat = state.camera_target.position.clone();
                    let current_lookat = new THREE.Vector3(
                            this.instance.position.x, 
                            this.instance.position.y, 
                            this.instance.position.z
                        );
                    current_lookat.lerp(idealLookat, t);

                    this.instance.position.copy(current_position);
                    this.instance.lookAt(current_lookat);
                }
            else // This is when we're in First or Third Person Mode
                {
                    state.camera_target = target.clone();

                    if (this._mouse_down && this._zoom_level > config.min_zoom) 
                        {
                            let mouseRotation = this._CalculateMouseRotation();
                            state.camera_target.quaternion.multiply(mouseRotation); 
                        }
                    else 
                        { 
                            this._mouse_rotation.y = 0; 
                            this._additional_zoom_height = 0;
                        }

                    idealLookat = this._CalculateIdealLookat(state.camera_target);
                    idealOffset = this._CalculateIdealOffset(state.camera_target);

                    if (this._mouse_down) 
                        { idealOffset.y += this._additional_zoom_height; }   

                    // Creates a 'lagging' camera that follows the target
                    if (this._zoom_level < config.min_zoom) 
                        {
                            this.instance.position.copy(idealOffset);
                            this.instance.lookAt(idealLookat);
                        } 
                    else 
                        {
                            this._current_position.lerp(idealOffset, t);
                            this._current_lookat.lerp(idealLookat, t);
                        
                            this.instance.position.copy(this._current_position);
                            this.instance.lookAt(this._current_lookat);   
                        }
                }
        }
}