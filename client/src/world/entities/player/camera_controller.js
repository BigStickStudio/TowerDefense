import * as THREE from "three";
import config from '/src/configs/camera_config.js';
import map_config from '/src/configs/map_config.js';
import StateManager from "/src/engine/state_manager.js";

const state = StateManager.instance;

let prev_mouse = new THREE.Vector2();
let instance_matrix = new THREE.Matrix4();
let instance_position = new THREE.Vector3();
let highlight = 0x33f5d9;
let highlighter_color = new THREE.Color().setHex(highlight);
let highlighted = null;
let prev_highlighted = null;

let red = 0xc12d10;
let blue = 0x7a94e0;

let red_color = new THREE.Color(red);
let blue_color = new THREE.Color(blue);

export default class CameraController {
    d_mouse = new THREE.Vector2();
    mouse = new THREE.Vector2();

    constructor() {
        this.free_target = new THREE.Object3D(0, 0, 0);

        // Leave for debugging purposes
        // let box = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), 
        //     new THREE.MeshBasicMaterial({ 
        //         color: 0x00ff66, 
        //         transparent: true, 
        //         opacity: 0.1,
        //         side: THREE.DoubleSide}));
        
        // this.free_target.add(box);

        this.free_target.position.set(0, 0, 0);
        this.free_target.rotation.y = Math.PI;
        this.free_target.name = "camera_target";
        state.scene.add(this.free_target);
        
        this.raycaster = new THREE.Raycaster();
        this.cursor = new THREE.Mesh(
                new THREE.PlaneGeometry(
                        map_config.square_size, 
                        map_config.square_size, 
                        1, 1
                    ), 
                new THREE.MeshStandardMaterial(
                        { 
                            color: 0x33f5d9, 
                            side: THREE.DoubleSide, 
                        }
                    )
            );
        this.cursor.position.set(0, 0.75, 0);
        this.cursor.rotation.x = -Math.PI / 2;
        this.cursor.name = "cursor";

        this.enable();
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


            if (state.scene.getObjectByName("cursor") !== undefined) 
                { state.scene.remove(this.cursor); }

            state.cursor_target = undefined;
            this.camera_enabled = false;
        }

    // This gets called EVERY frame
    getIntersection = (objects) => 
        {
            // Todo: Move this OUT of this because we call this every frame
            this.raycaster.setFromCamera(this.mouse, this.instance);
            let intersects = this.raycaster.intersectObjects(objects, true);

            if (intersects.length <= 0) 
                { 
                    state.scene.remove(this.cursor);
                    state.cursor_target = 'none';
                    return; 
                }

            // TODO: Move to the entity controller or state or something?
            // We find the intersection object matrix from the player area map
            // and apply the transform to the cursor
            for (let i = 0; i < intersects.length; i++) 
                { 
                    let intersect = intersects[i];
                    if (intersect?.object?.info === undefined) { return; }

                    let team = intersect.object.info.team;
                    let player = intersect.object.info.id;
                    let instance_id = intersect.instanceId;

                    state.player_areas[team][player].getMatrixAt(instance_id, instance_matrix)
                    instance_matrix.decompose(instance_position, new THREE.Quaternion(), new THREE.Vector3());

                    if (instance_position.x === this.cursor.position.x && instance_position.z === this.cursor.position.z)
                        { return; }

                    // if (highlighted !== prev_highlighted)
                    //     {
                    //         console.log("infinite")
                    //         state.player_areas[highlighted.team][highlighted.player].setColorAt(
                    //             highlighted.id, highlighted.team === "red" ? red_color : blue_color);
                    //         prev_highlighted = highlighted;
                    //     }

                    // highlighted = { team: team, player: player, id: instance_id };
                    // state.player_areas[team][player].setColorAt(instance_id, highlighter_color);
                    this.cursor.position.setX(instance_position.x);
                    this.cursor.position.setZ(instance_position.z);
                    //state.cursor_target = `${team}_${player}: (${position.x},${position.y})`;
                }

            if (state.scene.getObjectByName("cursor") === undefined)
                { state.scene.add(this.cursor); }
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
        { this._mouse_down = false; }

    moveMouse = (event) => 
        {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.d_mouse.x = +(this.mouse.x - prev_mouse.x).toFixed(3);
            this.d_mouse.y = +(this.mouse.y - prev_mouse.y).toFixed(3);
            prev_mouse.x = this.mouse.x;
            prev_mouse.y = this.mouse.y;

            if (this._mouse_down && !state.fixed_camera) 
                { this.moveCamera(); }
        }
    
    get instance_position()
        { return this.instance.position.clone(); }

    set aspect(aspect) 
        { 
            this.instance.aspect = aspect; 
            this.instance.updateProjectionMatrix();
        }

    updateFreeCamera = (target) =>
        {
            if (!target) { return; }
            this.free_target.position.copy(new THREE.Vector3(target.position.x, target.position.y, target.position.z));
            this.free_target.rotation.copy(new THREE.Euler(target.rotation.x, target.rotation.y, target.rotation.z));
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
                    this._target_offset.x = 0;
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
            // This negates the IdealOffset being added to the target position
            // Relative to the Quaternion of the target
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