let local_state = {}

const unwrap = (t) => { return t ? t : 'none'; }
const clamp = (v) => { return v < 0 ? 0 : v > 255 ? 255 : v; }

export default class State {
    static this_instance = null;
    redrawUI = undefined; // TODO: Rename this RedrawUI  
    morning = true; // Morning determines if we've reached the PEAK of the day cycle
    noon = false; // Noon determines if we are in the Day cycle
    
    constructor() {
        local_state = {
            "night_cycle": 0, // 255 is full night, 0 is full day
            "day_cycle": 0, // 255 is full day, 0 is full night
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

    updateSkyCycle = (elapsed) => {
        let night_cycle = local_state["night_cycle"];
        let day_cycle = local_state["day_cycle"];

        let night_elapsed = elapsed * 30;
        let day_elapsed = elapsed * 10;

        if (this.morning)
            { 
                // We only want to incriment the night cycle until we reach the peak
                if (!this.noon)
                    {
                        night_cycle = night_cycle + night_elapsed;
                        this.noon = (night_cycle >= 255);
                    }

                day_cycle = day_cycle + day_elapsed;
                this.morning = (day_cycle <= 255);
            }
        else 
            {
                day_cycle = day_cycle - day_elapsed;

                // Noon Ends when the day cycle is a third over
                this.noon = this.noon ? (day_cycle >= 170) : true;

                if (!this.noon)
                    { night_cycle = night_cycle - night_elapsed; }

                this.morning = (night_cycle <= 0);
            }

        local_state["night_cycle"] =  night_cycle;
        local_state["day_cycle"] = day_cycle;
    }

    get night_cycle()
        { 
            let sky_cycle = local_state["night_cycle"];
            return (clamp(sky_cycle) / 255).toFixed(3);
        }

    get day_cycle()
        { 
            let sky_cycle = local_state["day_cycle"];
            return (clamp(sky_cycle) / 255).toFixed(3);; 
        }

    set cursor_target(target) { 
        local_state["cursor_target"] = target; 
        this.redrawUI();
    }

    get cursor_target() { 
        const target = local_state["cursor_target"]; 
        return target ? `${target.x}, ${target.z}` : 'none';
    }

    set moving_state(state) {
        local_state["moving_state"] = state;
        this.redrawUI();
    }

    get moving_state() 
        { return unwrap(local_state["moving_state"]); }

    set camera_mode(state) {
        local_state["camera_mode"] = state;
    //    this.redrawUI();
    }

    get camera_mode() 
        { return local_state["camera_mode"]; }

    get top_down() 
        { return local_state["camera_mode"] === "top-down"; }
    
    get first_person() 
        { return local_state["camera_mode"] === "first-person"; }

    set camera_target(target) {
        local_state["camera_target"] = target;
        this.redrawUI();
    }

    get camera_target() 
        { return local_state["camera_target"]; }
}