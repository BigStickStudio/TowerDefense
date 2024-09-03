import * as THREE from 'three';
import map_config from "../configs/map_config.js";
import StateManager from "../engine/state_manager.js";

const state = StateManager.instance;

export default class MapInterface {
    raycaster = undefined;
    mouse2D = undefined;
    highlighter = undefined;
    cursor = false;
    cursor_target = undefined;
    scene = undefined;

    constructor (scene) 
        { 
            this.scene = scene;
            this.init(); 
        }

    init = () => 
        {
            this.raycaster = new THREE.Raycaster();
            this.mouse2D = new THREE.Vector2();
            
            const geometry = new THREE.PlaneGeometry(map_config.square_size, map_config.square_size, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x8a53f4, side: THREE.DoubleSide , opacity: 0.5, transparent: true });
            const plane = new THREE.Mesh(geometry, material);
            plane.rotation.x = Math.PI / 2;
            plane.name = "cursor";
            this.highlighter = plane;

            this.enable();
        }

    enable = () =>
        {
            console.log("Enabling Map Cursor");
            document.addEventListener('mousemove', this.trackMouse, false);
            document.addEventListener('mouseout', this.cleanUp, false);
        }

    disable = () =>
        {
            console.log("Disabling Map Cursor");
            document.removeEventListener('mousemove', this.trackMouse, false);
            document.removeEventListener('mouseout', this.cleanUp, false);
            this.cursor = false;
        }

    getIntersection = (camera, objects) => 
        {
            // If the cursor has left the window we want to skip the intersection check
            if (!this.cursor) { return; }

            this.raycaster.setFromCamera(this.mouse2D, camera);
            let intersects = this.raycaster.intersectObjects(objects, true);

            if (intersects.length <= 0) 
                { 
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
                            this.cursor_target = object_position;
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
            this.cursor_target = undefined;
        }


    set cursor_target(target) 
        { 
            state.set("cursor_target", target);
            this.redrawUI();
        }

    get cursor_target() 
        { 
            const target = state.get("cursor_target"); 
            return target ? `${target.x}, ${target.z}` : 'none';
        }

}