import * as THREE from 'three';
import config from '../configs/map_config.js';
import StateManager from '../engine/state_manager.js';
import { fragmentShader, vertexShader } from '../shaders/map.js';
import { batchTextureLoader, textureLoader } from '../world/utils.js';

const state = StateManager.instance;

const map_center = state.map_center;
const grid_size = state.grid_size;
const spawn_buffer = config.spawn_buffer;
const square_size = config.square_size;
const square_inset = square_size - config.frame_size;
let x_rotation_matrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);

const plane_geometry = new THREE.PlaneGeometry(square_inset, square_inset, 1, 1);
const createSquareMaterial = (color) =>
    {
        return new THREE.MeshPhysicalMaterial({
            color: color,
            transparent: true,
            roughness: 0,
            metalness: 0.4,
            opacity: 0.6,
            reflectivity: 1,
            iridescence: true,
            iridescenceIOR: 1.3,
            clearcoat: 0.1,
            specularIntensity: 0.5,
        });
    }

let red = 0xE23513;
let blue = 0x0A44EF;

let red_square_material = createSquareMaterial(red);
let blue_square_material = createSquareMaterial(blue);
let path_square_material = createSquareMaterial(0xecefec);


// TODO : Move to Utility Fuction
const clamp = (value, min, max) => { return Math.min(Math.max(value, min), max); }


export default class Map {
    // We're going to use this as a 2D array of objects to represent the map
    // Where undefined is a mountain, and the object is a square that is
    // numbered team spawn or a path
    square_table = [[]]; 
    player_positions = { red: [], blue: [] };
    spawn_areas = { red: [], blue: [] }
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

