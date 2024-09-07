import * as THREE from 'three';
import StateManager from '../engine/state_manager.js';

const state = StateManager.instance;

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

export default class Sky {
    sky = undefined;
    noon = false;
    morning = true;
    prev_night_value = 0;
    prev_day_value = 0;

    constructor() {
        const day_loader = new THREE.CubeTextureLoader();
        const sky_loader = new THREE.CubeTextureLoader();
        const night_loader = new THREE.CubeTextureLoader();

        const sky_texture = sky_loader.load([
            'assets/textures/sky/SkyRight.png',
            'assets/textures/sky/SkyLeft.png',
            'assets/textures/sky/SkyTop.png',
            'assets/textures/sky/SkyBottom.png',
            'assets/textures/sky/SkyFront.png',
            'assets/textures/sky/SkyBack.png',
        ]);

        const day_texture = day_loader.load([
            'assets/textures/sky/DayRight.png',
            'assets/textures/sky/DayLeft.png',
            'assets/textures/sky/DayTop.png',
            'assets/textures/sky/DayBottom.png',
            'assets/textures/sky/DayFront.png',
            'assets/textures/sky/DayBack.png',
        ]);

        const night_texture = night_loader.load([
            'assets/textures/sky/StarRight.png',
            'assets/textures/sky/StarLeft.png',
            'assets/textures/sky/StarTop.png',
            'assets/textures/sky/StarBottom.png',
            'assets/textures/sky/StarFront.png',
            'assets/textures/sky/StarBack.png',
        ]);

        let sky_net = new THREE.BoxGeometry(2000, 2000, 2000, 5, 5 ,5);
        let v = new THREE.Vector3();

        for (let i = 0; i < sky_net.attributes.position.count; i++)
            {
                v.fromBufferAttribute(sky_net.attributes.position, i);
                v.normalize().multiplyScalar(3000);
                sky_net.attributes.position.setXYZ(i, v.x, v.y, v.z);
            }
        sky_net.computeVertexNormals();

        this.sky = new THREE.Mesh(
            sky_net,
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

        state.scene.add(this.sky);
    }

    fade = () =>
        { 
            let night_value = state.normalized_night_cycle;
            let day_value = state.normalized_day_cycle;

            if (this.prev_night_value !== night_value)
                {
                    this.prev_night_value = night_value;
                    this.sky.material.uniforms.night_fade.value = night_value;
                }
            if (this.prev_day_value !== day_value)
                {
                    this.prev_day_value = day_value;
                    this.sky.material.uniforms.day_fade.value = day_value; 
                }
        }

    rotate = () => {
        let star_value = this.sky.material.uniforms.star_rotation.value;
        this.sky.material.uniforms.star_rotation.value = (star_value + 0.00001) % (2 * Math.PI);

        let day_value = this.sky.material.uniforms.day_rotation.value;
        this.sky.material.uniforms.day_rotation.value = (day_value - 0.00003) % (2 * Math.PI);

        let sky_value = this.sky.material.uniforms.sky_rotation.value;
        this.sky.material.uniforms.sky_rotation.value = (sky_value + 0.00002) % (2 * Math.PI);
    }

    update = (elapsed) => 
        {
            let night_cycle = state.night_cycle;
            let day_cycle = state.day_cycle;
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

            state.night_cycle = night_cycle;
            state.day_cycle = day_cycle;
        }
}