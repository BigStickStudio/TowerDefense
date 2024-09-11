import StateManager from "./state_manager.js";

const state = StateManager.instance;
// real one
//const blocked_keys = ["night_cycle", "day_cycle", "sun_rotation"];
// debug one
const blocked_keys = ["night_cycle", "day_cycle", "sun_rotation", "camera_target", "camera_position", "cursor_target", "selected_target", "selection_mode", "moving_state"];
const buttons = ["fixed_camera"];
const sliders = ["uv_scale", "uv_offset"]

const button_map = {
    "fixed_camera": {
        fn: state.toggleCameraMode,
        title: () => { return state.fixed_camera ? "Fixed" : "Free Fly"; },
    },
}

const slider_map = {
    "uv_scale": {
        fn: state.setUVScale,
    },
    "uv_offset": {
        fn: state.setUVOffset,
    }
}

const unwrap = (t) => {
    let v = t?.name;
    return v ? v : t;
}

export default class UI {
    ui = document.getElementById("ui");
    expanded = true;
    local_state = { "error": "updateUI() failed" };
    button_fns = [];
    slider_fns = [];

    constructor(enableListeners, disableListeners) {
        console.log("UI initialized");
        this.ui.style = "display: flex; position: relative; top: 0; width: 100%;";
        this.ui.onmouseenter = disableListeners;
        this.ui.onmouseleave = enableListeners;
        state.updateUI = this.updateUI; 
        //state.updateUI();
    }

    display = () => {
        let state = this.local_state;
        let ui_components = [];
        this.button_fns = [];

        Object.keys(state).forEach((key) => {
            if (blocked_keys.includes(key)) { return; }

            if (buttons.includes(key)) 
                {
                    ui_components.push(`
                        <div class="row my-2 px-4 mr-4">
                            <button id="${key}" type="button" class="btn btn-outline-primary w-100">
                                ${button_map[key].title()}
                            </button>
                        </div>
                        `);


                    // We create a function to initialize the button after the UI is rendered
                    function initButton() {
                        let button = document.getElementById(key);
                        button.onclick = button_map[key].fn;
                    }

                    this.button_fns.push(initButton);
                }
            else if (sliders.includes(key))
                {
                    ui_components.push(`
                        <div class="row my-2 px-4 mr-4">
                            <label for="${key}" class="col form-label">${key}</label>
                            <output class="col">1</output>
                            <input type="range" min="0" max="2" step="0.025" class="form-range" id="${key}">
                            
                        </div>
                        `)

                    function initSlider() {
                        let slider = document.getElementById(key);
                        slider.oninput = () => { 
                            slider.previousElementSibling.innerHTML = slider.value;
                            slider_map[key].fn(slider.value); 
                        }
                    }

                    this.slider_fns.push(initSlider);
                }
            else
                {
                    ui_components.push(`
                        <div class="row my-2 px-4 mr-4">
                            <div class="col-3 text-capitalize">
                                <span><b>${key}:</b></span>
                            </div>
                            <div class="col">
                            </div>
                            <div class="col-6 border-bottom border-primary text-center">
                                <span>${unwrap(state[key])}</span>
                            </div>
                        </div>
                    `);
                }
        });

        return ui_components.join("");
    }


    updateUI = (val) => {
        console.log("Updating UI");
        this.local_state = val ? val : this.local_state;

        ui.innerHTML = this.expanded ? 
            `
                <div style="position: absolute; right: 1vw; top: 2vh; width: 23rem;">
                    <div class="container d-flex">
                        <div class="col py-2 rounded-3 border border-primary"
                            style="background-color: #434343af; color: white;">
                            <div id="toggle-menu" class="row text-end px-3">
                                <i class="bi bi-chevron-compact-up"></i>
                            </div>
                                ${this.display()}
                        </div>
                    </div>
                </div>
            `
                :
            `
                <div style="position: absolute; right: 2vw; top: 2vh; width: '20rem'; height: 2rem;">
                    <div class="py-1 rounded-3 border border-primary"
                        style="background-color: #434343af; color: white;">
                        <div id="toggle-menu" class="text-center px-3">
                            <i class="bi bi-chevron-compact-down"></i>
                        </div>
                    </div>
                </div>
            `;

        // This has to be here, or it will get erased when we update the UI
        let toggle_menu = document.getElementById("toggle-menu");
        toggle_menu.onclick = this.toggleUI;

        if (this.expanded) {
            this.button_fns.forEach((fn) => { fn(); });
            this.slider_fns.forEach((fn) => { fn(); });
        }
    }

    toggleUI = () => {
        console.log(this.expanded);
        this.expanded = !this.expanded;
        this.updateUI();
    }
}