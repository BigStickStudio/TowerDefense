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


export default class Map {
    // We're going to use this as a 2D array of objects to represent the map
    // Where undefined is a mountain, and the object is a square that is
    // numbered team spawn or a path
    square_table = [[]]; 
    player_positions = { red: [], blue: [] };


    constructor() {
        // This will be brought back into init once old_init is trashed
        this.initEmptyMap();
        let regions = this.defineSpawnAreas();
        this.definePathways(regions);
        this.constructMap();
    } 

    // a square object should have a 'name', 'id' and 'location'
    // { name: "red", id: 3, location: { x: 25, y: 48 } }
    addSquare = (id_y, id_x, sq_obj) =>
        {
            // console.warn("Adding Square")
            // console.log("idx", id_x, "", id_y);
            // console.debug(sq_obj);
            // console.log("grid_size", grid_size);
            // console.log("Table Length:", this.square_table.length);
            if (!this.square_table[id_y][id_x])
                { 
                    // console.log("Adding Square");
                    // console.log(sq_obj);
                    this.square_table[id_y][id_x] = sq_obj; }
            // else
            //     { 
            //         console.error("Square already exists at location"); 
            //         console.debug(this.square_table[id_y][id_x]);
            //     }
        }

    createPlayableArea = (square) =>
        {
            if (square === undefined)
                { return; }
            
            // console.log("Creating Playable Area");
            // console.log(square);
        }

