import * as THREE from 'three';
import map_config from "./map_config.js";
import State from './state.js';

const state_instance = State.instance;

export default class MapInterface {
    raycaster = undefined;
    mouse2D = undefined;
    highlighter = undefined;
    cursor = false;
    scene = undefined;

    constructor (scene) 
        { this.init(scene); }

    init = (scene) => 
        {
            this.scene = scene;
            this.raycaster = new THREE.Raycaster();
            this.mouse2D = new THREE.Vector2();
            
            const geometry = new THREE.PlaneGeometry(map_config.square_size, map_config.square_size, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x8a53f4, side: THREE.DoubleSide , opacity: 0.5, transparent: true });
            const plane = new THREE.Mesh(geometry, material);
            plane.rotation.x = Math.PI / 2;
            plane.name = "cursor";
            this.highlighter = plane;

            document.addEventListener('mousemove', this.trackMouse, false);
            document.addEventListener('mouseout', this.cleanUp, false);
        }

    getIntersection = (camera, objects) => 
        {
            // If the cursor has left the window we want to skip the intersection check
            if (!this.cursor) { return; }

            this.raycaster.setFromCamera(this.mouse2D, camera);
            let intersects = this.raycaster.intersectObjects(objects, true);

            if (intersects.length <= 0) { 
                this.cleanUp();
                return; 
            }

            for (let i = 0; i < intersects.length; i++) 
                { 
                    if (intersects[i].object.name === "grid") 
                        {
                            let intersect = intersects[i].object;
                            let object_position = new THREE.Vector3();
                            intersect.getWorldPosition(object_position);
                            object_position.y += 0.01;

                            if (this.highlighter.position.equals(object_position)) { return; }

                            this.highlighter.position.copy(object_position);
                            state_instance.cursor_target = object_position;
                        }
                }

            if (this.scene.getObjectByName("cursor") === undefined) 
                { this.scene.add(this.highlighter); }
        }

    trackMouse = (e) => 
        {
            e.preventDefault();
            this.cursor = true;
            this.mouse2D.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse2D.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }

    cleanUp = () => 
        { 
            this.mouse2D = new THREE.Vector2();
            this.scene.remove(this.highlighter);
            this.cursor = false; 
            state_instance.cursor_target = undefined;
        }
}