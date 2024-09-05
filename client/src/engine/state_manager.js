import camera_config from "../configs/camera_config.js";

let instance = null;

// TODO: Move these to a utility file
const unwrap = (t) => { return t ? t : 'none'; }
const clamp = (v) => { return v < 0 ? 0 : v > 255 ? 255 : v; }

export default class StateManager {
    updateUI = () => { console.error("[StateManager]::error : UI redraw fn() not defined."); }

    constructor() 
        { this.init(); }
        
    init = () => 
        { this.state = {
            "night_cycle": 0.0, // 255 is full night, 0 is full day
            "day_cycle": 0.0, // 255 is full day, 0 is full night
            "camera_target": 'none', // Must be a player object or null (free fly)
            "selection_mode": 'none', // This will be used for 'building' or 'selecting' objects
            "selected_target": 'none',
            "cursor_target": 'none',
            "moving_state": "Resting",
            "camera_position": camera_config.default_camera_position, // first-person, third-person, top-down
            "camera_mode": false, // (Free Fly vs Fixed)
        }; }

    static get instance()
        {
            if (!instance) 
                { instance = new StateManager(); }

            return instance
        }


    redrawUI = () => 
        { this.updateUI(this.state); }
    
    set camera_mode(value)
        { this.state["camera_mode"] = value; this.redrawUI(); }
    
    get camera_mode()
        { return this.state["camera_mode"]; }

    toggleCameraMode = () =>
        { this.camera_mode = !this.camera_mode; }

    set camera_target(value)
        { this.state["camera_target"] = value; this.redrawUI(); }

    // set selection_mode(value) {}

    set camera_position(value)
        { this.state["camera_position"] = value; this.redrawUI(); }
    
    get camera_position()
        { return this.state["camera_position"]; }

    get top_down()
        { return this.state["camera_position"] === "top-down"; }

    set moving_state(value)
        { this.state["moving_state"] = value; this.redrawUI(); }

    get moving_state()
        { return this.state["moving_state"]; }

    set night_cycle(value)
        { this.state["night_cycle"] = value; }
    
    get night_cycle()
        { return this.state["night_cycle"]; }

    get normalized_night_cycle()
        { 
            let sky_cycle = this.state["night_cycle"];
            return +(clamp(sky_cycle) / 255).toFixed(3);
        }

    set day_cycle(value)
        { this.state["day_cycle"] = value; }

    get day_cycle()
        { return this.state["day_cycle"]; }

    get normalized_day_cycle()
        { 
            let sky_cycle = this.state["day_cycle"];
            return +(clamp(sky_cycle) / 255).toFixed(3); 
        }
}