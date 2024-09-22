import Stats from 'three/addons/libs/stats.module.js';
import Camera from '/src/engine/entities/player/camera.js';
import StateManager from '/src/engine/state_manager.js';
import World from '/src/sandbox/world/world.js';

const state = StateManager.instance;
let fps = new Stats();
let cpu = new Stats();

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
            fps.dom.style.top = "";
            fps.dom.style.left = "";
            fps.dom.style.bottom = "0px";
            fps.dom.style.right = "0px";
            document.body.appendChild(fps.dom);

            cpu.showPanel(1);
            cpu.dom.style.top = "";
            cpu.dom.style.left = "";
            cpu.dom.style.bottom = "50px";
            cpu.dom.style.right = "0px";
            document.body.appendChild(cpu.dom);
        }

    onWindowResize = () => 
        {
            state.camera.refresh();
            state.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    
    update = () => 
        {
            this.world.update();
            fps.update();
            cpu.update();
            this.world.cameraTracker(state.camera.instance.position);
        }
}