    updateLighting = () => 
        {
            let day_cycle = state.normalized_day_cycle;
            for (const lights of state.hemisphere_lights)
                {
                    // TODO: Move these to a local static function
                    lights.color.copy(config.lerpTopColor(day_cycle));
                    lights.groundColor.copy(config.lerpBottomColor(day_cycle));
                }
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
                //This texture mapping doesn't work
                let map_size = state.field_size;
    
    
                // Top Texture Scales:
                    // Granite Scale 75
                    // Stone 
    
                let top_scale = 1;
                let middle_scale = 1;
                let bottom_scale = 1;
                let noise_scale = 100;

                // TODO: Major Refactor Here
                const top_a = batchTextureLoader('/assets/textures/map/tops/grass/', top_scale, map_size);
                const top_b = batchTextureLoader('/assets/textures/map/tops/flowers/', top_scale, map_size);
                const top_c = batchTextureLoader('/assets/textures/map/tops/barren/', top_scale, map_size);
                // const top_d = batchTextureLoader('/assets/textures/map/tops/snow/', top_scale, map_size);
                // TODO: Look at individual texture scaling and grouped textures e.g. 'snow', 'barren', 'grassy', etc

                let top_choices = [ top_a, top_b, top_c];

                const top1 = top_choices[Math.floor(Math.random() * top_choices.length)];
                top_choices = top_choices.filter((choice) => choice !== top1);
                const top2 = top_choices[Math.floor(Math.random() * top_choices.length)];
                top_choices = top_choices.filter((choice) => choice !== top2);
                const top3 = top_choices[Math.floor(Math.random() * top_choices.length)];
            
                const middle_a = batchTextureLoader('/assets/textures/map/walls/stone/', middle_scale, map_size);
                const middle_b = batchTextureLoader('/assets/textures/map/walls/lavarock/', middle_scale, map_size);
                const middle_c = batchTextureLoader('/assets/textures/map/walls/granite/', middle_scale, map_size);
                const middle_d = batchTextureLoader('/assets/textures/map/walls/rocks1/', middle_scale, map_size);
                const middle_e = batchTextureLoader('/assets/textures/map/walls/rocks2/', middle_scale, map_size);
                const middle_f = batchTextureLoader('/assets/textures/map/walls/rocks3/', middle_scale, map_size);

                let middle_choices = [ middle_a, middle_b, middle_c, middle_d, middle_e, middle_f ];

                const middle1 = middle_choices[Math.floor(Math.random() * middle_choices.length)];
                middle_choices = middle_choices.filter((choice) => choice !== middle1);
                const middle2 = middle_choices[Math.floor(Math.random() * middle_choices.length)];
                middle_choices = middle_choices.filter((choice) => choice !== middle2);
                const middle3 = middle_choices[Math.floor(Math.random() * middle_choices.length)];

                const bottom_a = batchTextureLoader('/assets/textures/map/floors/gravel1/', bottom_scale, map_size);
                const bottom_b = batchTextureLoader('/assets/textures/map/floors/gravel2/', bottom_scale, map_size);
                const bottom_c = batchTextureLoader('/assets/textures/map/floors/pavement/', bottom_scale, map_size);
                const bottom_d = batchTextureLoader('/assets/textures/map/floors/sand1/', bottom_scale, map_size);
                const bottom_e = batchTextureLoader('/assets/textures/map/floors/sand2/', bottom_scale, map_size);

                let bottom_choices = [ bottom_a, bottom_b, bottom_c, bottom_d, bottom_e ];

                const bottom1 = bottom_choices[Math.floor(Math.random() * bottom_choices.length)];
                bottom_choices = bottom_choices.filter((choice) => choice !== bottom1);
                const bottom2 = bottom_choices[Math.floor(Math.random() * bottom_choices.length)];

                const top_noise1 = textureLoader('/assets/textures/noise/turbulence/turbulence1.png', noise_scale, map_size);
                const top_noise2 = textureLoader('/assets/textures/noise/milky/milky1.png', noise_scale, map_size);
                const middle_noise1 = textureLoader('/assets/textures/noise/manifold/manifold3.png', noise_scale, map_size);
                const middle_noise2 = textureLoader('/assets/textures/noise/swirl/swirl1.png', noise_scale, map_size);
                const bottom_noise = textureLoader('/assets/textures/noise/manifold/manifold1.png', noise_scale, map_size);
                const uv_noise = textureLoader('/assets/textures/noise/perlin/perlin1.png', noise_scale, map_size);

                const underpinning_geometry = new THREE.PlaneGeometry(state.field_size_x * 2, state.field_size_y * 2);
                const underpinning_material = new THREE.MeshStandardMaterial({
                    color: 0x000000,
                    side: THREE.DoubleSide,
                });
    
                // Used to block light from orbiting sun/moon
                const underpinning = new THREE.Mesh(underpinning_geometry, underpinning_material);
                underpinning.rotation.x = -Math.PI / 2;
                underpinning.position.set(0, -2, 0);
                underpinning.name = "terrain";
                underpinning.receiveShadow = true;
                underpinning.castShadow = true;
                state.scene.add(underpinning);

                // random number between 0.4 and 0.8
                let random_scale = Math.random() * 0.4 + 0.6;
                state.uv_scale = new THREE.Vector2(random_scale, random_scale);

                // random number betwee 0.2 and 0.4
                let random_offset = Math.random() * 0.5 + 0.6;
                state.uv_offset = new THREE.Vector2(random_offset, random_offset);
                
                const terrain_geometry = new THREE.PlaneGeometry(state.field_size_x, state.field_size_y, grid_size.x, grid_size.y);
                // const field_material = new THREE.MeshLambertMaterial( {
                //     map: diffuse,
                //     normalMap: normal_map,
                //     bumpMap: bump_map,
                //     bumpScale: 0.5,
                //     color: 0xbc7e49,
                //     flatShading: true,
                //     //wireframe: true
                //     shadowSide: THREE.FrontSide,
                //     side: THREE.DoubleSide
                // } )
                const field_material = new THREE.ShaderMaterial({
                    uniforms: {
                        top1_texture: { value: top1.diffuse },
                        top1_normal: { value: top1.normal },
                        top1_bump: { value: top1.bump },
                        top2_texture: { value: top2.diffuse },
                        top2_normal: { value: top2.normal },
                        top2_bump: { value: top2.bump },
                        top3_texture: { value: top3.diffuse },
                        top3_normal: { value: top3.normal },
                        top3_bump: { value: top3.bump },
                        top_bounds: { value: 19 },
                        middle1_texture: { value: middle1.diffuse },
                        middle1_normal: { value: middle1.normal },
                        middle1_bump: { value: middle1.bump },
                        middle2_texture: { value: middle2.diffuse },
                        middle2_normal: { value: middle2.normal },
                        middle2_bump: { value: middle2.bump },
                        middle3_texture: { value: middle3.diffuse },
                        middle3_normal: { value: middle3.normal },
                        middle3_bump: { value: middle3.bump },
                        middle_bounds: { value: 6 },
                        lower1_texture: { value: bottom1.diffuse },
                        lower1_normal: { value: bottom1.normal_map },
                        lower1_bump: { value: bottom1.bump_map },
                        lower2_texture: { value: bottom2.diffuse },
                        lower2_normal: { value: bottom2.normal_map },
                        lower2_bump: { value: bottom2.bump_map },
                        lower_bounds: { value: -3 },
                        top_scale: { value: new THREE.Vector3(0.03, 0.03, 0.03) },
                        // top_scale: { value: new THREE.Vector3(1, 1, 1) },
                        middle_scale: { value: new THREE.Vector3(0.029, 0.042, 0.021) },
                        lower_scale: { value: new THREE.Vector3(0.01, 0.01, 0.01) },
                        top_noise_map1: { value: top_noise1 },
                        top_noise_map2: { value: top_noise2 },
                        middle_noise_map1: { value: middle_noise1 },
                        middle_noise_map2: { value: middle_noise2 },
                        bottom_noise_map: { value: bottom_noise },
                        uv_noise: { value: uv_noise },
                        uv_offset: { value: state.uv_offset }, // 0.55
                        uv_scale: { value: state.uv_scale } // 0.575
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                  });
                state.field_material = field_material;

                const terrain = new THREE.Mesh(terrain_geometry, field_material);
                terrain.rotation.x = -Math.PI / 2;
                terrain.position.set(0, -0.5, 0);
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
    
                for (let i = 0; i < terrain_geometry.attributes.position.count; i++)
                    {
                        // We have to add 1 for the x and y
                        // to account for the extra vertices
                        let x = i % (grid_size.x + 1);
                        let y = Math.floor(i / (grid_size.x + 1));
    
                        if (x < 2 || x >= grid_size.x - 3)
                            { 
                                if (x === 0 || x === grid_size.x + 1)
                                    {
                                        vertex.fromBufferAttribute(terrain_geometry.attributes.position, i);
                                        terrain_geometry.attributes.position.setXYZ(i, 0, vertex.y, -10);
                                    }
                                else
                                    {
                                        vertex.fromBufferAttribute(terrain_geometry.attributes.position, i);
                                        terrain_geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, -10);
                                    }
                                
                                
                                continue; }
    
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
    
    
                        vertex.fromBufferAttribute(terrain_geometry.attributes.position, i);
    
                        // if we are adjacent to a square, we want to raise the vertex partially
                        if (look_ahead || (look_above && !look_ahead) || (look_down && !look_behind) || half_set || look_up_two)
                            { vertex.z =  8 + Math.random() * 15 - 3; half_set = false; }
                        else // Otherwise we want to raise the vertex to top level
                            { vertex.z = Math.random() * 7 + 17; }
                        
                        terrain_geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
                    }
    
    
    
                state.scene.add(terrain);
    
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


/////////////////////////
// Create Player Areas //
/////////////////////////

    // TODO: Move to Entity Manager
    addHemisphereLight = (position) =>
        {
            let light_x = position.x * square_size + config.square_offset - map_center.x;
            let light_y = position.y * square_size + config.square_offset - map_center.y;

            // TODO: Add Interpolation for day and night cycle
            let player_lighting = new THREE.HemisphereLight(config.night_top_color, config.night_bottom_color, 0.03); // This is the perfect night color
            player_lighting.name = "light";
            player_lighting.groundColor.setHSL(0.25, .5, .7);
            state.scene.add(player_lighting);
            state.hemisphere_lights.push(player_lighting);

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