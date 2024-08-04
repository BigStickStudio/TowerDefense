import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import config from './config.js';

class World {
    constructor() {
        this.init();
    }

    init = () => {
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setClearColor(0x000000);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this._renderer.domElement);

        window.addEventListener('resize', this.onWindowResize, false);

        this._camera = new THREE.PerspectiveCamera(config.fov, config.aspect, config.near, config.far);
        this._scene = new THREE.Scene();
        const controls = new OrbitControls(this._camera, this._renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        this._camera.position.set(0, 0, 5);
        this._camera.lookAt(0, 0, 0);

        this._scene.add(new THREE.AmbientLight(0x404040));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1).normalize();
        this._scene.add(light);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this._cube = new THREE.Mesh(geometry, material);
        this._scene.add(this._cube);

        this.requestFrame()
    }

    onWindowResize = () => {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render = () => {
        this._cube.rotation.x += 0.01;
        this._cube.rotation.y += 0.01;
        this._renderer.render(this._scene, this._camera);
        this.requestFrame();
    }

    requestFrame = () => {
        requestAnimationFrame(this.render);
    }
}

let world = null;

window.addEventListener('DOMContentLoaded', () => {
    world = new World();
});