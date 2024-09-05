import * as THREE from 'three';
import template from '../configs/game_modes.js';
import config from '../configs/map_config.js';
import MapConstructor from './map_constructor.js';
import MapInterface from './map_controller.js';

const mode = template["pvp"]["battle"]["3v3"];
let square_size = config.square_size;
const field_size_x = config.grid_size.x * square_size;
const field_size_y = config.grid_size.y * square_size;

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
        this.createUnderlay();
        this.createPaths();
        const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    }

    createPaths = () => 
        {
            let red_team = mode["red"];
            let blue_team = mode["blue"];
            
            let [red_squares, red_regions] = MapConstructor.createPlayerAreas(red_team, "red");
            let [blue_squares, blue_regions] = MapConstructor.createPlayerAreas(blue_team, "blue");
            let paths = MapConstructor.createPathways(mode["paths"], {"red": red_regions, "blue": blue_regions});

            this.grid = [...red_squares, ...blue_squares, ...paths];
            this.grid.forEach((square) => 
                { this.scene.add(square); });
        }

    createUnderlay = () => 
        {
            const field_geometry = new THREE.PlaneGeometry(field_size_x, field_size_y, 1, 1);
            const field_material = new THREE.MeshBasicMaterial({ color: 0x603010, side: THREE.DoubleSide });
            const underpinning = new THREE.Mesh(field_geometry, field_material);
            underpinning.rotation.x = Math.PI / 2;
            underpinning.position.set(0, -0.5, 0);
            underpinning.name = "underpinning";
            this.scene.add(underpinning);
        }
}