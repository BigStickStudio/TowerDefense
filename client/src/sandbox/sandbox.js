import Stats from 'three/addons/libs/stats.module.js';
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
            state.run();
            // loadModels();
        }
    
    init = () => 
        {
            this.initStats();
            state.camera = new Camera();
            this.world = new World();

            this.world.cameraTracker(state.camera.instance.position);
            
            
            window.addEventListener('resize', this.onWindowResize, false);
        }

    initStats = () =>
        {
            stats.dom.style.top = "";
            stats.dom.style.left = "";
            stats.dom.style.bottom = "0px";
            stats.dom.style.right = "0px";
            document.body.appendChild(stats.dom);
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
            this.world.cameraTracker(state.camera.instance.position);
        }
}