import * as THREE from 'three';

const grid_size = 50;
const square_size = 10;
const frame_size = 0.5;
const frame_buffer = frame_size / 2;

export default class Map {
    grid = [];
    map_listener = undefined;

    constructor(scene) 
        { this.init(scene); }

    init = (scene) => {
        const half_grid = grid_size / 2;
        const field_size = grid_size * 10;
        const field_geometry = new THREE.PlaneGeometry(field_size, field_size, 1, 1);
        const field_material = new THREE.MeshBasicMaterial({ color: 0x603010, side: THREE.DoubleSide });
        const square_inset = square_size - frame_size;
        const plane_geometry = new THREE.PlaneGeometry(square_inset, square_inset, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x329c11, side: THREE.DoubleSide });

        for (let i = -half_grid; i < half_grid; i++) {
            this.grid[i] = [];

            for (let j =  -half_grid; j < half_grid; j++) {
                const plane = new THREE.Mesh(plane_geometry, material);
                plane.rotation.x = Math.PI / 2;
                plane.position.set(i * square_size, 0, j * square_size);
                plane.name = "grid";
                scene.add(plane);
            }

            const underpinning = new THREE.Mesh(field_geometry, field_material);
            underpinning.rotation.x = Math.PI / 2;
            underpinning.position.set(0 - 5, -0.1, 0 - 5);
            underpinning.name = "underpinning";
            scene.add(underpinning);
        }
    }
}