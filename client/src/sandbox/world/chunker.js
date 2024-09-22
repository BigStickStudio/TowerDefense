import * as THREE from 'three';
import { CHUNK_SIZE, MAP_SIZE, MAX_ID_TABLE, MID_ID_TABLE, SQUARE_SIZE, TILE_COUNT } from './chunk_config.js';
import HexNode from './hextree.js';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;



// A, B, C - Top level chunks contain 27x27 subchunks  - Region
// 1, 2, 3 - Mid Level Chunks contain 9x9 subchunks    - Chunk
// a, b, c - Bottom Level Chunks contain 3x3 subchunks - Tile


export default class Chunker {
    square_count = TILE_COUNT;
    square_size = SQUARE_SIZE;
    chunk_size = CHUNK_SIZE;
    map_size = MAP_SIZE;
    map_center = new THREE.Vector3(this.map_size / 2, 0, this.map_size / 2);
    chunk_count = this.map_size / this.chunk_size;
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
            this.initWorldGridSystem();
            this.initCameraTracker();
            this.drawHexGrid();
        }

    drawHexGrid = () =>
        {
            let hexes = this.hex_tree.hexes;
            
            for (let region_key in hexes)
                {
                    let region = hexes[region_key]; 

                    for (let chunk_key in region.hexes)
                        {
                            let chunk = region.hexes[chunk_key];
                            
                            for (let tile_key in chunk.hexes)
                                {
                                    let tile = chunk.hexes[tile_key];

                                    // for (let hex in tile.hexes)
                                    //     {
                                    //         let cell = tile.hexes[hex];
                                    //         let position = cell.position;
                                    //         let size = cell.size;

                                    //         let geometry = new THREE.PlaneGeometry(size.w, size.h, 1, 1);
                                    //         let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true });
                                    //         let mesh = new THREE.Mesh(geometry, material);
                                    //         mesh.position.set(position.x, 0, position.z);
                                    //         mesh.rotation.x = -Math.PI / 2;
                                    //         state.scene.add(mesh);
                                    //     }

                                    let position = tile.position;
                                    let size = tile.size;
                                
                                    let geometry = new THREE.PlaneGeometry(size.w, size.h, 1, 1);
                                    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true });
                                    let mesh = new THREE.Mesh(geometry, material);
                                    mesh.position.set(position.x, 0, position.z);
                                    mesh.rotation.x = -Math.PI / 2;
                                    state.scene.add(mesh);
                                }

                            // let position = chunk.position;
                            // let size = chunk.size;

                            // let geometry = new THREE.PlaneGeometry(size.w, size.h, 1, 1);
                            // let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true });
                            // let mesh = new THREE.Mesh(geometry, material);
                            // mesh.position.set(position.x, 0, position.z);
                            // mesh.rotation.x = -Math.PI / 2;
                            // state.scene.add(mesh);
                        }
                    
                    // let position = region.position;
                    // let size = region.size;

                    // let geometry = new THREE.PlaneGeometry(size.w, size.h, 1, 1);
                    // let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true });
                    // let mesh = new THREE.Mesh(geometry, material);
                    // mesh.position.set(position.x, 0, position.z);
                    // mesh.rotation.x = -Math.PI / 2;
                    // state.scene.add(mesh);
                }
        }
    initWorldGridSystem = () => 
        {
            // console.log("Chunker: Initializing World Grid System");
            let max_chunk_size = 27;
            let mid_chunk_size = 9;
            let min_chunk_size = 3;
            let max_partial_chunk_size = (this.chunk_count % max_chunk_size) / 2;
            let mid_partial_chunk_size = (max_partial_chunk_size % mid_chunk_size);
            let min_partial_chunk_size = (mid_partial_chunk_size % min_chunk_size);

            console.log("Chunker: Chunk Size", this.chunk_size);
            console.log("Chunker: Map Size", this.map_size);
            console.log("Chunker: Chunk Count", this.chunk_count);
            console.log("Chunker: Max Chunk Size", max_chunk_size);
            console.log("Chunker: Mid Chunk Size", mid_chunk_size);
            console.log("Chunker: Min Chunk Size", min_chunk_size);
            console.log("Chunker: Max Partial Chunk Size", max_partial_chunk_size);
            console.log("Chunker: Mid Partial Chunk Size", mid_partial_chunk_size);
            console.log("Chunker: Min Partial Chunk Size", min_partial_chunk_size);
            console.log("~".repeat(50));

            const calculateID = (n, partial, max) => 
                { return n < partial ? 0 : Math.floor((n - partial) / max) + 1; }


            let MapCoordinate = "";
            let RegionCoordinate = "";
            let ChunkCoordinate = "";

            for (let i = 0; i < this.chunk_count; i++) 
                {
                    for (let j = 0; j < this.chunk_count; j++) 
                        {
                            let max_i_id = calculateID(i, max_partial_chunk_size, max_chunk_size);
                            let max_j_id = calculateID(j, max_partial_chunk_size, max_chunk_size);
                            
                            let mid_i_id = max_i_id === 0 
                                ? calculateID(i, mid_partial_chunk_size, mid_chunk_size) 
                                : Math.floor((i - mid_partial_chunk_size) / mid_chunk_size) + 1;
                            
                            let mid_j_id = max_j_id === 0 
                                ? calculateID(j, mid_partial_chunk_size, mid_chunk_size) 
                                : Math.floor((j - mid_partial_chunk_size) / mid_chunk_size) + 1;
                            
                            let min_i_id = max_i_id === 0
                                ? calculateID(i, min_partial_chunk_size, min_chunk_size)
                                : Math.floor((i - min_partial_chunk_size) / min_chunk_size) + 1;
                    
                            let min_j_id = max_j_id === 0
                                ? calculateID(j, min_partial_chunk_size, min_chunk_size)
                                : Math.floor((j - min_partial_chunk_size) / min_chunk_size) + 1;


                            let max_i = MAX_ID_TABLE[max_i_id];
                            let max_j = MAX_ID_TABLE[max_j_id];
                            let mid_i = MID_ID_TABLE[mid_i_id];
                            let mid_j = MID_ID_TABLE[mid_j_id];
                            let min_i = min_i_id;
                            let min_j = min_j_id;

                            if (MapCoordinate !== `${max_i}_${max_j}`)
                                { 
                                    MapCoordinate = `${max_i}_${max_j}`; 
                                    // console.warn("Moving into", `${max_i}_${max_j}`);
                                }

                            if (RegionCoordinate !== `${mid_i}_${mid_j}`)
                                {
                                    RegionCoordinate = `${mid_i}_${mid_j}`;
                                    // console.warn(" - Region", `${mid_i}_${mid_j}`);
                                }

                            if (ChunkCoordinate !== `${min_i}_${min_j}`)
                                {
                                    ChunkCoordinate = `${min_i}_${min_j}`;
                                    // console.warn(" -- Chunk", `${min_i}_${min_j}`);
                                }

                            const hex = { region: `${max_i}_${max_j}`, 
                                          chunk: `${mid_i}_${mid_j}`, 
                                          tile: `${min_i}_${min_j}`,
                                          hex: `${i}_${j}`,
                                          x: i, z: j };
                            this.hex_tree.addHex(hex);
                        }
                }
        }

    initCameraTracker = () => 
        {
            this.camera_position = { x: 0, z: 0 };
            this.camera_mesh = new THREE.Mesh(
                new THREE.SphereGeometry(this.square_size * this.square_size + this.square_size, 8, 9),
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
            let x = this.camera_position.x;
            let z = this.camera_position.z;
            // let min_x = this.prev_camera_position.x - 1;
            // let max_x = this.prev_camera_position.x + 1;
            // let min_z = this.prev_camera_position.z;
            // let max_z = this.prev_camera_position.z;

            let key = { x: x, z: z };                            
            // let chunk = this.chunks.find(key);
            // let mesh = chunk.mesh();
            // this.activateChunk(mesh);
            // console.log(mesh);
            // state.scene.add(mesh);
        }

    cameraTracker = (position) => 
        {
            if (position === undefined)
                { return; }

            this.camera_mesh.position.set(position.x, 1, position.z);

            // NOTE: TODO: Fix this Bug because it works with numbers like 210, 230, 250, but is off by half a chunk size
            //       when we use numbers like 200, 220, 240, 260, etc.
            // We have to talk half the maps chunk_count, and offset the x/y by half the chunk size to account for center,
            // and then divide by the size of the chunk to get the whole number of what chunk the camera is in
            let x = Math.floor(this.chunk_count / 2) + Math.floor((position.x + (this.chunk_size / 2)) / this.chunk_size);
            let z = Math.floor(this.chunk_count / 2) + Math.floor((position.z + (this.chunk_size / 2)) / this.chunk_size);
            this.camera_position = { x: x, z: z };

            if (this.camera_position.x === this.prev_camera_position.x && this.camera_position.z === this.prev_camera_position.z)
                { return; }

            // We can update the chunks before we remove the previous
            this.updateChunks();

            this.prev_camera_position = this.camera_position;
            // console.log(this.camera_position);
        }
}

 