import * as THREE from 'three';
import config from '../configs/map_config.js';


let grid_size = config.grid_size;
let square_size = config.square_size;
let spawn_buffer = config.spawn_buffer;
let path_buffer = config.path_buffer;

// TODO: Move to Map Config
const half_grid_x = grid_size.x / 2;
const half_grid_y = (grid_size.y / 2);
const square_inset = square_size - config.frame_size;
const min_x_buffer = -half_grid_x + spawn_buffer;
const max_x_buffer = half_grid_x - spawn_buffer - 1;
const min_y_buffer = -half_grid_y + spawn_buffer;
const max_y_buffer = half_grid_y - spawn_buffer - 1;
const min_x_path = -half_grid_x + path_buffer;
const max_x_path = half_grid_x - path_buffer - 1;
const min_y_path = -half_grid_y + path_buffer;
const max_y_path = half_grid_y - path_buffer - 1;

// TODO : Move to Utility Fuction
const clamp = (value, min, max) => { return Math.min(Math.max(value, min), max); }
const clampSpawnX = (value) => { return clamp(value, min_x_buffer, max_x_buffer); }
const clampSpawnY = (value) => { return clamp(value, min_y_buffer, max_y_buffer); }
const clampPathX = (value) => { return clamp(value, min_x_path, max_x_path); }
const clampPathY = (value) => { return clamp(value, min_y_path, max_y_path); }

const validStep = (y, x, bounds) =>
    {
        let start = bounds.start;
        let end = bounds.end;
        return (x > start.x.max || x < start.x.min || y > start.y.max || y < start.y.min) &&
                (x > end.x.max || x < end.x.min || y > end.y.max || y < end.y.min);
    }

const lerpPath = (start_x, start_y, end_x, end_y, bounds) =>
    {
        let path = [];

        let slope = (end_y - start_y) / (end_x - start_x);
        let descending = slope < 0;
        let steps = (end_y - start_y);
        let dx = (end_x - start_x) / steps;

        let x = start_x;
        let y = start_y;

        let left_start_x = start_x - config.path_buffer;
        let left_start_y = descending ? start_y - config.path_buffer : start_y + config.path_buffer;
        let left_end_x = end_x - config.path_buffer;
        let left_end_y = descending ? end_y - config.path_buffer : end_y + config.path_buffer;

        let right_start_x = start_x + config.path_buffer;
        let right_start_y = descending ? start_y + config.path_buffer : start_y - config.path_buffer;
        let right_end_x = end_x + config.path_buffer;
        let right_end_y = descending ? end_y + config.path_buffer : end_y - config.path_buffer;

        for (let i = 0; i < steps; i++)
            {
                x += dx;
                y += 1;

                let cross_walk = right_start_x - left_start_x;
                let dy = Math.max(right_start_y, left_start_y) - Math.min(right_start_y, left_start_y) ;

                for (let j = 0; j <= cross_walk; j++)
                    {
                        let _x = left_start_x + j;
                        let _y = Math.floor(left_start_y + dy);
                        path.push({ x: _x, y: _y });
                    }
                
                left_start_x += dx;
                left_start_y += 1;

                right_start_x += dx;
                right_start_y += 1;
                    
            }

        return path;
    }

const plane_geometry = new THREE.PlaneGeometry(square_inset, square_inset, 1, 1);

export default class MapConstructor {
    constructor() {} // TODO Instantiate entire Map Here

    /////////////////////////
    // Create Player Areas //
    /////////////////////////

    static createPlayerAreas = (team, color) => 
        {
            let player_positions = [];
            let squares = [];
            let red_team = color === "red";

            for (let i = 0; i < team.length; i++) 
                {
                    let node = team[i];
                    let position = this.pickRandomXY(node, red_team);
                    let player_position = this.constructPlayerBounds(position);
                    player_positions.push(player_position);
                    let plane = this.createSpawnArea(player_position, red_team);
                    squares = [...squares, ...plane];
                }

            return [squares, player_positions];
        }

    static constructPlayerBounds = (position) =>
        {
            let min_x = position.x - spawn_buffer;
            let max_x = position.x + spawn_buffer;
            let min_y = position.y - spawn_buffer;
            let max_y = position.y + spawn_buffer;

            return {
                position: position,
                x: {
                    min: min_x,
                    max: max_x
                },
                y: {
                    min: min_y,
                    max: max_y
                }
            }
        }

    static pickRandomXY = (node) => 
        {
            let min_x = node.min_x * grid_size.x;
            let max_x = node.max_x * grid_size.x - 1;
            let min_y = node.min_y * grid_size.y;
            let max_y = node.max_y * grid_size.y - 1;

            let x = (Math.floor(Math.random() * (max_x - min_x)) + min_x) - half_grid_x;
            let y = (Math.floor(Math.random() * (max_y - min_y)) + min_y) - half_grid_y;

            return {
                x: clampSpawnX(x),
                y: clampSpawnY(y)
            }
        }

    static createSpawnArea = (position, red_team) => 
        {
            let squares = [];

            for (let i = position.y.min; i <= position.y.max; i++)
                {
                    const material = new THREE.MeshBasicMaterial({ 
                    color: red_team ? 0xfc3c11 : 0x113c9c, 
                    side: THREE.BackSide });
                    const plane = new THREE.Mesh(plane_geometry, material);

                    for (let j = position.x.min; j <= position.x.max; j++)
                        {
                            let square = plane.clone();

                            square.rotation.x = Math.PI / 2;
                            let scaled_x = (j * square_size) + config.map_offset;
                            let scaled_z = (i * square_size) + config.map_offset;
                            square.position.set(scaled_x, 0, scaled_z);
                            square.name = "grid";
                            square.team = red_team ? "red" : "blue"; // TODO: Add Number of Players for Unique Access

                            squares.push(square);
                        }
                }
            
            return squares;
        }

    /////////////////////
    // Create Pathways //
    /////////////////////

    static createPathways = (paths, regions) => 
        {
            let pathways = [];

            paths.forEach((path) =>
                {
                    let start_x = 0;
                    let start_y = 0;
                    let end_x = 0;
                    let end_y = 0;
                    let start_bounds = {};
                    let end_bounds = {};

                    path.forEach((mapping) => 
                        {
                            let [team, index] = Object.entries(mapping)[0];
                            let region = regions[team][index];
                            
                            // If we don't have a start we need to find it first
                            if (start_x === 0 && start_y === 0) 
                                { 
                                    start_x = region.position.x;
                                    start_y = region.position.y;
                                    start_bounds = region;
                                }
                            else 
                                {
                                    end_x = region.position.x;
                                    end_y = region.position.y;
                                    end_bounds = region;
                                }
                        }
                    );

                    let region = { start: start_bounds, end: end_bounds };
                    let pathway = lerpPath(start_x, start_y, end_x, end_y, region);
                    console.log(pathway);
                    let patharea = this.createPathArea(pathway);
                    pathways = [...pathways, ...patharea];
                }
            );

            return pathways;
        }

    static createPathArea = (pathway) =>
        {
            let squares = [];

            pathway.forEach((position) =>
                {
                    let square = new THREE.Mesh(plane_geometry, new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.BackSide }));
                    square.rotation.x = Math.PI / 2;
                    let scaled_x = (position.x * square_size) + config.map_offset;
                    let scaled_z = (position.y * square_size) + config.map_offset;
                    square.position.set(scaled_x, 0, scaled_z);
                    square.name = "grid";
                    square.team = "path";

                    squares.push(square);
                }
            );

            return squares;
        }
}