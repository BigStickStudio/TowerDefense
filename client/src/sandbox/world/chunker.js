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
    hex_tree = new HexNode('root');

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

            let x = 0;
            let z = 0;
            let chunk_position = { x: 0, z: 0 };
            let chunk_size = { h: 0, w: 0 };
            let cPos_z = this.camera_position.z;
            let cPos_x = this.camera_position.x;


            // console.log("Chunk Count", config.CHUNK_COUNT);
            // console.log("Chunk Size", config.CHUNK_SIZE);
            // console.log("Max Chunk Offset", config.MAX_CHUNK_OFFSET);
            // console.log("Max Offset Size", config.MAX_OFFSET_SIZE);
            // console.log("Mid Chunk Offset", config.MID_CHUNK_OFFSET);
            // console.log("Mid Offset Size", config.MID_OFFSET_SIZE);
            // console.log("Min Chunk Offset", config.MIN_CHUNK_OFFSET);
            // console.log("Min Offset Size", config.MIN_OFFSET_SIZE);
            // console.log("Max Chunk Count", config.MAX_CHUNK_COUNT);
            // console.log("Max Chunk Size", config.MAX_CHUNK_SIZE);
            // console.log("Mid Chunk Count", config.MID_CHUNK_COUNT);
            // console.log("Mid Chunk Size", config.MID_CHUNK_SIZE);
            // console.log("Min Chunk Count", config.MIN_CHUNK_COUNT);
            // console.log("Min Chunk Size", config.MIN_CHUNK_SIZE);
            // console.log("Camera Position", cPos_z, cPos_x);

            const distanceTo = (p1, p2) => 
                { return Math.abs(p1 - p2); }

            while (z < config.CHUNK_COUNT)
                {
                    // console.log("Z", z);
                    x = 0;
                    console.log("Z", z);
                    let dx_z = distanceTo(z, cPos_z);
                    console.log("Distance to Z", dx_z);
                    
                    // Calculate the Z position and size of the chunk for the max chunk size
                    if (z < config.MAX_CHUNK_OFFSET )
                        {
                            let z_pos = ((z + config.MAX_CHUNK_OFFSET) / 2) * config.CHUNK_SIZE;
                            chunk_position.z = -config.MAP_CENTER + z_pos;
                            chunk_size.h = config.MAX_OFFSET_SIZE;
                            z += config.MAX_CHUNK_OFFSET;
                        }
                    else if (z >= (config.CHUNK_COUNT - config.MAX_CHUNK_OFFSET))
                        {
                            chunk_position.z = z * config.CHUNK_SIZE / 2;
                            chunk_size.h = config.MAX_OFFSET_SIZE;
                            z += config.MAX_CHUNK_OFFSET;
                        }
                    else
                        {
                            let z_pos = (z + config.MAX_CHUNK_SIZE) / 2;
                            chunk_position.z = z_pos - config.MAP_CENTER + config.MAX_CHUNK_OFFSET  * config.CHUNK_SIZE;
                            chunk_size.h = config.MAX_CHUNK_SIZE;
                            z += config.MAX_CHUNK_COUNT;
                        }

                    // Calculate the X position and size of the chunk
                    while (x < config.CHUNK_COUNT)
                        {
                            console.log("X", x);
                            let dx_x = distanceTo(x, cPos_x);
                            console.log("Distance to X", dx_x);

                            if (dx_z < (config.MID_CHUNK_COUNT / 2) && dx_x < (config.MID_CHUNK_COUNT / 2))
                                {
                                    console.log("Mid Chunk Size");
                                    let z_pos = (z * config.CHUNK_SIZE) + config.MIN_CHUNK_SIZE / 2;
                                    let x_pos = (x * config.CHUNK_SIZE) + config.MIN_CHUNK_SIZE / 2;
                                    chunk_position = { x: x_pos - config.MAP_CENTER, z: z_pos - config.MAP_CENTER }
                                    chunk_size = { w: config.MIN_CHUNK_SIZE, h: config.MIN_CHUNK_SIZE };
                                    x += config.MIN_CHUNK_COUNT;
                                }
                            else if (dx_z < (config.MAX_CHUNK_COUNT / 2) && dx_x < (config.MAX_CHUNK_COUNT / 2)) 
                                {
                                    console.log("Max Chunk Size");
                                    let z_pos = (z * config.CHUNK_SIZE) + config.MID_CHUNK_SIZE / 2;
                                    let x_pos = (x * config.CHUNK_SIZE) + config.MID_CHUNK_SIZE / 2;
                                    chunk_position = { x: x_pos - config.MAP_CENTER, z: z_pos - config.MAP_CENTER };
                                    chunk_size = { h: config.MID_CHUNK_SIZE, w: config.MID_CHUNK_SIZE };
                                    x += config.MID_CHUNK_COUNT;
                                    console.log("Chunk Position", chunk_position);
                                    console.log("Chunk Size", chunk_size);
                                }
                            else if (x < config.MAX_CHUNK_OFFSET)
                                {
                                    let x_pos = ((x + config.MAX_CHUNK_OFFSET) / 2) * config.CHUNK_SIZE;
                                    chunk_position.x = -config.MAP_CENTER + x_pos;
                                    chunk_size.w = config.MAX_OFFSET_SIZE;
                                    x += config.MAX_CHUNK_OFFSET;
                                }
                            else if (x >= config.CHUNK_COUNT - config.MAX_CHUNK_OFFSET)
                                {
                                    chunk_position.x = x * config.CHUNK_SIZE / 2;
                                    chunk_size.w = config.MAX_OFFSET_SIZE;
                                    x += config.MAX_CHUNK_OFFSET;
                                }
                            else
                                {
                                    let x_pos = (x + config.MAX_CHUNK_SIZE) / 2;
                                    chunk_position.x = x_pos - config.MAP_CENTER + config.MAX_CHUNK_OFFSET * config.CHUNK_SIZE;
                                    chunk_size.w = config.MAX_CHUNK_SIZE;
                                    x += config.MAX_CHUNK_COUNT;
                                }


                            drawMesh(chunk_position, chunk_size);
                        }

                    if (dx_z < (config.MID_CHUNK_COUNT / 2))
                        { z += config.MIN_CHUNK_COUNT; }
                    if (dx_z < (config.MAX_CHUNK_COUNT / 2))
                        { z += config.MID_CHUNK_COUNT; }
                }
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

 