import * as THREE from 'three';
import Character from './character.js';
import Map from './map.js';
import MapInterface from './map_controller.js';
import Skybox from './skybox.js';
import State from './state.js';

const state_instance = State.instance;

export default class World {
    constructor() { this.init(); }

    init = () => {
        this._mixers = [];
        this.initRenderer();
        this.clock = new THREE.Clock();
        this._scene = new THREE.Scene();
        this._character = new Character(this._scene);

        document.body.appendChild(this._renderer.domElement);
        window.addEventListener('resize', this.onWindowResize, false);
        
        this.initAmbientLight();
        this.skybox = new Skybox(this._scene);
        this.map = new Map(this._scene);
        this.map_listener = new MapInterface(this._scene);
    }

    get camera() {
        return this._character.camera.instance;
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

    initAmbientLight = () => {
        this._scene.add(new THREE.AmbientLight(0x404040));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 500, 1).normalize();
        light.castShadow = true;
        light.shadow.camera.top = 180;
        light.shadow.camera.bottom = -100;
        light.shadow.camera.left = -120;
        light.shadow.camera.right = 120;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.far = 500;
        light.shadow.bias = -0.0001;
        this._sun = light;
        this._scene.add(light);
    }

    onWindowResize = () => {
        this._character.refreshCamera();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render = (t) => {
        this.skybox.fade(state_instance.night_cycle, state_instance.day_cycle);
        this.skybox.rotate();
        this.requestFrame();
        this._renderer.render(this._scene, this.camera);
        this.step();
        this.map_listener.getIntersection(this.camera, this._scene.children);
    }

    requestFrame = () => { requestAnimationFrame(this.render); }

    step = () => {
        const elapsed = this.clock.getDelta() * 0.2;
        this._character?.update(elapsed);
        state_instance.updateSkyCycle(elapsed);
    }
}
