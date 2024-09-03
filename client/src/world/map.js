import * as THREE from 'three';
import template from '../configs/game_modes.js';
import config from '../configs/map_config.js';
import MapInterface from './map_controller.js';

const mode = template["pvp"]["battle"]["1v1"];
let grid_size = config.grid_size;
let square_size = config.square_size;
const half_grid_x = grid_size.x / 2;
const half_grid_y = grid_size.y / 2;
const field_size_x = grid_size.x * square_size;
const field_size_y = grid_size.y * square_size;
const square_inset = square_size - config.frame_size;

export default class Map extends MapInterface {
    grid = [];

    constructor(scene) 
        { 
            super(scene);
            this.init(); 
        }

    init = () => {
        console.log(mode);
        this.createUnderlay();
        this.createPaths();
        const plane_geometry = new THREE.PlaneGeometry(square_inset, square_inset, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x329c11, side: THREE.DoubleSide });

        // for (let i = -half_grid_x; i < half_grid_x; i++) {
        //     this.grid[i] = [];
        //         let x = (i * square_size) + config.map_offset;

        //     for (let j =  -half_grid_y; j < half_grid_y; j++) {
        //         const plane = new THREE.Mesh(plane_geometry, material);
        //         plane.rotation.x = Math.PI / 2;
        //         let z = (j * square_size) + config.map_offset;
        //         plane.position.set(x, 0, z);
        //         plane.name = "grid";
        //         scene.add(plane);
        //     }
        //}


    }

    createPaths = () => 
        {
            let red_nodes = [];
            let blue_nodes = [];
            let red_team = mode["red"];
            let blue_team = mode["blue"];

            const pickRandomXY = (node) => {
                let min_x = node.min_x * grid_size.x;
                let max_x = node.max_x * grid_size.x;
                let min_y = node.min_y * grid_size.y;
                let max_y = node.max_y * grid_size.y;

                return {
                    x: Math.floor(Math.random() * (max_x - min_x + 1)) + min_x,
                    y: Math.floor(Math.random() * (max_y - min_y + 1)) + min_y
                }
            }

            for (let i = 0; i < red_team.length; i++) 
                {
                    let red_node = red_team[i];
                    let position = pickRandomXY(red_node);
                    red_nodes.push(position);
                }
            
            for (let i = 0; i < blue_team.length; i++) 
                {
                    let blue_node = blue_team[i];
                    let position = pickRandomXY(blue_node);
                    blue_nodes.push(position);
                }
            
            console.log("Red:", red_nodes);
            console.log("Blue:", blue_nodes);
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