import * as THREE from 'three';
import StateManager from '/src/engine/state_manager.js';

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
    uniform float sky_rotation;
    uniform float day_rotation;
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

        vec4 sky = textureCube(sky_texture, normalize(skyPosition));
        vec4 day = textureCube(day_texture, normalize(dayPosition));
        gl_FragColor = mix(sky, day, 0.5);
    }
`

export default class Sky {
    sky = undefined;

    constructor() {
            const day_loader = new THREE.CubeTextureLoader();
            const sky_loader = new THREE.CubeTextureLoader();

            const sky_texture = sky_loader.load([
                '/assets/textures/sky/SkyRight.png',
                '/assets/textures/sky/SkyLeft.png',
                '/assets/textures/sky/SkyTop.png',
                '/assets/textures/sky/SkyBottom.png',
                '/assets/textures/sky/SkyFront.png',
                '/assets/textures/sky/SkyBack.png',
            ]);

            const day_texture = day_loader.load([
                '/assets/textures/sky/DayRight.png',
                '/assets/textures/sky/DayLeft.png',
                '/assets/textures/sky/DayTop.png',
                '/assets/textures/sky/DayBottom.png',
                '/assets/textures/sky/DayFront.png',
                '/assets/textures/sky/DayBack.png',
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
                        day_rotation: { type: 'f', value: 0 },
                        sky_rotation: { type: 'f', value: 0 },
                        sky_texture: {value: sky_texture },
                        day_texture: {value: day_texture },
                    },
                    vertexShader: vertex_shader,
                    fragmentShader: fragment_shader,
                    side: THREE.BackSide,

                })
            );
            this.sky.name = "sky";
            state.scene.add(this.sky);
        }

    update = () => 
        {
            let day_value = this.sky.material.uniforms.day_rotation.value;
            this.sky.material.uniforms.day_rotation.value = (day_value - 0.00003) % (2 * Math.PI);

            let sky_value = this.sky.material.uniforms.sky_rotation.value;
            this.sky.material.uniforms.sky_rotation.value = (sky_value + 0.00002) % (2 * Math.PI);
        }
}