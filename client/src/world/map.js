import * as THREE from 'three';
import config from '/src/configs/map_config.js';
import StateManager from '/src/engine/state_manager.js';


const state = StateManager.instance;

const map_center = state.map_center;
const grid_size = state.grid_size;
const half_grid = state.half_grid;
const spawn_buffer = config.spawn_buffer;
const square_size = config.square_size;
const path_buffer = config.path_buffer;

const square_inset = square_size - config.frame_size;

const plane_geometry = new THREE.PlaneGeometry(square_inset, square_inset, 1, 1);

// TODO : Move to Utility Fuction
const clamp = (value, min, max) => { return Math.min(Math.max(value, min), max); }

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
        let left_limit = [];
        let right_limit = [];

        let slope = (end_y - start_y) / (end_x - start_x);

        let ascending = slope < 0;
        let shallow = Math.abs(slope) < 1;

        let steps = (end_y - start_y);
        let dx = (end_x - start_x) / steps;

        let x = start_x;
        let y = start_y;

        let left_start_x = shallow ? start_x - config.path_buffer / Math.abs(slope) : start_x - config.path_buffer;
        left_start_x = Math.floor(left_start_x);

        let left_start_y = ascending ? start_y - config.path_buffer : start_y + config.path_buffer;
        left_start_y = shallow ? ascending ? left_start_y + 1 : left_start_y - 1 : left_start_y;
        left_start_y = ascending ? Math.floor(left_start_y) : Math.ceil(left_start_y);

        let right_start_x = shallow ? start_x + config.path_buffer / Math.abs(slope) : start_x + config.path_buffer;
        right_start_x = Math.floor(right_start_x);

        let right_start_y = ascending ? start_y + config.path_buffer : start_y - config.path_buffer;
        right_start_y = ascending ? Math.ceil(right_start_y) : Math.floor(right_start_y);
        right_start_y = shallow ? ascending ? right_start_y - 1 : right_start_y + 1 : right_start_y;

        const beyondLimits = (condition, x, min_x, max_x) => 
            { return condition && x > max_x || !condition && x < min_x; }

        for (let i = 0; i < steps; i++)
            {
                x += dx;
                y += 1;

                let cross_walk = right_start_x - left_start_x;
                let dy = ascending ? 
                            Math.max(right_start_y, left_start_y) - Math.min(right_start_y, left_start_y) :
                            Math.min(right_start_y, left_start_y) - Math.max(right_start_y, left_start_y);

                for (let j = 0; j <= cross_walk; j++)
                    {
                        let _x = Math.round(left_start_x + j);
                        let _y = ascending ? Math.floor(left_start_y + dy) : Math.ceil(left_start_y + dy);
                        
                        // We store the left and right limits for the path if we are
                        // at our bounds
                        if (j === 0) 
                            { 
                                let lx = _x - 1;
                                if (validStep(_y, lx, bounds))
                                    { left_limit.push({ x: lx, y: _y }); }

                                let rx = Math.round(left_start_x + j + cross_walk);
                                if (validStep(_y, rx, bounds))
                                    { right_limit.push({ x: rx, y: _y }); }
                            }

                        if (shallow && 
                                (beyondLimits(ascending, _x, bounds.start.x.min, bounds.start.x.max) || 
                                beyondLimits(!ascending, _x, bounds.end.x.min, bounds.end.x.max))) 
                            { continue; }
                            
                        // We store the step for the path if it's valid
                        if (validStep(_y, _x, bounds))
                            { path.push({ x: _x, y: _y }); }

                    }
                
                left_start_x += dx;
                left_start_y += 1;

                right_start_x += dx;
                right_start_y += 1;
                    
            }

        return {
            path: path,
            left_limit: left_limit,
            right_limit: right_limit
        };
    }

export default class Map {
    // We're going to use this as a 2D array of objects to represent the map
    // Where undefined is a mountain, and the object is a square that is
    // numbered team spawn or a path
    square_table = [[]]; 

    constructor() {
        // This will be brought back into init once old_init is trashed
        this.initEmptyMap();
        
        this.old_init();

        this.init();
    } 

    // a square object should have a 'name', 'id' and 'location'
    // { name: "red", id: 3, location: { x: 25, y: 48 } }
    addSquare = (id_y, id_x, sq_obj) =>
        {
            console.log("grid_size", grid_size);
            console.log("Table Length:", this.square_table.length);
            console.log("idx", id_x, "", id_y);
            if (!this.square_table[id_y][id_x])
                { 
                    // console.log("Adding Square");
                    // console.log(sq_obj);
                    this.square_table[id_y][id_x] = sq_obj; }
            else
                { 
                    console.warn("Square already exists at location"); 
                    console.debug(this.square_table[id_y][id_x]);
                    console.debug(sq_obj);
                }
        }

