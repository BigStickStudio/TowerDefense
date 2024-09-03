import * as THREE from 'three';

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
    prev_night_value = 0;
    prev_day_value = 0;

    constructor(scene) {
        const day_loader = new THREE.CubeTextureLoader();
        const sky_loader = new THREE.CubeTextureLoader();
        const night_loader = new THREE.CubeTextureLoader();

        const sky_texture = sky_loader.load([
            '../assets/SkyCenterRight.png',
            '../assets/SkyLeft.png',
            '../assets/SkyTop.png',
            '../assets/SkyBottom.png',
            '../assets/SkyCenter.png',
            '../assets/SkyRight.png',
        ]);

        const day_texture = day_loader.load([
            '../assets/DayCenterRight.png',
            '../assets/DayLeft.png',
            '../assets/DayTop.png',
            '../assets/DayBottom.png',
            '../assets/DayCenter.png',
            '../assets/DayRight.png',
        ]);

        const night_texture = night_loader.load([
            '../assets/StarCenterRight.png',
            '../assets/StarLeft.png',
            '../assets/StarTop.png',
            '../assets/StarBottom.png',
            '../assets/StarCenter.png',
            '../assets/StarRight.png',
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
}