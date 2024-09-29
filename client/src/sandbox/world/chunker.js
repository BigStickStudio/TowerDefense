import * as THREE from 'three';
import * as config from './chunk_config.js';
import HexNode from './hextree.js';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;



// A, B, C - Top level chunks contain 27x27 subchunks  - Region
// 1, 2, 3 - Mid Level Chunks contain 9x9 subchunks    - Chunk
// a, b, c - Bottom Level Chunks contain 3x3 subchunks - Tile


export default class Chunker {
    prev_camera_position = { x: 0, y: 0 };
    camera_position = { x: 0, y: 0 };
    camera_mesh;
    hex_tree = new HexNode(0, 0, config.CHUNK_COUNT, true);

    constructor() {
        this.init();
        console.log("Hex Tree", this.hex_tree);
    }

    init = () => 
        {
            this.camera_position = { x: 0, z: 0 };
            this.camera_mesh = new THREE.Mesh(
                new THREE.SphereGeometry(config.SQUARE_SIZE * 3.5, 8, 9),
                new THREE.MeshBasicMaterial({ 
                    color: 0xeeff00, 
                    wireframe: true
                })
            );
            state.scene.add(this.camera_mesh);
            this.cameraTracker(this.camera_position);
        }

    getCameraPosition = (x, z) => 
        {
            let x_id = (x / config.CHUNK_SIZE) + (config.CHUNK_COUNT / 2);
            let z_id = (z / config.CHUNK_SIZE) + (config.CHUNK_COUNT / 2);
            this.camera_position = { x: x_id, z: z_id };
        }

    cameraTracker = (position) => 
        {
            if (position === undefined)
                { return; }

            this.camera_mesh.position.set(position.x, 1, position.z);

            this.getCameraPosition(position.x, position.z);
            if (this.camera_position.x === this.prev_camera_position.x && 
                this.camera_position.z === this.prev_camera_position.z)
                { return; }
            // console.log("Camera Position:", this.camera_position);

            this.hex_tree.calculateSubdivisions(this.camera_position);
            this.prev_camera_position = this.camera_position;
        }
}

 