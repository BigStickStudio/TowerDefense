import State from "./state.js";

const state_instance = State.instance;

const ui = document.getElementById("ui")
let fn = () => { return 1 + 2; }

const updateUI = () => {
    ui.style = "display: flex; position: relative; top: 0; width: 100%;";
    ui.innerHTML = `
        <div class="d-flex justify-content-end" 
             style="position: absolute; right: 2vw; top: 2vh; width: 20rem;>
            <div class="container">
                <div class="col py-2 px-4 bg-light rounded-3">        
                    <div class="row">        
                        Menu ${fn()}
                    </div>
                    <div class="row">        
                            Target Position: ${state_instance.target}
                    </div>
                    <div class="row">        
                            Moving State: ${state_instance.movingState}
                    </div>
                </div>
            </div>
        </div>
    `;
}

updateUI();

state_instance.redraw = updateUI;