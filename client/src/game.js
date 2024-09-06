import * as THREE from 'three';
import Engine from './engine/engine.js';
import StateManager from './engine/state_manager.js';
import Character from './entities/character/character.js';
import Map from './world/map.js';
import Sky from './world/sky.js';

const state = StateManager.instance;

export default class Game extends Engine {
    constructor() { 
        super();
        this.init(); 
        this.requestFrame();
    }

    init = () => {
        this.mixers = []; // Move to EntityManager
        this.character = new Character(this.scene, this.renderer); // Create as Entity

        window.addEventListener('resize', this.onWindowResize, false);
        
        this.initAmbientLight();
        this.sky = new Sky(this.scene);
        this.map = new Map(this.scene);
        this.configureListeners();
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
        this.sun = light;
        this.scene.add(light);
    }

    onWindowResize = () => {
        this.camera.refresh();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render = (t) => {
        this.sky.fade(state.night_cycle, state.day_cycle);
        this.sky.rotate();
        this.requestFrame();
        this.renderer.render(this.scene, this.camera.instance);
        this.step();
        this.map.getIntersection(this.camera.instance, this.scene.children);
    }

    requestFrame = () => { requestAnimationFrame(this.render); }

    step = () => {
        const elapsed = this.clock.getDelta() * 0.2;

        if (state.fixed_camera) 
            {
                this.character?.update(elapsed);
                this.camera.updateFreeCamera(this.character.target);
                this.camera.update(this.character.target, elapsed);
            }
        else 
            {
                state.keyboard.disable();
                if (!this.camera.moving)
                    { this.camera.update(null, elapsed); }
                else { console.log("Camera is moving"); }
            }
        this.sky.update(elapsed);
    }
}
