import * as THREE from 'three';

const grid_size = 50;

export default class Map {
    static grid = [];

    static init(scene) {
        for (let i = -(grid_size / 2); i < (grid_size/2); i++) {
            Map.grid[i] = [];
            for (let j =  -(grid_size / 2); j < (grid_size/2); j++) {
                const geometry = new THREE.PlaneGeometry(9.5, 9.5, 1, 1);
                const material = new THREE.MeshBasicMaterial({ color: 0x329c11, side: THREE.DoubleSide });
                const plane = new THREE.Mesh(geometry, material);
                plane.rotation.x = Math.PI / 2;
                plane.position.set(i * 10, 0, j * 10);
                scene.add(plane);
            }
            const geometry = new THREE.PlaneGeometry(grid_size * 10, grid_size * 10, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x3152cf, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geometry, material);
            plane.rotation.x = Math.PI / 2;
            plane.position.set(0, -0.2, 0);
            scene.add(plane);
        }
        
    }
}