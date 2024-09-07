import * as THREE from 'three';
import StateManager from './engine/state_manager.js';
import UI from './engine/ui.js';
import Character from './entities/character/character.js';
import Camera from './entities/player/camera.js';
import Map from './world/map.js';
import Sky from './world/sky.js';

const state = StateManager.instance;

export default class Game {
    constructor() { 
        this.init(); 
        this.requestFrame();
    }

    init = () => 
        {
            // If this isn't first following classes will throw an error
            this.ui = new UI(this.enableListeners, this.disableListeners);
            state.updateUI = this.ui.updateUI; 
            this.map = new Map();
            this.sky = new Sky();
            this.initAmbientLight();
            this.character = new Character(); // Create as Entity
            this.camera = new Camera();
            this.configureListeners();
            window.addEventListener('resize', this.onWindowResize, false);
        }

    onWindowResize = () => 
        {
            this.camera.refresh();
            state.renderer.setSize(window.innerWidth, window.innerHeight);
        }

// This function has to be called at the end of the Game Initialization
    // as the Camera is a part of the Engine, but the Map is part of the Game
    configureListeners = () => 
        {
            this.enableCamera = this.camera.enable;
            this.disableCamera = this.camera.disable;
            this.enableMapCursor = this.map.enable;
            this.disableMapCursor = this.map.disable;
        }

    enableListeners = () => 
        {
            this.enableCamera();
            this.enableMapCursor();
        }

    disableListeners = () => 
        {
            this.disableCamera();
            this.disableMapCursor();
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
        state.scene.add(light);
    }

    step = () => 
        {
            const elapsed = state.clock.getDelta() * 0.2;

            if (state.fixed_camera) 
                {
                    //console.log(this.character.target);
                    this.character?.update(elapsed);
                    this.camera.updateFreeCamera(this.character.target);
                    this.camera.update(this.character.target, elapsed);
                }
            else 
                { this.camera.update(this.camera.free_target, elapsed); }
                
            this.sky.update(elapsed);
        }

    requestFrame = () => { requestAnimationFrame(this.render); }

    // TODO: This should be moved to the engine and called as a run() with a closure
    render = (t) => 
        {
            this.sky.fade(state.night_cycle, state.day_cycle);
            this.sky.rotate();
            this.requestFrame();
            state.renderer.render(state.scene, this.camera.instance);
            this.map.getIntersection(this.camera.instance, state.scene.children);
            this.step();
        }
}
