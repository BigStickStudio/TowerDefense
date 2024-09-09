import Character from './entities/character/character.js';
import Camera from './entities/player/camera.js';
import Map from './map.js';
import Sky from './sky.js';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;
const filtered_items = ["terrain", "cursor", "light", "sky", "camera_target", "pathways"];

// Cleanest Utility Class in the Game - Do not make a mess here please
export default class World extends Map {
    constructor() 
        { 
            super(); 
            this.sky = new Sky();
            this.character = new Character(); // Create as Entity
            this.camera = new Camera();
            this.objects = state.scene.children.filter((child) => !filtered_items.includes(child.name));
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

    update = () => 
        {
            this.step();
            this.sky.rotate();
            this.sky.fade(state.night_cycle, state.day_cycle);
            this.updateLighting();
            if (!state.fixed_camera)
                { this.camera.getIntersection(this.objects); }
        }
}