    init = () =>
        {
            // Here we iterate over all the things and create our terrain
            
            const geometry = new THREE.PlaneGeometry(state.field_size_x, state.field_size_y, grid_size.x, grid_size.y);
            const field_material = new THREE.MeshStandardMaterial( {
                color: 0x7c4e29,
                roughness: 0.7,
                metalness: 0.4,
                flatShading: true,
            } )
            const underpinning = new THREE.Mesh(geometry, field_material);
            underpinning.rotation.x = -Math.PI / 2;
            underpinning.position.set(0, -1, 0);
            underpinning.name = "underpinning";
            underpinning.receiveShadow = true;
            underpinning.castShadow = true;

            let vertex = new THREE.Vector3();

            let hill = true;
            let first_step = false;
            let last_step = false;

            const lookahead = (y, x) =>
                { return !!this.square_table[y][x]; }

            for (let i = 0; i < geometry.attributes.position.count; i++)
                {
                    // This is a hack to handle the fact that 1 square has 2 lines
                    // or rather that 5 squares have 6 lines. So we will treat it like the last line
                    let y_position = Math.min(Math.floor(i / (grid_size.x)), grid_size.y - 1)
                    let x_position = i % (grid_size.x + 1);

                    // We calculate this either way, but have to + 1 to account for the last line
                    let toggle_hill = lookahead(y_position, x_position);
                    let toggle_step = lookahead(y_position, Math.min(x_position + 1, grid_size.x));
                 
                    if (toggle_hill && toggle_step)
                        { continue; }

                    if (x_position === 0)
                        { hill = true; }
                        

                    if (hill && toggle_step && !last_step) 
                        { last_step = true; }
                    else if (!hill && toggle_hill && first_step)
                        {
                            first_step = false;
                            hill = true; 
                        }
                    // Handle the first step (start of a hill)
                    else if (!hill && toggle_step && !first_step) 
                        { first_step = true; }
                    else if (!hill)
                        { continue; }

                    // Modify the z-position of the vertex
                    vertex.fromBufferAttribute(geometry.attributes.position, i);
                    
                    // Adjust z based on first or last step, or if in the middle of a hill
                    vertex.z = (first_step || last_step) 
                        ? Math.random() * 6 + 5 // Half-height calculation
                        : Math.random() * 3 + 15; // Full hill height
                    
                    geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);

                    // Toggle the hill off after reaching the end of a step
                    if (toggle_hill && last_step) 
                        { 
                            hill = false; // End of hill
                            last_step = false; // Reset last step
                        }
                }


            // for (let i = 0; i < grid_size.y; i++)
            //     {
            //         let hill = true;

            //         for (let j = 0; j < grid_size.x; j++)
            //             {
            //                 //let idx = j * grid_size.y + i;
            //                 let idx = i * grid_size.x + j;

            //                 if (!hill)
            //                     { continue; }

            //                 vertex.fromBufferAttribute(geometry.attributes.position, idx);
            //                 vertex.z = Math.random() * 3 + 15;
            //                 geometry.attributes.position.setXYZ(idx, vertex.x, vertex.y, vertex.z);

            //                 if (this.square_table[i][j + 1] !== undefined)
            //                     { hill = !hill; }
            //             }
            //     }

