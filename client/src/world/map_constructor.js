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

const withinBounds = (i, j, bounds) =>
    {
        return (i >= bounds.start.y.min && i <= bounds.start.y.max) && 
                (j >= bounds.start.x.min && j <= bounds.start.x.max) ||
                (i >= bounds.end.y.min && i <= bounds.end.y.max) && 
                (j >= bounds.end.x.min && j <= bounds.end.x.max);
    }

const lerp = (start_x, start_y, end_x, end_y) =>
    {
        let path = [];
        let x = start_x;
        let y = start_y;
        let steps = end_y - start_y;
        let dx = (end_x - start_x) / steps;

        for (let i = 0; i < steps; i++) 
            {
                x += dx;
                y += 1;
                path.push({ x: Math.round(x), y: Math.round(y) });
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
                            square.team = "red"; // TODO: Add Number of Players for Unique Access

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

                    console.log("Path", path);
                    Object.keys(path).forEach((team) => 
                        {
                            let region = regions[team][path[team]];
                            
                            // If we don't have a start we need to find it first
                            if (start_x === 0) 
                                { 
                                    start_x = Math.round((region.x.min + region.x.max) / 2);
                                    start_y = Math.round((region.y.min + region.y.max) / 2);
                                    start_bounds = region;
                                }
                            else 
                                {
                                    end_x = Math.round((region.x.min + region.x.max) / 2);
                                    end_y = Math.round((region.y.min + region.y.max) / 2);
                                    end_bounds = region;
                                }
                        }
                    );

                    let path_center = lerp(start_x, start_y, end_x, end_y);
                    let region = { start: start_bounds, end: end_bounds };
                    let squares = this.createPathArea(path_center, region);
                    pathways = [...pathways, ...squares];
                }
            );

            return pathways;
        }

    static createPathArea = (path_center, bounds) =>
        {
            let squares = [];

            path_center.forEach((position) =>
                {
                    const material = new THREE.MeshBasicMaterial({ color: 0x3c9f19, side: THREE.BackSide });
                    const plane = new THREE.Mesh(plane_geometry, material);
                    let square = plane.clone();

                    for (let i = position.y - path_buffer; i <= position.y + path_buffer; i++)
                        {
                            let scaled_z = (i * square_size) + config.map_offset;

                            for (let j = position.x - path_buffer; j <= position.x + path_buffer; j++)
                                {

                                    if (withinBounds(i, j, bounds))
                                        { continue; }

                                    let square = plane.clone();
                                    square.rotation.x = Math.PI / 2;
                                    let scaled_x = (j * square_size) + config.map_offset;
                                    square.position.set(scaled_x, 0, scaled_z);
                                    square.name = "grid";

                                    squares.push(square);
                                }
                        }

                    squares.push(square);
                }
            );

            return squares;
        }
}