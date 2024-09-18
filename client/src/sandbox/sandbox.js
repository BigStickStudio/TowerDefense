import Stats from 'three/addons/libs/stats.module.js';
import loadModels from './loader/object_loader.js';
import Camera from '/src/engine/entities/player/camera.js';
import StateManager from '/src/engine/state_manager.js';
import World from '/src/sandbox/world/world.js';

const state = StateManager.instance;
let stats = new Stats();

const fps = 1/60;
let delta = 0;

export default class SandBox {
    constructor() 
        { 
            this.init(); 
            state.run_loop = this.update;
            state.camera = new Camera();
            state.run();
            loadModels();
        }
    
    init = () => 
        {
            this.world = new World();

            stats.dom.style.top = "";
            stats.dom.style.left = "";
            stats.dom.style.bottom = "0px";
            stats.dom.style.right = "0px";
            document.body.appendChild(stats.dom);
            
            window.addEventListener('resize', this.onWindowResize, false);
        }

    onWindowResize = () => 
        {
            state.camera.refresh();
            state.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    
    update = () => 
        {
            this.world.update();
            stats.update();
        }
}