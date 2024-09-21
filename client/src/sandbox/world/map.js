import * as THREE from 'three';
import Chunker from './chunker.js';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;

const green = '#0b631d';
const blue = '#43676e';

let x_rotation_matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);

const createSquareMaterial = (color) =>
    {
        return new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
        });
    }

const green_material = createSquareMaterial(green);
const blue_material = createSquareMaterial(blue);

export default class Map extends Chunker {
   
    constructor() {
        super();
        this.createSquares();
    }

    createSquares = () => {
        const plane_geometry = new THREE.PlaneGeometry(this.square_size, this.square_size, 1, 1);

        let tile_count = (this.square_count) * (this.square_count) + this.square_count;
        let green_mesh = new THREE.InstancedMesh(plane_geometry, green_material, tile_count / 2);
        let blue_mesh = new THREE.InstancedMesh(plane_geometry, blue_material, tile_count / 2);

        for (let i = 0; i < this.square_count; i++) {
            for (let j = 0; j < this.square_count; j++) {
                let x = j * this.square_size - this.map_center.x + this.square_size / 2;
                let y = i * this.square_size - this.map_center.z + this.square_size / 2;

                let matrix = new THREE.Matrix4();
                matrix.makeTranslation(x, 0, y);
                matrix.multiply(x_rotation_matrix);

                let index = i * (this.square_count) + j;
                let id = Math.floor(index / 2);
                let green = i % 2 + j % 2 === 1;
                if (green) 
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
            let light_x = position.x * this.square_size + this.map_center.x;
            let light_y = position.y * this.square_size + this.map_center.y;

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