let local_state = {}

const unwrap = (t) => { return t ? t : 'none'; }

export default class State {
    static this_instance = null;
    redraw = undefined;    
    
    constructor() {
        local_state = {
            "camera_target": null, // Must be a player object or null (free fly)
            "selection_mode": null, // This will be used for 'building' or 'selecting' objects
            "selected_target": null,
            "cursor_target": null,
            "moving_state": "Resting",
            "camera_mode": "third-person", // first-person, third-person, top-down
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

    get moving_state() 
        { return unwrap(local_state["moving_state"]); }

    set camera_mode(state) {
        local_state["camera_mode"] = state;
    //    this.redraw();
    }

    get camera_mode() 
        { return local_state["camera_mode"]; }

    get top_down() 
        { return local_state["camera_mode"] === "top-down"; }
    
    get first_person() 
        { return local_state["camera_mode"] === "first-person"; }

    set camera_target(target) {
        local_state["camera_target"] = target;
        this.redraw();
    }

    get camera_target() 
        { return local_state["camera_target"]; }
}