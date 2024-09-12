import * as THREE from 'three';
import config from '/src/configs/map_config.js';
import StateManager from '/src/engine/state_manager.js';

const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D top1_texture;
    uniform sampler2D top1_bump;
    uniform sampler2D top1_normal;
    uniform sampler2D top2_texture;
    uniform sampler2D top2_bump;
    uniform sampler2D top2_normal;
    uniform float top_bounds;
    uniform vec3 top_scale;

    uniform sampler2D middle1_texture;
    uniform sampler2D middle1_bump;
    uniform sampler2D middle1_normal;
    uniform sampler2D middle2_texture;
    uniform sampler2D middle2_bump;
    uniform sampler2D middle2_normal;
    uniform float middle_bounds;
    uniform vec3 middle_scale;

    uniform sampler2D lower1_texture;
    uniform sampler2D lower1_bump;
    uniform sampler2D lower1_normal;
    uniform sampler2D lower2_texture;
    uniform sampler2D lower2_bump;
    uniform sampler2D lower2_normal;
    uniform float lower_bounds;
    uniform vec3 lower_scale;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    uniform sampler2D top_noise_map1;
    uniform sampler2D top_noise_map2;
    uniform sampler2D middle_noise_map1;
    uniform sampler2D middle_noise_map2;
    uniform sampler2D bottom_noise_map;
    uniform sampler2D uv_noise;
    uniform vec2 uv_offset;
    uniform vec2 uv_scale;

    vec3 applyBumpMap(sampler2D bumpMap, vec3 normal, vec2 uv) {
        vec3 bumpNormal = texture2D(bumpMap, uv).rgb * 2.0 - 1.0; // Convert to [-1, 1]
        return normalize(normal + bumpNormal);
    }

    vec2 getTileOffset(vec2 tile) {
        vec3 offset = texture2D(uv_noise, tile).rgb;
        return vec2(offset.xy) * uv_scale + uv_offset;
    }

    vec4 textureUV(sampler2D tex, vec2 uv) {
        float k = texture2D(tex, 0.0025 * uv).r;
        float l = k * 8.0;
        float f = fract(l);

        float ia = floor(l+0.5); // kudos suslik
        float ib = floor(l);
        f = min(f, 1.0 - f) * 2.0;

        vec2 offset_a = sin(vec2(3.0, 7.0) * ia);
        vec2 offset_b = sin(vec2(3.0, 7.0) * ib);

        vec4 color_a = texture2D(tex, uv.xy + offset_a);
        vec4 color_b = texture2D(tex, uv.xy + offset_b);

        return mix(color_a, color_b, smoothstep(0.2, 0.8, f - 0.1 * (color_a.x + color_a.y + color_a.z - color_b.x - color_b.y - color_b.z)));
    }

    vec4 triplanar(vec3 normal, vec3 objectPosition, sampler2D tex, vec3 scale) {
        vec3 n = normalize(normal);
        vec3 nabs = abs(n);

        vec2 texCoordX = objectPosition.yz;
        vec2 texCoordY = objectPosition.xz;
        vec2 texCoordZ = objectPosition.xy;

        vec3 blendWeights = normalize(nabs);
        blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

        vec4 texX = textureUV(tex, texCoordX * scale.xy);
        vec4 texY = textureUV(tex, texCoordY * scale.yz);
        vec4 texZ = textureUV(tex, texCoordZ * scale.xz);

        return texX * blendWeights.x + texY * blendWeights.y + texZ * blendWeights.z;
    }

    vec3 textureUVNormal(sampler2D tex, vec2 uv) {
        float k = texture2D(tex, 0.0025 * uv).r;
        float l = k * 8.0;
        float f = fract(l);

        float ia = floor(l+0.5); // kudos suslik
        float ib = floor(l);
        f = min(f, 1.0 - f) * 2.0;

        vec2 offset_a = sin(vec2(5.0, 9.0) * ia);
        vec2 offset_b = sin(vec2(3.0, 7.0) * ib);

        vec3 color_a = texture2D(tex, uv.xy + offset_a).rgb;
        vec3 color_b = texture2D(tex, uv.xy + offset_b).rgb;

        return mix(color_a, color_b, smoothstep(0.2, 0.8, f - 0.1 * (color_a.x + color_a.y + color_a.z - color_b.x - color_b.y - color_b.z)));
    }

    vec3 triplanarNormal(vec3 normal, vec3 objectPosition, sampler2D normalMap, vec3 scale) {
        vec3 n = normalize(normal);
        vec3 nabs = abs(n);

        vec2 texCoordX = objectPosition.yz;
        vec2 texCoordY = objectPosition.xz;
        vec2 texCoordZ = objectPosition.xy;

        vec3 blendWeights = normalize(nabs);
        blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

        vec3 xNormal = textureUVNormal(normalMap, texCoordX * scale.xy);
        vec3 yNormal = textureUVNormal(normalMap, texCoordY * scale.yz);
        vec3 zNormal = textureUVNormal(normalMap, texCoordZ * scale.xz);

        vec3 bumpNormal = xNormal * blendWeights.x + yNormal * blendWeights.y + zNormal * blendWeights.z;
        return bumpNormal;
    }

    float noiseColor(sampler2D noiseMap, vec2 uv, vec2 coords, vec2 base) {
        vec4 colorA = texture2D(noiseMap, uv);
        vec4 colorB = texture2D(noiseMap, coords);
        vec4 noiseColor = mix(colorA, colorB, base.r);
        return dot(noiseColor.rgb, vec3(0.299, 0.587, 0.114));
    }

    vec4 colorMixer(sampler2D tex1, sampler2D tex2, float noise1, vec3 scale) {
        vec4 color1 = triplanar(vWorldNormal, vWorldPosition, tex1, scale);
        vec4 color2 = triplanar(vWorldNormal, vWorldPosition, tex2, scale);
        return mix(color1, color2, noise1);
    }

    vec4 colorDoubleMixer(sampler2D tex1, sampler2D tex2, float noise1, float noise2, vec3 scale) {
        vec4 color1 = triplanar(vWorldNormal, vWorldPosition, tex1, scale);
        vec4 color2 = triplanar(vWorldNormal, vWorldPosition, tex2, scale);
        return mix(mix(color1, color2, noise1), color1, noise2);
    }

    vec3 normalMixer(sampler2D normal1, sampler2D normal2, float noise1, vec3 scale) {
        vec3 norm1 = triplanarNormal(vWorldNormal, vWorldPosition, normal1, scale);
        vec3 norm2 = triplanarNormal(vWorldNormal, vWorldPosition, normal2, scale);
        return mix(norm1, norm2, noise1);
    }

    vec3 normalDoubleMixer(sampler2D normal1, sampler2D normal2, float noise1, float noise2, vec3 scale) {
        vec3 norm1 = triplanarNormal(vWorldNormal, vWorldPosition, normal1, scale);
        vec3 norm2 = triplanarNormal(vWorldNormal, vWorldPosition, normal2, scale);
        return mix(mix(norm1, norm2, noise1), norm1, noise2);
    }

    void main() {
        // blend top textures using noise map
        vec2 tiledUv = vUv * uv_scale;
        vec2 tileCoords = fract(tiledUv);
        vec2 baseTile = tiledUv - floor(tileCoords);
        vec2 tileOffset1 = getTileOffset(baseTile);
        vec2 tileOffset2 = getTileOffset(baseTile + vec2(1.0, 0.0));
        vec2 uv1 = tileCoords + tileOffset1;
        vec2 uv2 = tileCoords + tileOffset2;

        float top_noise1 = noiseColor(top_noise_map1, uv1, tileCoords, baseTile);
        float top_noise2 = noiseColor(top_noise_map2, uv2, tileCoords, baseTile);

        vec4 color1 = colorDoubleMixer(top1_texture, top2_texture, top_noise2, top_noise1, top_scale);
        vec3 normal1 = normalDoubleMixer(top1_normal, top2_normal, top_noise2, top_noise1, top_scale);

        float middle_noise1 = noiseColor(middle_noise_map1, uv1, tileCoords, baseTile);
        float middle_noise2 = noiseColor(middle_noise_map2, uv2, tileCoords, baseTile);

        vec4 color2 = colorDoubleMixer(middle1_texture, middle2_texture, middle_noise1, middle_noise2, middle_scale);
        vec3 normal2 = normalDoubleMixer(middle1_normal, middle2_normal, middle_noise1, middle_noise2, middle_scale);

        float lower_noise = noiseColor(bottom_noise_map, uv1, tileCoords, baseTile);

        vec3 normal3 = normalMixer(lower1_normal, lower2_normal, lower_noise, lower_scale);
        vec4 color3 = colorMixer(lower1_texture, lower2_texture, lower_noise, lower_scale);

        vec4 finalColor;
        vec3 finalNormal;

        float mid_top = top_bounds - middle_bounds;
        float mid_low = lower_bounds + middle_bounds;

        if (vWorldPosition.y <= lower_bounds) {
            finalColor = color3;
            finalNormal = normal3;    
        } else if (vWorldPosition.y > lower_bounds && vWorldPosition.y <= mid_low) {
            finalColor = mix(color3, color2, smoothstep(lower_bounds, mid_low, vWorldPosition.y));
            finalNormal = mix(normal3, normal2, smoothstep(lower_bounds, mid_low, vWorldPosition.y));
        } else if (vWorldPosition.y > mid_low && vWorldPosition.y <= mid_top) {
            finalColor = color2;
            finalNormal = normal2;
        } else if (vWorldPosition.y > mid_top && vWorldPosition.y <= top_bounds) {
            finalColor = mix(color2, color1, smoothstep(mid_top, top_bounds, vWorldPosition.y));
            finalNormal = mix(normal2, normal1, smoothstep(mid_top, top_bounds, vWorldPosition.y));
        } else {
            finalColor = color1;
            finalNormal = normal1;    
        }

        gl_FragColor = finalColor;
    }
