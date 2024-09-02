let local_state = {}

const unwrap = (t) => { return t ? t : 'none'; }

export default class State {
    static this_instance = null;
    redraw = undefined;    
    
    constructor() {
        local_state = {
            "selection_mode": null, // This will be used for 'building' or 'selecting' objects
            "selected_target": null,
            "cursor_target": null,
            "third_person": false,
            "moving_state": "Resting",
            "camera_mode": "attached", 
        }
    }


    static get instance() {
        if (!State.this_instance) 
            { State.this_instance = new State(); }

        return State.this_instance;
    }

    set cursor_target(target) { 
        local_state["cursor_target"] = target; 
        this.redraw();
    }

    get cursor_target() { 
        const target = local_state["cursor_target"]; 
        return target ? `${target.x}, ${target.z}` : 'none';
    }

    set moving_state(state) {
        local_state["moving_state"] = state;
        this.redraw();
    }

    get moving_state() { 
        const moving_state = local_state["moving_state"];
        return moving_state ? moving_state : 'none'; }
}