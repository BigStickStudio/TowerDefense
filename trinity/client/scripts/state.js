const local_state = {}

export default class State {
    static this_instance = null;
    redraw = undefined;    
    
    constructor() {}


    static get instance() {
        if (!State.this_instance) 
            { State.this_instance = new State(); }

        return State.this_instance;
    }

    set target(target) { 
        local_state["target"] = target; 
        this.redraw();
    }

    get target() { 
        const target = local_state["target"]; 
        return target ? `${target.x}, ${target.z}` : 'none';
    }

    set movingState(state) {
        local_state["movingState"] = state;
        this.redraw();
    }

    get movingState() { 
        const moving_state = local_state["movingState"];
        return moving_state ? moving_state : 'none'; }
}