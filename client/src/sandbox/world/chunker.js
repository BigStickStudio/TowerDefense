import * as THREE from 'three';
import { CHUNK_SIZE, MAP_SIZE, MAX_ID_TABLE, MID_CHUNK_SIZE, MID_ID_TABLE, MIN_CHUNK_SIZE, SQUARE_SIZE, TILE_COUNT } from './chunk_config.js';
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
            const drawMesh = (position, size) =>
                {
                    let geometry = new THREE.PlaneGeometry(size.w, size.h, 1, 1);
                    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, wireframe: true });
                    let mesh = new THREE.Mesh(geometry, material);
                    mesh.position.set(position.x, 0.5, position.z);
                    mesh.rotation.x = -Math.PI / 2;
                    mesh.name = "hex";
                    state.scene.add(mesh);
                }

            let hexes = this.hex_tree.hexes;
            
            const MAX_CHUNK_OFFSET = MID_CHUNK_SIZE + MIN_CHUNK_SIZE / 2;

            for (let region_key in hexes)
                {
                    let region = hexes[region_key]; 
                    let region_distance = region.distanceTo(this.camera_mesh.position);

                    if (MAX_CHUNK_OFFSET < region_distance)
                        { 
                            drawMesh(region.position, region.size); 
                            continue;
                        }

                    for (let chunk_key in region.hexes)
                        {
                            let chunk = region.hexes[chunk_key];
                            let chunk_distance = chunk.distanceTo(this.camera_mesh.position);

                            if (MIN_CHUNK_SIZE + CHUNK_SIZE * 3.5 < chunk_distance)
                                { 
                                    drawMesh(chunk.position, chunk.size); 
                                    continue;
                                }

                            for (let tile_key in chunk.hexes)
                                {
                                    let tile = chunk.hexes[tile_key];
                                    let tile_distance = tile.distanceTo(this.camera_mesh.position)
                                    
                                    if (CHUNK_SIZE * 2 < tile_distance && tile_distance < CHUNK_SIZE * 5)
                                        { 
                                            drawMesh(tile.position, tile.size); 
                                            continue;
                                        }
                                        
                                    for (let hex in tile.hexes)
                                        {
                                            let cell = tile.hexes[hex];
                                            console.log(cell.distanceTo(this.camera_position.x, this.camera_position.z));

                                            if (cell.distanceTo(this.camera_mesh.position) < CHUNK_SIZE * 2)
                                                { drawMesh(cell.position, cell.size); }

                                        }
                                }
                        }
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
            // Remove all chunks from the scene with the name "hex
            let hexes = state.scene.children.filter(child => child.name === "hex");
            hexes.forEach(hex => state.scene.remove(hex));
            this.drawHexGrid();
            console.log("Updating Chunks");
        }

    cameraTracker = (position) => 
        {
            if (position === undefined)
                { return; }

            this.camera_mesh.position.set(position.x, 1, position.z);

            let camera_position = this.camera_mesh.position.clone();
            if (camera_position.x === this.prev_camera_position.x && camera_position.z === this.prev_camera_position.z)
                { return; }
            console.log("Camera Position", camera_position);

            this.updateChunks();
            this.prev_camera_position = camera_position;
        }
}

 