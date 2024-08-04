import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/FBXLoader.js';
import config from './config.js';
import { CharacterControls } from './character.js';

export default class World {
    constructor() { this.init(); }

    init = () => {
        this._mixers = [];
        this.initRenderer();
        this.clock = new THREE.Clock();
        document.body.appendChild(this._renderer.domElement);
        window.addEventListener('resize', this.onWindowResize, false);
        this.initCamera();
        this.initAmbientLight();
        this.initPlane();
        this.loadModel();
        this.initObjects();
    
    }

    initRenderer = () => {
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setClearColor(0x000000);
        this._renderer.gammaFactor = 2.2;
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    initCamera = () => {
        this._camera = new THREE.PerspectiveCamera(config.fov, window.innerWidth / window.innerHeight, config.near, config.far);
        this._scene = new THREE.Scene();
        const controls = new OrbitControls(this._camera, this._renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        this._camera.position.set(0, 20, -10);
        this._camera.lookAt(0, 9, 20);
    }

    initAmbientLight = () => {
        this._scene.add(new THREE.AmbientLight(0x404040));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 100, 1).normalize();
        light.castShadow = true;
        light.shadow.camera.top = 180;
        light.shadow.camera.bottom = -100;
        light.shadow.camera.left = -120;
        light.shadow.camera.right = 120;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.far = 500;
        light.shadow.bias = -0.0001;
        this._scene.add(light);
    }

    initPlane = () => {
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0x0c852c })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.castShadow = false;
        plane.receiveShadow = true;
        this._scene.add(plane);
    }


    initObjects = () => {
        // This is just a placeholder to show that we have something in the scene
        const geometry = new THREE.BoxGeometry(5, 5, 5);
        const material = new THREE.MeshBasicMaterial({ color: 0x36ada9 });
        
        this._cubes = [];

        for (let i = 0; i < 10; i++) {
            let _cube = new THREE.Mesh(geometry, material);
            const rand_x = Math.random() * 100 - 50;
            const rand_z = Math.random() * 100 - 50;
            _cube.position.set(rand_x, 10, rand_z);
            _cube.castShadow = true;
            _cube.receiveShadow = true;
            this._cubes[i] = _cube;
            this._scene.add(_cube);
        }

    }

    onWindowResize = () => {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render = (t) => {

        for (let i = 0; i < this._cubes.length; i++) {
            this._cubes[i].rotation.x += 0.01;
            this._cubes[i].rotation.y += 0.01;
        }

        this.requestFrame();
        this._renderer.render(this._scene, this._camera);
        this.step();
    }

    requestFrame = () => {
        requestAnimationFrame(this.render);
    }

    step = () => {
        const elapsed = this.clock.getDelta() * 0.2;
        this._controls?.update(elapsed);
        this._mixers?.map(mixer => mixer.update(elapsed));
    }
}