`;




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
    
                const textureLoader = (path, scale) => {
                    const texture = new THREE.TextureLoader().load(path);
                    texture.wrapS = THREE.MirroredRepeatWrapping;
                    texture.wrapT = THREE.MirroredRepeatWrapping;
                    texture.repeat.set((map_size.x / scale), (map_size.y / scale));
                    // rotate the texture by 90 degrees
                    texture.rotation = Math.PI / 2;
                    texture.magFilter = THREE.LinearFilter;
                    texture.minFilter = THREE.LinearMipMapLinearFilter;
                    return texture;
                } 
    
                // Top Texture Scales:
                    // Granite Scale 75
                    // Stone 
    
                let top_scale = 1;
                let middle_scale = 1;
                let bottom_scale = 1;
                let noise_scale = 100;

                // TODO: Major Refactor Here
                const top_a_diffuse = textureLoader('assets/textures/map/tops/grass/diffuse.jpg', top_scale);
                const top_a_normal_map = textureLoader('assets/textures/map/tops/grass/normal.jpg', top_scale);
                const top_a_bump_map = textureLoader('assets/textures/map/tops/grass/bump.jpg', top_scale);

                const top_b_diffuse = textureLoader('assets/textures/map/tops/flowers/diffuse.jpg', top_scale);
                const top_b_normal_map = textureLoader('assets/textures/map/tops/flowers/normal.jpg', top_scale);
                const top_b_bump_map = textureLoader('assets/textures/map/tops/flowers/bump.jpg', top_scale);

                const top_c_diffuse = textureLoader('assets/textures/map/tops/barren/diffuse.jpg', top_scale);
                const top_c_normal_map = textureLoader('assets/textures/map/tops/barren/normal.jpg', top_scale);
                const top_c_bump_map = textureLoader('assets/textures/map/tops/barren/bump.jpg', top_scale);

                let top_choices = [
                    { diffuse: top_a_diffuse, normal: top_a_normal_map, bump: top_a_bump_map },
                    { diffuse: top_b_diffuse, normal: top_b_normal_map, bump: top_b_bump_map },
                    { diffuse: top_c_diffuse, normal: top_c_normal_map, bump: top_c_bump_map }
                ]

                let top1 = top_choices[Math.floor(Math.random() * top_choices.length)];
                top_choices = top_choices.filter((choice) => choice !== top1);
                let top2 = top_choices[Math.floor(Math.random() * top_choices.length)];
            
                const middle_a_diffuse = textureLoader('assets/textures/map/walls/stone/diffuse.jpg', middle_scale);
                const middle_a_normal_map = textureLoader('assets/textures/map/walls/stone/normal.jpg', middle_scale);
                const middle_a_bump_map = textureLoader('assets/textures/map/walls/stone/bump.jpg', middle_scale);
    
                const middle_b_diffuse = textureLoader('assets/textures/map/walls/lavarock/diffuse.jpg', middle_scale);
                const middle_b_normal_map = textureLoader('assets/textures/map/walls/lavarock/normal.jpg', middle_scale);
                const middle_b_bump_map = textureLoader('assets/textures/map/walls/lavarock/bump.jpg', middle_scale);

                const middle_c_diffuse = textureLoader('assets/textures/map/walls/granite/diffuse.jpg', middle_scale);
                const middle_c_normal_map = textureLoader('assets/textures/map/walls/granite/normal.jpg', middle_scale);
                const middle_c_bump_map = textureLoader('assets/textures/map/walls/granite/bump.jpg', middle_scale);

                const middle_d_diffuse = textureLoader('assets/textures/map/walls/rocks/diffuse.jpg', middle_scale);
                const middle_d_normal_map = textureLoader('assets/textures/map/walls/rocks/normal.jpg', middle_scale);
                const middle_d_bump_map = textureLoader('assets/textures/map/walls/rocks/bump.jpg', middle_scale);

                let middle_choices = [
                    { diffuse: middle_a_diffuse, normal: middle_a_normal_map, bump: middle_a_bump_map },
                    { diffuse: middle_b_diffuse, normal: middle_b_normal_map, bump: middle_b_bump_map },
                    { diffuse: middle_c_diffuse, normal: middle_c_normal_map, bump: middle_c_bump_map },
                    { diffuse: middle_d_diffuse, normal: middle_d_normal_map, bump: middle_d_bump_map }
                ]

                let middle1 = middle_choices[Math.floor(Math.random() * middle_choices.length)];
                middle_choices = middle_choices.filter((choice) => choice !== middle1);
                let middle2 = middle_choices[Math.floor(Math.random() * middle_choices.length)];

                const bottom1_diffuse = textureLoader('assets/textures/map/floors/gravel2/diffuse.jpg', bottom_scale);
                const bottom1_normal_map = textureLoader('assets/textures/map/floors/gravel2/normal.jpg', bottom_scale);
                const bottom1_bump_map = textureLoader('assets/textures/map/floors/gravel2/bump.jpg', bottom_scale);
    
                const bottom2_diffuse = textureLoader('assets/textures/map/floors/gravel2/diffuse.jpg', bottom_scale);
                const bottom2_normal_map = textureLoader('assets/textures/map/floors/gravel2/normal.jpg', bottom_scale);
                const bottom2_bump_map = textureLoader('assets/textures/map/floors/gravel2/bump.jpg', bottom_scale);

                const top_noise1 = textureLoader('assets/textures/noise/turbulence/turbulence1.png', noise_scale);
                const top_noise2 = textureLoader('assets/textures/noise/milky/milky1.png', noise_scale);
                const middle_noise1 = textureLoader('assets/textures/noise/marble/marble1.png', noise_scale);
                const middle_noise2 = textureLoader('assets/textures/noise/melt/melt1.png', noise_scale);
                const bottom_noise = textureLoader('assets/textures/noise/manifold/manifold1.png', noise_scale);
                const uv_noise = textureLoader('assets/textures/noise/grainy/grainy1.png', noise_scale);

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
                let random_scale = Math.random() * 0.2 + 0.2;
                state.uv_scale = new THREE.Vector2(random_scale, random_scale);

                // random number betwee 0.2 and 0.4
                let random_offset = Math.random() * 0.3 + 0.2;
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
                        top_bounds: { value: 19 },
                        middle1_texture: { value: middle1.diffuse },
                        middle1_normal: { value: middle1.normal },
                        middle1_bump: { value: middle1.bump },
                        middle2_texture: { value: middle2.diffuse },
                        middle2_normal: { value: middle2.normal },
                        middle2_bump: { value: middle2.bump },
                        middle_bounds: { value: 6 },
                        lower1_texture: { value: bottom1_diffuse },
                        lower1_normal: { value: bottom1_normal_map },
                        lower1_bump: { value: bottom1_bump_map },
                        lower2_texture: { value: bottom2_diffuse },
                        lower2_normal: { value: bottom2_normal_map },
                        lower2_bump: { value: bottom2_bump_map },
                        lower_bounds: { value: -3 },
                        top_scale: { value: new THREE.Vector3(0.04, 0.04, 0.04) },
                        // top_scale: { value: new THREE.Vector3(1, 1, 1) },
                        middle_scale: { value: new THREE.Vector3(0.039, 0.057, 0.041) },
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