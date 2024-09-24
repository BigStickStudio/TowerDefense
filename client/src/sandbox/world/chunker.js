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
    hex_tree = new HexNode(0, 0, config.CHUNK_COUNT);

    constructor() {
        this.init();
        console.log("Hex Tree", this.hex_tree);
    }

    init = () => 
        {
            this.initCameraTracker();
        }

    drawHexGrid = () =>
        {
            this.hex_tree = new HexNode(0, 0, config.CHUNK_COUNT);
            const drawMesh = (position, size) =>
                {
                    let geometry = new THREE.PlaneGeometry(size.w, size.h, 1, 1);
                    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true });
                    let mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(position.x, 1, position.z);
                    mesh.rotation.x = -Math.PI / 2;
                    mesh.name = "hex";
                    state.scene.add(mesh);
                }

            this.hex_tree.calculateSubdivisions(this.camera_position);

            this.hex_tree.chunks.forEach(chunk =>
                {
                    let position = chunk.position;
                    let size = chunk.size;
                    drawMesh(position, size);
                }
            );
        }

    initCameraTracker = () => 
        {
            this.camera_position = { x: 0, z: 0 };
            this.camera_mesh = new THREE.Mesh(
                new THREE.SphereGeometry(config.SQUARE_SIZE ** 2.425, 8, 9),
                new THREE.MeshBasicMaterial({ 
                    color: 0xeeff00, 
                    wireframe: true
                })
            );
            state.scene.add(this.camera_mesh);
            this.cameraTracker(this.camera_position);
        }

    activateChunk = (chunk) => 
        { chunk.material.color.setHex(0xff00ff); }

    deactiveChunk = (chunk) => 
        { chunk.material.color.setHex(0xcccccc); }

    // at this point the previous chunks, and current chunks are not the same
    updateChunks = () =>
        {
            // Remove all chunks from the scene with the name "hex
            let hexes = state.scene.children.filter(child => child.name === "hex");
            hexes.forEach(hex => 
                {
                    console.log("Removing Hex", hex);
                    state.scene.remove(hex)
                }
            );
            this.drawHexGrid();
            console.log("Updating Chunks");
        }

    getCameraPosition = (x, z) => 
        {
            let x_id = Math.floor(x / config.CHUNK_SIZE) + Math.floor(config.CHUNK_COUNT / 2);
            let z_id = Math.floor(z / config.CHUNK_SIZE) + Math.floor(config.CHUNK_COUNT / 2);
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
            console.log("Camera Position:", this.camera_position);

            this.updateChunks();
            this.prev_camera_position = this.camera_position;
        }
}

 