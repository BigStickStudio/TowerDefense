import Map from "./map.js";
import Sky from "./sky.js";
import State from "/src/engine/state_manager.js";

const state = State.instance;

export default class World extends Map {
    constructor() { 
        super();
        this.init(); 
    }

    init = () => 
        {
            this.sky = new Sky();
        }

    t_wait = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

    step = () => 
        {
            const elapsed = state.clock.getDelta() * 0.2;

            state.camera.update(state.camera.free_target, elapsed); 
            
            // This doesn't work as expected
            // if (this.t_wait(1000))
            //     { state.camera.getIntersection(this.objects); }
        }

    update = () => 
        {
            this.sky.update();
            this.step();
        }
}