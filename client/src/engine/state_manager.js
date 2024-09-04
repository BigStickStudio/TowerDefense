let instance = null;

export default class StateManager {
    redrawUI = () => { console.error("[StateManager]::error : UI redraw fn() not defined."); }

    constructor() 
        { this.init(); }
        
    init = () => 
        { this.state = {}; }

    static get instance()
        {
            if (!instance) 
                { instance = new StateManager(); }

            return instance
        }

    // dynamic setter
    set = (key, value) =>
        { this.state[key] = value; }

    get = (key) => 
        { return this.state[key]; }

    setState = (state) => 
        { this.state = state; }

    getState = () => 
        { return this.state; }
}