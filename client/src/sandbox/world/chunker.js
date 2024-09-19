import * as THREE from 'three';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;

const SQUARE_SIZE = 6;
const TILE_COUNT = 130;

export default class Chunker {
    square_count = TILE_COUNT;
    square_size = SQUARE_SIZE;
    chunk_size = this.square_size * 10;
    map_size = this.square_size * this.square_count;
    map_center = new THREE.Vector3(this.map_size / 2, 0, this.map_size / 2);
    camera_position;
    camera_mesh;

    constructor() {
        this.init();
    }

    init = () => 
        {
            this.initWorldGridSystem();
            this.initCameraTracker();
        }

    initWorldGridSystem = () => 
        {
            let chunks = this.map_size / this.chunk_size;
    
            for (let i = 0; i < chunks; i++) 
                {
                    for (let j = 0; j < chunks; j++) 
                        {
                            let x = i * this.chunk_size - this.map_size / 2 + this.chunk_size / 2;
                            let y = j * this.chunk_size - this.map_size / 2 + this.chunk_size / 2;
                            let chunk_geometry = new THREE.PlaneGeometry(this.chunk_size, this.chunk_size, 1, 1);
                            let chunk_mesh = new THREE.Mesh(
                                chunk_geometry, 
                                new THREE.MeshBasicMaterial({ 
                                    color: 0xcccccc, 
                                    wireframe: true 
                                })
                            );
                            chunk_mesh.rotation.x = -Math.PI / 2;
                            chunk_mesh.position.set(x, 0.1, y);
                            state.scene.add(chunk_mesh);
                        }
                }
    
        }

    initCameraTracker = () => 
        {
            this.camera_position = new THREE.Vector3(0, 1, 0);
            this.camera_mesh = new THREE.Mesh(
                new THREE.SphereGeometry(this.square_size * this.square_size + this.square_size, 8, 9),
                new THREE.MeshBasicMaterial({ 
                    color: 0xeeff00, 
                    wireframe: true
                })
            );
            console.log(this.camera_mesh);
            state.scene.add(this.camera_mesh);
            this.cameraTracker(this.camera_position);
        }

    cameraTracker = (position) => 
        {
            if (position === undefined) 
                { return; }
            this.camera_position = { x: Math.floor(position.x / this.square_size), z: Math.floor(position.z / this.square_size) };
            this.camera_mesh.position.set(position.x, 1, position.z);
            console.log(this.camera_position);
        }
}

