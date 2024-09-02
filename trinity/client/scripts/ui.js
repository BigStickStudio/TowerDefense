import State from "./state.js";

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

state_instance.redraw = updateUI;