            state.scene.add(underpinning);

        }

    initEmptyMap = () =>
        {
            for (let i = 0; i < grid_size.y; i++)
            {
                this.square_table[i] = [];

                for (let j = 0; j < grid_size.x; j++)
                    {
                        this.square_table[i][j] = undefined;
                    }
            }
    }

    get squares() { return this.square_table.flat().filter((square) => square !== undefined); }

    old_init = () =>
        {
            let red_team = state.game_config["red"];
            let blue_team = state.game_config["blue"];
            
            let [red_squares, red_regions] = this.createPlayerAreas(red_team, "red");
            let [blue_squares, blue_regions] = this.createPlayerAreas(blue_team, "blue");
            let paths = this.createPathways(state.game_config["paths"], {"red": red_regions, "blue": blue_regions});

            this.grid = [...red_squares, ...blue_squares, ...paths.paths];
            this.grid.forEach((square) => 
                { state.scene.add(square); });

            let grid_size = state.game_config["grid_size"];

        }

    /////////////////////////
    // Create Player Areas //
    /////////////////////////

    createPlayerAreas = (team, color) => 
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
                    let plane = this.createSpawnArea(player_position, red_team, i);
                    squares = [...squares, ...plane];
                }

            return [squares, player_positions];
        }

    // TODO: Use this to draw frame 
    constructPlayerBounds = (position) =>
        {
            let light_x = position.x * square_size + config.square_offset - map_center.x;
            let light_y = position.y * square_size + config.square_offset - map_center.y;
            let player_lighting = new THREE.HemisphereLight(0xcc9933, 0x00cc99, 0.3);
            player_lighting.position.set(light_x, 4, light_y);
            player_lighting.color.setHSL(0.6, 1, 0.6);
            player_lighting.groundColor.setHSL(0.095, 1, 0.75);
            state.scene.add(player_lighting);
    
            // Hemisphere Helper
            const hemisphere_helper = new THREE.HemisphereLightHelper(player_lighting, 5);
            state.scene.add(hemisphere_helper);

            // TODO: Use these to block the corners
            //       to give a rounded box effect
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

    pickRandomXY = (node) => 
        {
            let grid_size = state.grid_size;
            let min_x = node.min_x * grid_size.x;
            let max_x = node.max_x * grid_size.x - 1;
            let min_y = node.min_y * grid_size.y;
            let max_y = node.max_y * grid_size.y - 1;

            let x = (Math.floor(Math.random() * (max_x - min_x)) + min_x);
            let y = (Math.floor(Math.random() * (max_y - min_y)) + min_y);

            return {
                x: Math.round(clamp(x, spawn_buffer, grid_size.x - 1 - spawn_buffer)),
                y: Math.round(clamp(y, spawn_buffer, grid_size.y - 1 - spawn_buffer))
            }
        }

    createSpawnArea = (position, red_team, player) => 
        {
            let squares = [];

            let x_dim = position.x.max - position.x.min;
            let y_dim = position.y.max - position.y.min;
            let square = new THREE.Mesh(plane_geometry, new THREE.MeshBasicMaterial({ color: 0xac9c3c, side: THREE.FrontSide }));
            square.rotation.x = -Math.PI / 2;

            // const material = new THREE.MeshBasicMaterial({ 
            //     color: red_team ? 0xfc3c11 : 0x113c9c, 
            //     side: THREE.BackSide });
            // const plane = new THREE.Mesh(plane_geometry, material);

            let team = red_team ? "red" : "blue";

            for (let i = 0; i <= y_dim; i++)
                {
                    let y = position.y.min + i;

                    for (let j = 0; j <= x_dim; j++)
                        {

                            if (i === 0 || i === y_dim || j === 0 || j === x_dim)
                                {
                                    this.addSquare(position.y.min + i, position.x.min + j, { name: team, id: player, location: { x: j, y: i }});

                                    let x = position.x.min + j;
                                    let outline = square.clone();

                                    let scaled_x = (x * square_size) + config.square_offset - map_center.x;
                                    let scaled_z = (y * square_size) + config.square_offset - map_center.y;
                                    outline.position.set(scaled_x, 0, scaled_z);
                                    outline.name = "grid";
                                    outline.team = red_team ? "red" : "blue"; // TODO: Add Number of Players for Unique Access
                                    outline.player = player;
                                    outline.location = { x: j, y: i };

                                    squares.push(outline);
                                }
                        }
                }
            
            return squares;
        }

    /////////////////////
    // Create Pathways //
    /////////////////////

    createPathways = (paths, regions) => 
        {
            let pathways = [];
            let bounds = {
                    "left": [],
                    "right": []
                };

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
                    let patharea = this.createPathArea(pathway);
                    pathways = [...pathways, ...patharea];
                    bounds.left = [...bounds.left, ...pathway.left_limit];
                    bounds.right = [...bounds.right, ...pathway.right_limit];
                }
            );

            return {
                    paths: pathways,
                    borders: bounds
                };
        }

    createPathArea = (pathway) =>
        {
            let squares = [];
            let path = pathway.path;
            let limits = [...pathway.left_limit, ...pathway.right_limit];

            // path.forEach((position) =>
            //     {
            //         let square = new THREE.Mesh(plane_geometry, new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.BackSide }));
            //         square.rotation.x = Math.PI / 2;
            //         let scaled_x = (position.x * square_size) + config.square_offset - map_center.x;
            //         let scaled_z = (position.y * square_size) + config.square_offset - map_center.y;
            //         square.position.set(scaled_x, 0, scaled_z);
            //         square.name = "grid";
            //         square.team = "none";
            //         square.player = -1;
            //         square.location = { x: position.x, y: position.y };

            //         squares.push(square);
            //     }
            // );

            limits.forEach((position) =>
                {
                    this.addSquare(position.y, position.x, { name: "path", id: -1, location: { x: position.x, y: position.y } });

                    let square = new THREE.Mesh(plane_geometry, new THREE.MeshBasicMaterial({ color: 0xac9c3c, side: THREE.FrontSide }));
                    square.rotation.x = -Math.PI / 2;
                    let map_center = state.map_center;
                    let scaled_x = (position.x * square_size) + config.square_offset - map_center.x;
                    let scaled_z = (position.y * square_size) + config.square_offset - map_center.y;
                    square.position.set(scaled_x, 0, scaled_z);
                    square.name = "grid";
                    square.team = "none";
                    square.player = -1;
                    square.location = { x: position.x, y: position.y };

                    squares.push(square);
                }
            );

            return squares;
        }

    ////////////////////
    // Create Terrain //
    ////////////////////

    createTerrain = () => 
        {

        }
}