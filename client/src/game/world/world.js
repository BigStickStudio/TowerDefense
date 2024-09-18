import * as THREE from 'three';
import Map from './map.js';
import Sky from './sky.js';
import Character from '/src/engine/entities/character/character.js';
import StateManager from '/src/engine/state_manager.js';

const state = StateManager.instance;
const filtered_items = ["terrain", "cursor", "light", "sky", "camera_target", "pathways", "red_base", "blue_base"];

// Cleanest Utility Class in the Game - Do not make a mess here please
export default class World extends Map {
    constructor() 
        { 
            super(); 
            this.sky = new Sky();
            this.character = new Character("/assets/models/troops/warriors/chunky_knight.glb", new THREE.Vector3(0, 0, 0)); // Create as Entity - TODO: Add 'Worker'
            this.objects = state.scene.children.filter((child) => !filtered_items.includes(child.name));
        }

    t_wait = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

    step = () => 
        {
            const elapsed = state.clock.getDelta() * 0.2;

            if (state.fixed_camera) 
                {
                    //console.log(this.character.target);
                    this.character?.update(elapsed);
                    state.camera.updateFreeCamera(this.character.target);
                    state.camera.update(this.character.target, elapsed);
                }
            else 
                { state.camera.update(state.camera.free_target, elapsed); }
            
            // This doesn't work as expected
            if (this.t_wait(1000))
                { state.camera.getIntersection(this.objects); }
            
            this.sky.update(elapsed);
        }

    update = () => 
        {
            this.step();
            this.sky.rotate();
            this.sky.fade(state.night_cycle, state.day_cycle); // TODO: Can we move these to the sky
            this.updateLighting();
        }
}