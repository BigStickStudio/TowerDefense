import * as THREE from 'three';
import Character from './entities/character/character.js';
import * as World from './world/index.js';

const state_instance = World.Engine.instance;

export default class Game {
    constructor() { this.init(); }

    init = () => {
        this._mixers = []; // Move to EntityManager
        this._character = new Character(this._scene, this._renderer);

        window.addEventListener('resize', this.onWindowResize, false);
        
        this.initAmbientLight();
        this.skybox = new World.Skybox(this._scene);
        this.map = new World.Map(this._scene);
        this.map_listener = new World.MapInterface(this._scene);
    }

    get camera() {
        return this._character.camera.instance;
    }

    initAmbientLight = () => {
        const light = new THREE.DirectionalLight(0xffffff, 1); // TODO: Add Brightness
        light.position.set(1, 500, 1).normalize(); // TODO: Add Orbit
        light.castShadow = true;
        light.shadow.camera.top = 180;
        light.shadow.camera.bottom = -360;
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
