import * as THREE from 'three';
import StateManager from '../engine/state_manager.js';

const state = StateManager.instance;
const unwrap = (t) => { return t ? t : 'none'; }
const clamp = (v) => { return v < 0 ? 0 : v > 255 ? 255 : v; }

const vertex_shader = `
    varying vec3 vPosition;

    void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const fragment_shader = `
    uniform samplerCube sky_texture;
    uniform samplerCube day_texture;
    uniform samplerCube night_texture;
    uniform float sky_rotation;
    uniform float day_rotation;
    uniform float star_rotation;
    uniform float night_fade;
    uniform float day_fade;
    varying vec3 vPosition;

    vec3 rotatedPosition(float rotation) {
        return vec3(
            vPosition.x * cos(rotation) - vPosition.z * sin(rotation),
            vPosition.y,
            vPosition.x * sin(rotation) + vPosition.z * cos(rotation)
        );
    }

    void main() {
        vec3 skyPosition = rotatedPosition(sky_rotation);
        vec3 dayPosition = rotatedPosition(day_rotation);
        vec3 starPosition = rotatedPosition(star_rotation);

        vec4 sky = textureCube(sky_texture, normalize(skyPosition));
        vec4 day = textureCube(day_texture, normalize(dayPosition));
        vec4 night = textureCube(night_texture, normalize(starPosition));
        gl_FragColor = mix(mix(night, sky, night_fade), day, day_fade);
    }
`

export default class Skybox {
    skybox = undefined;
    noon = false;
    morning = true;
    prev_night_value = 0;
    prev_day_value = 0;

    constructor(scene) {
        const day_loader = new THREE.CubeTextureLoader();
        const sky_loader = new THREE.CubeTextureLoader();
        const night_loader = new THREE.CubeTextureLoader();

        const sky_texture = sky_loader.load([
            'assets/textures/skybox/SkyRight.png',
            'assets/textures/skybox/SkyLeft.png',
            'assets/textures/skybox/SkyTop.png',
            'assets/textures/skybox/SkyBottom.png',
            'assets/textures/skybox/SkyFront.png',
            'assets/textures/skybox/SkyBack.png',
        ]);

        const day_texture = day_loader.load([
            'assets/textures/skybox/DayRight.png',
            'assets/textures/skybox/DayLeft.png',
            'assets/textures/skybox/DayTop.png',
            'assets/textures/skybox/DayBottom.png',
            'assets/textures/skybox/DayFront.png',
            'assets/textures/skybox/DayBack.png',
        ]);

        const night_texture = night_loader.load([
            'assets/textures/skybox/StarRight.png',
            'assets/textures/skybox/StarLeft.png',
            'assets/textures/skybox/StarTop.png',
            'assets/textures/skybox/StarBottom.png',
            'assets/textures/skybox/StarFront.png',
            'assets/textures/skybox/StarBack.png',
        ]);

        this.skybox = new THREE.Mesh(
            new THREE.BoxGeometry(2000, 2000, 2000), 
            new THREE.ShaderMaterial({
                uniforms: {
                    day_fade: { type: 'f', value: 0 },
                    night_fade: { type: 'f', value: 0 },
                    star_rotation: { type: 'f', value: 0 },
                    day_rotation: { type: 'f', value: 0 },
                    sky_rotation: { type: 'f', value: 0 },
                    sky_texture: {value: sky_texture },
                    day_texture: {value: day_texture },
                    night_texture: {value: night_texture }
                },
                vertexShader: vertex_shader,
                fragmentShader: fragment_shader,
                side: THREE.BackSide,

            })
        );

        scene.add(this.skybox);
    }

    fade = (night_value, day_value) =>
        { 
            if (this.prev_night_value !== night_value)
                {
                    this.prev_night_value = night_value;
                    this.skybox.material.uniforms.night_fade.value = night_value;
                }
            if (this.prev_day_value !== day_value)
                {
                    this.prev_day_value = day_value;
                    this.skybox.material.uniforms.day_fade.value = day_value; 
                }
        }

    rotate = () => {
        let star_value = this.skybox.material.uniforms.star_rotation.value;
        this.skybox.material.uniforms.star_rotation.value = (star_value + 0.00001) % (2 * Math.PI);

        let day_value = this.skybox.material.uniforms.day_rotation.value;
        this.skybox.material.uniforms.day_rotation.value = (day_value - 0.00003) % (2 * Math.PI);

        let sky_value = this.skybox.material.uniforms.sky_rotation.value;
        this.skybox.material.uniforms.sky_rotation.value = (sky_value + 0.00002) % (2 * Math.PI);
    }

    update = (elapsed) => 
        {
            let night_cycle = state.get("night_cycle");
            let day_cycle = state.get("day_cycle");

            let night_elapsed = elapsed * 30;
            let day_elapsed = elapsed * 10;

            if (this.morning)
                { 
                    // We only want to incriment the night cycle until we reach the peak
                    if (!this.noon)
                        {
                            night_cycle = night_cycle + night_elapsed;
                            this.noon = (night_cycle >= 255);
                        }

                    day_cycle = day_cycle + day_elapsed;
                    this.morning = (day_cycle <= 255);
                }
            else 
                {
                    day_cycle = day_cycle - day_elapsed;

                    // Noon Ends when the day cycle is a third over
                    this.noon = this.noon ? (day_cycle >= 170) : true;

                    if (!this.noon)
                        { night_cycle = night_cycle - night_elapsed; }

                    this.morning = (night_cycle <= 0);
                }

            state.set("night_cycle", night_cycle);
            state.set("day_cycle", day_cycle);
        }

    get night_cycle()
        { 
            let sky_cycle = state.get("night_cycle");
            return (clamp(sky_cycle) / 255).toFixed(3);
        }

    get day_cycle()
        { 
            let sky_cycle = state.get("day_cycle");
            return (clamp(sky_cycle) / 255).toFixed(3);; 
        }

}