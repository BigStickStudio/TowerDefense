export default class UI {
    ui = document.getElementById("ui")
    expanded = true;
    local_state = {};

    constructor(enableListeners, disableListeners) {
        this.ui.style = "display: flex; position: relative; top: 0; width: 100%;";
        this.ui.onmouseenter = disableListeners;
        this.ui.onmouseleave = enableListeners;
        this.updateUI();
    }

    updateUI = (val = undefined) => {
        this.local_state = val ? val : this.local_state;

        ui.innerHTML = `
            <div class="d-flex justify-content-end" 
                style="position: absolute; right: 2vw; top: 2vh; width: 20rem; z-index=100;">
                <div class="container d-flex">
                    <div class="col py-2 rounded-3 border border-primary"
                        style="background-color: #43434365; color: white;">
                        <div id="toggle-menu" class="row text-end" style="width: 100%">
                            ${this.expanded ? 
                                '<i class="bi bi-chevron-compact-up"></i>' :
                                '<i class="bi bi-chevron-compact-down"></i>'
                            }
                        </div>
                        ${this.expanded ? `
                        <!--
                        <div class="row">
                            Camera Target: ${this.local_state?.camera_target}
                        </div>
                        -->
                        <div class="row px-4">
                            Camera Mode: ${this.local_state?.camera_mode}
                        </div>        
                        <div class="row px-4">        
                            Target Position: ${this.local_state?.cursor_target}
                        </div>
                        <div class="row px-4">        
                            Moving State: ${this.local_state?.moving_state}
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // This has to be here, or it will get erased when we update the UI
        let toggle_menu = document.getElementById("toggle-menu");
        toggle_menu.onclick = this.toggleUI;
    }

    toggleUI = () => {
        this.expanded = !this.expanded;
        this.updateUI();
    }
}