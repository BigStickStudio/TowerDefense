import * as THREE from 'three';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;

const SQUARE_SIZE = 6; // This is FIXED to the /engine/configs/game_config_map.js

// TODO: // Move all of this to a shader and use a single plane
const TILE_COUNT = 129;
const green = '#0b631d';
const blue = '#43676e';

let x_rotation_matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
const plane_geometry = new THREE.PlaneGeometry(SQUARE_SIZE, SQUARE_SIZE, 1, 1);
const createSquareMaterial = (color) =>
    {
        return new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
        });
    }

const map_size = TILE_COUNT * SQUARE_SIZE;
const map_center = new THREE.Vector3(map_size / 2, 0, map_size / 2);
const green_material = createSquareMaterial(green);
const blue_material = createSquareMaterial(blue);

export default class Map {

    constructor() {
        this.createSquares();
    }

    createSquares = () => {
        let tile_count = TILE_COUNT * TILE_COUNT;
        let green_mesh = new THREE.InstancedMesh(plane_geometry, green_material, tile_count / 2 + 1);
        let blue_mesh = new THREE.InstancedMesh(plane_geometry, blue_material, tile_count / 2);

        for (let i = 0; i < TILE_COUNT; i++) {
            for (let j = 0; j < TILE_COUNT; j++) {
                let x = j * SQUARE_SIZE - map_center.x;
                let y = i * SQUARE_SIZE - map_center.z;

                let matrix = new THREE.Matrix4();
                matrix.makeTranslation(x, 0, y);
                matrix.multiply(x_rotation_matrix);

                let index = i * TILE_COUNT + j;
                let id = Math.floor(index / 2);
                if (index % 2 === 0) 
                    { green_mesh.setMatrixAt(id, matrix); }
                else 
                    { blue_mesh.setMatrixAt(id, matrix); }
            }
        }

        green_mesh.instanceMatrix.needsUpdate = true;
        blue_mesh.instanceMatrix.needsUpdate = true;
        state.scene.add(green_mesh);
        state.scene.add(blue_mesh);
    }

    addHemisphereLight = (position) =>
        {
            let light_x = position.x * SQUARE_SIZE + map_center.x;
            let light_y = position.y * SQUARE_SIZE + map_center.y;

            // TODO: Add Interpolation for day and night cycle
            let player_lighting = new THREE.HemisphereLight(config.night_top_color, config.night_bottom_color, 0.03); // This is the perfect night color
            player_lighting.name = "light";
            player_lighting.groundColor.setHSL(0.25, .5, .3);
            player_lighting.position.set(light_x, 10, light_y);
            state.scene.add(player_lighting);
            state.hemisphere_lights.push(player_lighting);

            // Hemisphere Helper
            // const hemisphere_helper = new THREE.HemisphereLightHelper(player_lighting, 5);
            // state.scene.add(hemisphere_helper);
        }

    update = () => {
    }
}