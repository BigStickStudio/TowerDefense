import * as THREE from 'three';
import config from '../configs/camera_config.js';
import CameraController from './camera_controller.js';
import StateManager from "./state_manager.js";

const state = StateManager.instance;

export default class Camera extends CameraController {
    instance = null;
    moving = false;

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
            console.log("Hit Move Camera");
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
                                    let new_target_position = this.instance.position.clone().add(y_offset);
                                    this.free_target.position.lerp(new_target_position, 0.06);
        
                                    let new_camera_position = this.free_target.position.clone().add(x_offset);
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

            let idealOffset;
            let idealLookat;
            let _target_clone = new THREE.Object3D();
            const t = 1.0 - Math.pow(0.00000001, elapsed);
            
            // This is triggered from Game when we are in 'Free' mode
            if (state.fixed_camera)
                {
                    _target_clone.position.set(this.free_target.position.clone());
                    
                    // This is used to handle the rotation of the camera when the mouse is down
                    let idealOffset = new THREE.Vector3(this.instance.position.x, this._zoom_level, this.instance.position.z);
                    let current_position = this.instance.position.clone();
                    current_position.copy(idealOffset);

                    let idealLookat = _target_clone.position.clone();
                    let current_lookat = new THREE.Vector3(this.free_target.position.x, this.free_target.position.y, this.free_target.position.z);
                    current_lookat.lerp(idealLookat, t);

                    this.instance.position.copy(idealOffset);
                    this.instance.lookAt(current_lookat);
                }
            else if (state.top_down) 
                {
                    console.log("Hit Top Down");
                    let _target_clone = new THREE.Object3D();
                    _target_clone.position.set(target.position.x, -1, target.position.z);
                    console.log("Target Clone:", _target_clone.position);
                    console.log(this._zoom_level);

                    let current_position = this.instance.position.clone();
                    current_position.lerp(
                        new THREE.Vector3(
                                target.position.x, 
                                this._zoom_level, 
                                target.position.z
                            ), 
                            t
                        );
                    

                    let current_lookat = new THREE.Vector3(
                            this.instance.position.x, 
                            this.instance.position.y, 
                            this.instance.position.z
                        );
                    current_lookat.lerp(_target_clone.position.clone(), t);

                    this.instance.position.copy(current_position);
                    this.instance.lookAt(current_lookat);
                }
            else // This is when we're in First or Third Person Mode
                {
                    _target_clone = target.clone();

                    const mouseRotation = this._CalculateMouseRotation();

                    if (this._mouse_down && this._zoom_level > config.min_zoom) 
                        { _target_clone.quaternion.multiply(mouseRotation); }
                    else 
                        { 
                            this._mouse_rotation.y = 0; 
                            this._additional_zoom_height = 0;
                        }

                    idealOffset = this._CalculateIdealOffset(_target_clone);

                    if (this._mouse_down) 
                        { idealOffset.y += this._additional_zoom_height; }   

                    idealLookat = this._CalculateIdealLookat(_target_clone);

                    // Creates a 'lagging' camera that follows the target
                    if (this._zoom_level < config.min_zoom) 
                        {
                            this.instance.position.copy(idealOffset);
                            this.instance.lookAt(idealLookat);
                            this.free_target.copy(target);
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