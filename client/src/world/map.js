import * as THREE from 'three';
import config from '/src/configs/map_config.js';
import StateManager from '/src/engine/state_manager.js';


const state = StateManager.instance;

const map_center = state.map_center;
const grid_size = state.grid_size;
const half_grid = state.half_grid;
const spawn_buffer = config.spawn_buffer;
const square_size = config.square_size;
const spawn_area = (spawn_buffer * 2)  * square_size - square_size;
const path_buffer = config.path_buffer;
const square_inset = square_size - config.frame_size;
let x_rotation_matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);

const plane_geometry = new THREE.PlaneGeometry(square_inset, square_inset, 1, 1);
const createSquareMaterial = (color) =>
    {
        return new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0.7,
        //    roughness: 0.7,
        //    metalness: 0.4,
        //    flatShading: true,
        });
    }

let red = 0xc12d10;
let blue = 0x7a94e0;

let red_color = new THREE.Color(red);
let blue_color = new THREE.Color(blue);

let red_square_material = createSquareMaterial(red_color);
let blue_square_material = createSquareMaterial(blue_color);
let path_square_material = createSquareMaterial(0xecefec);


// TODO : Move to Utility Fuction
const clamp = (value, min, max) => { return Math.min(Math.max(value, min), max); }


export default class Map {
    // We're going to use this as a 2D array of objects to represent the map
    // Where undefined is a mountain, and the object is a square that is
    // numbered team spawn or a path
    square_table = [[]]; 
    player_positions = { red: [], blue: [] };
    spawn_areas = {
        red: [],
        blue: []
    }
    path_areas = [];


    constructor() {
        // This will be brought back into init once old_init is trashed
        this.initEmptyMap();
        this.defineSpawnAreas();
        this.definePathways();
        this.constructMap();
        this.constructSpawnAreas();
        this.constructPathways();
    } 

    // a square object should have a 'name', 'id' and 'location'
    // name: spawn, info{ team, id }, location: { x, y }
    addSquare = (id_y, id_x, sq_obj) =>
        {
            const hazardSquare = (id_y, id_x) =>
                {
                    let square = this.square_table[id_y][id_x];
                    let safety = (id_y > 0) ? this.square_table[id_y - 1][id_x] : false;

                    let conflict = square && square.name === "path" && sq_obj.name === "path" && 
                                    (square.start_id === sq_obj.end_id || square.end_id === sq_obj.start_id)
                    
                    let hazard = safety && safety.name === "path" && sq_obj.name === "path" && 
                                (safety.start_id === sq_obj.end_id || safety.end_id === sq_obj.start_id)

                    return conflict && hazard;
                }
            
                // TODO: Refactor please
                // NOTE: This is HIGHLY Inefficient and NEEDS Refactor
            // If we have a path conflicting paths, we want to remove the square
            // But we have to allow for complimentary paths
            if (hazardSquare(id_y, id_x))
                {
                    this.square_table[id_y][id_x] = false;
                    return;
                }

            if (this.square_table[id_y][id_x])
                { return; }

            this.square_table[id_y][id_x] = sq_obj; 
        }

    createPlayableArea = (square) =>
        {
            if (square === undefined)
                { return; }
            
            //console.log(square)

            if (square.name === "player") 
                {
                    //console.log("Creating Spawn Area");
                    if (!this.spawn_areas[square.info.team][square.info.id])
                        {
                            this.spawn_areas[square.info.team][square.info.id] = [];
                            // console.log(`Creating Playable Area for ${square.info.team} ${square.info.id}`);
                            // console.log(this.spawn_areas[square.info.team][square.info.id]);
                        }
                    
                    this.spawn_areas[square.info.team][square.info.id].push(square.location);
                }

            if (square.name === "path")
                {
                    //console.log("Creating Path Area");
                    this.path_areas.push(square.location);
                }
        }

    constructSpawnAreas = () =>
        {
            // console.log("Constructing Spawn Areas");
            // console.log(this.spawn_areas);

            // We iterate over the teams
            Object.entries(this.spawn_areas).forEach(([team, players]) => 
                {
                    let material = team === "red" ? red_square_material : blue_square_material;
                    let map_center = state.map_center;

                    // console.log("Creating Team", team);
                    // console.log(players);

                    // We iterate over the players array
                    for (let player in players) 
                        {
                            //console.log("Creating Player", team, player);
                            let square_count = players[player].length;
                            let mesh = new THREE.InstancedMesh(plane_geometry, material, square_count);
                            mesh.name = `${team}_${player}`;
                            mesh.info = { team: team, id: player };

                            // We iterate over all of the squares of a given player area
                            for (let i = 0; i < square_count; i++)
                                {
                                    let location = players[player][i];
                                    let x = location.x * square_size + config.square_offset - map_center.x;
                                    let y = location.y * square_size + config.square_offset - map_center.y;

                                    let matrix = new THREE.Matrix4();
                                    matrix.makeTranslation(x, 0, y);
                                    // rotate the square to be flat
                                    matrix.multiply(x_rotation_matrix);
                                    mesh.setMatrixAt(i, matrix);
                                    mesh.setColorAt(i, team === "red" ? red_color : blue_color);
                                }

                            state.scene.add(mesh);
                            state.player_areas[team].push(mesh);
                        }
                }
            );
        }
    
    constructPathways = () =>
        {
            let path_count = this.path_areas.length;
            // console.log("Creating Pathways", path_count);
            // console.log(this.path_areas);
            let material = path_square_material;
            let map_center = state.map_center;
            let mesh = new THREE.InstancedMesh(plane_geometry, material, path_count);
            mesh.name = "pathways";

            for (let i = 0; i < path_count; i++)
                {
                    let location = this.path_areas[i];
                    let x = location.x * square_size + config.square_offset - map_center.x;
                    let y = location.y * square_size + config.square_offset - map_center.y;

                    let matrix = new THREE.Matrix4();
                    matrix.makeTranslation(x, 0, y);
                    matrix.multiply(x_rotation_matrix);
                    
                    mesh.setMatrixAt(i, matrix);
                }

            state.scene.add(mesh);
        }



