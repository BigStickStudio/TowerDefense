import StateManager from './engine/state_manager.js';
import UI from './engine/ui.js';
import World from './world/world.js';

const state = StateManager.instance;

export default class Game {
    constructor() { 
        this.init(); 
        this.requestFrame();
    }

    init = () => 
        {
            this.ui = new UI(this.enableListeners, this.disableListeners);
            window.addEventListener('resize', this.onWindowResize, false);
            this.world = new World();
            this.enableCamera = this.world.camera.enable;
            this.disableCamera = this.world.camera.disable;
        }

    // These have to exist in order to be passed to the UI before the World exists
    enableListeners = () => { this.enableCamera(); }
    disableListeners = () => { this.disableCamera(); }

    onWindowResize = () => 
        {
            this.world.camera.refresh();
            state.renderer.setSize(window.innerWidth, window.innerHeight);
        }

    requestFrame = () => { requestAnimationFrame(this.render); }

    // TODO: This should be moved to the engine and called as a run() with a closure
    render = (t) => 
        {
            this.requestFrame();
            state.renderer.render(state.scene, this.world.camera.instance);
            this.world.update();
        }
}
