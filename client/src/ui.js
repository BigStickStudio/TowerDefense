import State from "./world/state.js";

const state_instance = State.instance;

const ui = document.getElementById("ui")

const updateUI = () => {
    ui.style = "display: flex; position: relative; top: 0; width: 100%;";
    ui.innerHTML = `
        <div class="d-flex justify-content-end" 
             style="position: absolute; right: 2vw; top: 2vh; width: 20rem;>
            <div class="container">
                <div class="col py-2 px-4 bg-light rounded-3">
                    <div class="row">
                        Camera Target: ${state_instance.camera_target}
                    </div>
                    <div class="row">
                        Camera Mode: ${state_instance.camera_mode}
                    </div>        
                    <div class="row">        
                        Target Position: ${state_instance.cursor_target}
                    </div>
                    <div class="row">        
                        Moving State: ${state_instance.moving_state}
                    </div>
                </div>
            </div>
        </div>
    `;
}

updateUI();

state_instance.redrawUI = updateUI;