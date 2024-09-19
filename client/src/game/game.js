import Stats from 'three/addons/libs/stats.module.js';
import World from './world/world.js';
import Camera from '/src/engine/entities/player/camera.js';
import StateManager from '/src/engine/state_manager.js';
import UI from '/src/engine/ui.js';

const state = StateManager.instance;

const fps = 1/60;
let delta = 0;

export default class Game {
    constructor() { 
        this.init(); 
        state.run_loop = this.render;
        state.run();
    }

    init = () => 
        {
            this.world = new World();
            state.camera = new Camera();
            state.ui = new UI(state.enableListeners, state.disableListeners); 
            this.initStats();
            window.addEventListener('resize', this.onWindowResize, false);
        }

    initStats = () =>
        { 
            let stats = new Stats();
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

    render = () => 
        {
            this.world.update();
            stats.update();
        }
}
