const blocked_keys = ["night_cycle", "day_cycle"];

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

    display = () => {
        let state = this.local_state;
        let ui_components = [];

        Object.keys(state).forEach((key) => {
            if (blocked_keys.includes(key)) { return; }

            ui_components.push(`
                <div class="row my-2 px-4 mr-4">
                    <div class="col-6 text-uppercase">
                        <span><b>${key}:</b></span>
                    </div>
                    <div class="col-6 border-bottom border-primary text-center">
                        <span>${state[key]}</span>
                    </div>
                </div>
            `);
        });

        return ui_components.join("");
    }


    updateUI = (val) => {
        this.local_state = val ? val : this.local_state;

        ui.innerHTML = this.expanded ? 
            `
                <div style="position: absolute; right: 2vw; top: 2vh; width: 20rem;">
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
                <div style="position: absolute; right: 3vw; top: 2vh; width: '20rem'; height: 2rem;">
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
    }

    toggleUI = () => {
        this.expanded = !this.expanded;
        this.updateUI();
    }
}