    constructMap = () =>
        {
            // Here we iterate over all the things and create our terrain
            
            const geometry = new THREE.PlaneGeometry(state.field_size_x, state.field_size_y, grid_size.x, grid_size.y);
            const field_material = new THREE.MeshStandardMaterial( {
                color: 0x7c4e29,
                roughness: 0.7,
                metalness: 0.4,
                flatShading: true,
                //wireframe: true
            } )
            const underpinning = new THREE.Mesh(geometry, field_material);
            underpinning.rotation.x = -Math.PI / 2;
            underpinning.position.set(0, -1, 0);
            underpinning.name = "underpinning";
            underpinning.receiveShadow = true;
            underpinning.castShadow = true;

            let vertex = new THREE.Vector3();

            // We're using 2 states because we can be inbetween states managed 
            // over a period of 2 squares, where the lookahead will be different
            let hill = true;
            let valley = false; 
            let store = false;

            const lookahead = (y, x) =>
                { return this.square_table[y][x]; }

            for (let i = 0; i < geometry.attributes.position.count; i++)
                {
                    // This is a hack to handle the fact that 1 square has 2 lines
                    // or rather that 5 squares have 6 lines. So we will treat it like the last line
                    let y_position = Math.min(Math.floor(i / (grid_size.x)), grid_size.y - 1)
                    let x_position = i % (grid_size.x + 1);

                    // We calculate this either way, but have to + 1 to account for the last line
                    let look_ahead = lookahead(y_position, Math.min(x_position + 1, grid_size.x));

                    // !H & V -> Valley
                    if (!hill && valley)
                        {
                            this.createPlayableArea(store);

                            // If there is no next square we transition to a hill on the next pass
                            if (!look_ahead)
                                { hill = !hill; }
                        }

                    // If we have a lookahead, we store it nomatter what
                    if (look_ahead)
                        { 
                            store = look_ahead;
                        }

                    vertex.fromBufferAttribute(geometry.attributes.position, i);

                    // H & !V -> Hill
                    if (hill && !valley)
                        { 
                            vertex.z = Math.random() * 3 + 15; 

                            // If we have a lookahead, we transition to a valley on the next pass
                            if (look_ahead)
                                { hill = !hill; }
                        }
                    // H & V -> Transition to Hill     // !H & !V -> Transition to Valley
                    else if ((hill && valley) || (!hill && !valley))
                        { 
                            // If we are in a valley, we are transitioning to a hill
                            // and if we are in a hill, we are transitioning to a valley
                            valley = !valley; 
                            vertex.z = Math.random() * 6 + 5; // and we want a midpoint transition
                        }

                    geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);

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
                    { this.square_table[i][j] = false; }
            }
    }

    get squares() { return this.square_table.flat().filter((square) => square !== undefined); }

    /////////////////////////
    // Create Player Areas //
    /////////////////////////

    addHemisphereLight = (position) =>
        {
            console.log("Adding Hemisphere Light");
            console.log(position);
            let light_x = position.x * square_size + config.square_offset - map_center.x;
            let light_y = position.y * square_size + config.square_offset - map_center.y;
            console.log("Light Position", light_x, light_y);
            // TODO: Add Interpolation for day and night cycle
            let player_lighting = new THREE.HemisphereLight(0x996611, 0x00cc99, 0.1); // This is the perfect night color
            player_lighting.position.set(light_x, 4, light_y);
            // player_lighting.color.setHSL(0.6, 1, 0.6); // This is the perfect Day Color 
            // player_lighting.groundColor.setHSL(0.095, 1, 0.75);
            state.scene.add(player_lighting);
    
            // Hemisphere Helper
            const hemisphere_helper = new THREE.HemisphereLightHelper(player_lighting, 5);
            state.scene.add(hemisphere_helper);
        }

    defineSpawnAreas = () => 
        {

            // We iterate over the teams and their positions
            Object.entries(state.teams).forEach(([team, positions]) => 
                {
                    // We iterate through all the positions
                    for (let i = 0; i < positions.length; i++) 
                        {

                            let node = positions[i];

                            // We pick a random x, y position within the node bounds
                            let position = this.pickRandomXY(node);
                            this.addHemisphereLight(position);
                            
                            // We simply calculate the min and max bounds for the player area
                            // and construct an object of {position, x{min, max}, y{min, max}}
                            // that we then add to this.player_positions
                            this.definePlayerBounds(position, team);
                        }
                }
            );

            this.addSpawnArea();
        }

    definePlayerBounds = (position, team) =>
        {
            let min_x = position.x - spawn_buffer; 
            let max_x = position.x + spawn_buffer;
            let min_y = position.y - spawn_buffer;
            let max_y = position.y + spawn_buffer;

            this.player_positions[team].push(
                {
                    position: position,
                    bounds: {
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
            );
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

    addSpawnArea = () => 
        {
            const dropCorners = (i, j, bounds) => 
                {
                    return (i === bounds.y.min && (j === bounds.x.min || j === bounds.x.max)) ||
                           (i === bounds.y.max && (j === bounds.x.min || j === bounds.x.max));
                }

            // We iterate over all of the player positions, getting the team and all the positions
            Object.entries(this.player_positions).forEach(([team, positions]) =>
                {
                    // For each player in the team, we get the bounds and iterate over them
                    for (let player in positions)
                        {
                            let bounds = positions[player].bounds;

                            // and we populate the entire area, minus the corners
                            for (let i = bounds.y.min; i <= bounds.y.max; i++)
                                {
                                    for (let j = bounds.x.min; j <= bounds.x.max; j++)
                                        {
                                            if (dropCorners(i, j, bounds))
                                                { continue; }

                                            // This adds the square to our square_table
                                            this.addSquare(
                                                i, j, 
                                                { 
                                                    name: team, 
                                                    id: player, 
                                                    location: { 
                                                        x: bounds.x.min - j, 
                                                        y: bounds.y.min - i 
                                                    }
                                                }
                                            );
                                        }
                                }
                        }
                    
                }
            );
                        
        }

    /////////////////////
    // Create Pathways //
    /////////////////////

    definePathways = () => 
        {
            state.path_mappings.forEach(
                (path) =>
                    {
                        // Deconstruct the k:v pairs from the path configuration
                        let [start_team, start_index] = Object.entries(path[0])[0];
                        let [end_team, end_index] = Object.entries(path[1])[0];

                        const start_area = this.player_positions[start_team][start_index];
                        const end_area = this.player_positions[end_team][end_index];

                        this.definePathArea(start_area, end_area);
                    }
            );
        }

    definePathArea = (start_area, end_area) =>
        {
            // Deconstruct the player_positions object to get the positions and bounds
            let start_position = start_area.position;
            let end_position = end_area.position;

            let bounds = {
                start: start_area.bounds,
                end: end_area.bounds
            }

            let start_x = start_position.x;
            let start_y = start_position.y;
            let end_x = end_position.x;
            let end_y = end_position.y;

            // We calculate the slope of the path
            let slope = (end_y - start_y) / (end_x - start_x);

            // Determine if we are moving up-right/down-left or up-left/down-right
            let ascending = slope < 0;
            let shallow = Math.abs(slope) < 1;

            let steps = (end_y - start_y);
            let dx = (end_x - start_x) / steps;

            let x = start_x;
            let y = start_y;

            // These values are offsets of the start position to allow for the path to be drawn from end-to-end
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

            // This function checks if our path has exceeded the given spawn area
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
                            
                            if (shallow && 
                                    (beyondLimits(ascending, _x, bounds.start.x.min, bounds.start.x.max) || 
                                     beyondLimits(!ascending, _x, bounds.end.x.min, bounds.end.x.max))) 
                                { continue; }
                                
                            this.addSquare(_y, _x, { name: "path", id: 0, location: { x: j, y: i } });
                        }
                    
                    left_start_x += dx;
                    left_start_y += 1;

                    right_start_x += dx;
                    right_start_y += 1;
                        
                }

        }

    ////////////////////
    // Create Terrain //
    ////////////////////

    createTerrain = () => 
        {

        }
}