import * as THREE from 'three';
import StateManager from '../engine/state_manager.js';
import MapConstructor from './map_constructor.js';
import MapInterface from './map_controller.js';

const state = StateManager.instance;

export default class Map extends MapInterface {
    grid = [];
    red_nodes = [];
    blue_nodes = [];

    constructor(scene) 
        { 
            super(scene);
            this.init(); 
        }

    init = () => {
        this.createPaths();
        this.createTerrain();
        const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    }

    createPaths = () => 
        {
            let red_team = state.game_config["red"];
            let blue_team = state.game_config["blue"];
            
            let [red_squares, red_regions] = MapConstructor.createPlayerAreas(red_team, "red");
            let [blue_squares, blue_regions] = MapConstructor.createPlayerAreas(blue_team, "blue");
            let paths = MapConstructor.createPathways(state.game_config["paths"], {"red": red_regions, "blue": blue_regions});

            this.grid = [...red_squares, ...blue_squares, ...paths];
            this.grid.forEach((square) => 
                { this.scene.add(square); });
        }

    createTerrain = () => 
        {
            const field_geometry = new THREE.PlaneGeometry(state.field_size_x, state.field_size_y, 1, 1);
            const field_material = new THREE.MeshBasicMaterial({ color: 0x603010, side: THREE.FrontSide });
            const underpinning = new THREE.Mesh(field_geometry, field_material);
            underpinning.rotation.x = -Math.PI / 2;
            let center = state.map_center;
            underpinning.position.set(center.x, -1, center.y);
            underpinning.name = "underpinning";
            this.scene.add(underpinning);
        }
}