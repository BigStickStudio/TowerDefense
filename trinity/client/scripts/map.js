import * as THREE from 'three';
import config from './map_config.js';

export default class Map {
    grid = [];
    map_listener = undefined;

    constructor(scene) 
        { this.init(scene); }

    init = (scene) => {
        const half_grid_x = config.grid_size.x / 2;
        const half_grid_y = config.grid_size.y / 2;
        const field_size_x = config.grid_size.x * config.square_size;
        const field_size_y = config.grid_size.y * config.square_size;
        const field_geometry = new THREE.PlaneGeometry(field_size_x, field_size_y, 1, 1);
        const field_material = new THREE.MeshBasicMaterial({ color: 0x603010, side: THREE.DoubleSide });
        const square_inset = config.square_size - config.frame_size;
        const plane_geometry = new THREE.PlaneGeometry(square_inset, square_inset, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x329c11, side: THREE.DoubleSide });

        for (let i = -half_grid_x; i < half_grid_x; i++) {
            this.grid[i] = [];
                let x = (i * config.square_size) + config.map_offset;

            for (let j =  -half_grid_y; j < half_grid_y; j++) {
                const plane = new THREE.Mesh(plane_geometry, material);
                plane.rotation.x = Math.PI / 2;
                let z = (j * config.square_size) + config.map_offset;
                console.log(x, z);
                plane.position.set(x, 0, z);
                plane.name = "grid";
                scene.add(plane);
            }

            const underpinning = new THREE.Mesh(field_geometry, field_material);
            underpinning.rotation.x = Math.PI / 2;
            underpinning.position.set(0, -0.5, 0);
            underpinning.name = "underpinning";
            scene.add(underpinning);
        }
    }
}