        /////////////////
        // Create Map //
        /////////////////

    initEmptyMap = () =>
        {
            // Create Empty Square_Table
            for (let i = 0; i < grid_size.y; i++)
            {
                this.square_table[i] = [];

                for (let j = 0; j < grid_size.x; j++)
                    { this.square_table[i][j] = false; }
            }
        }
        
    constructMap = () =>
        {
            // This texture mapping doesn't work
            // let map_size = state.field_size;

            // const textureLoader = (path, scale) => {
            //     const texture = new THREE.TextureLoader().load(path);
            //     //texture.wrapS = THREE.MirroredRepeatWrapping;
            //     //texture.wrapT = THREE.MirroredRepeatWrapping;
            //     texture.repeat.set((map_size.x / scale), (map_size.y / scale));
            //     return texture;
            // } 

            // let texture_scale = 1000;

            // const diffuse = textureLoader('assets/textures/map/diffuse.jpg', texture_scale);
            // const normal_map = textureLoader('assets/textures/map/normal.jpg', texture_scale);
            // const bump_map = textureLoader('assets/textures/map/bump.jpg', texture_scale);

            const geometry = new THREE.PlaneGeometry(state.field_size_x, state.field_size_y, grid_size.x, grid_size.y);
            const field_material = new THREE.MeshStandardMaterial( {
                // map: diffuse,
                // normalMap: normal_map,
                // bumpMap: bump_map,
                // bumpScale: 0.5,
                color: 0xbc7e49,
                roughness: 0.7,
                metalness: 0.4,
                flatShading: true,
                //wireframe: true
            } )
            const terrain = new THREE.Mesh(geometry, field_material);
            terrain.rotation.x = -Math.PI / 2;
            terrain.position.set(0, -1, 0);
            terrain.name = "terrain";
            terrain.receiveShadow = true;
            terrain.castShadow = true;

            let vertex = new THREE.Vector3();

            const findSquare = (y, x) =>
                { 
                    if (y < 0 || y >= grid_size.y || x < 0 || x >= grid_size.x)
                        { return false; }

                    return this.square_table[y][x]; 
                }

            let half_set = false;

            for (let i = 0; i < geometry.attributes.position.count; i++)
                {
                    // We have to add 1 for the x and y
                    // to account for the extra vertices
                    let x = i % (grid_size.x + 1);
                    let y = Math.floor(i / (grid_size.x + 1));

                    let current_square = findSquare(y, x);

                    // If we are in a square then we want to draw it
                    if (current_square)
                        { 
                            this.createPlayableArea(current_square); 
                            continue;
                        }

                    let look_above = findSquare(y - 1, x);
                    let look_down = findSquare(y + 1, x);
                    let look_ahead = findSquare(y, x + 1);
                    let look_behind = findSquare(y, x - 1);
                    let look_adjascent = findSquare(y - 1, x - 1)
                    let look_up_two = findSquare(y - 2, x);

                    if (look_adjascent)
                        {
                            half_set = true;
                            continue;
                        }

                    // If we have squares above or below, we want to skip
                    if (look_above || look_behind)
                        {   continue; }


                    vertex.fromBufferAttribute(geometry.attributes.position, i);

                    // if we are adjacent to a square, we want to raise the vertex partially
                    if (look_ahead || (look_above && !look_ahead) || (look_down && !look_behind) || half_set || look_up_two)
                        { vertex.z =  5 + Math.random() * 12 - 3; half_set = false; }
                    else // Otherwise we want to raise the vertex to top level
                        { vertex.z = Math.random() * 5 + 15; }
                    
                    geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
                }



            state.scene.add(terrain);

        }


    /////////////////////////
    // Create Player Areas //
    /////////////////////////

    // TODO: Swap this for instanced mesh
    addHemisphereLight = (position) =>
        {
            let light_x = position.x * square_size + config.square_offset - map_center.x;
            let light_y = position.y * square_size + config.square_offset - map_center.y;

            // TODO: Add Interpolation for day and night cycle
            let player_lighting = new THREE.HemisphereLight(0x996611, 0x00cc99, 0.1); // This is the perfect night color
            player_lighting.name = "light";
            player_lighting.position.set(light_x, 4, light_y);
            player_lighting.color.setHSL(1, 1, 1); // This is the perfect Day Color 
            player_lighting.groundColor.setHSL(0.25, .5, .7);
            state.scene.add(player_lighting);
    
            // Hemisphere Helper
            // const hemisphere_helper = new THREE.HemisphereLightHelper(player_lighting, 5);
            // state.scene.add(hemisphere_helper);
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
                                                i, j, // This is redundant
                                                { 
                                                    name: "player",
                                                    info: { team: team, id: player },
                                                    location: { 
                                                        x: j, 
                                                        y: i 
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

                        this.definePathArea(start_index, start_area, end_index, end_area);
                    }
            );
        }

    definePathArea = (start_id, start_area, end_id, end_area) =>
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
                                
                            this.addSquare(
                                    _y, 
                                    _x, 
                                    { 
                                        name: "path", 
                                        start_id: start_id, 
                                        end_id: end_id,
                                        location: { x: _x, y: _y } 
                                    }
                                );
                        }
                    
                    left_start_x += dx;
                    left_start_y += 1;

                    right_start_x += dx;
                    right_start_y += 1;
                }
        }
}