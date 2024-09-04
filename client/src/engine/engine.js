import * as THREE from 'three';
import UI from '../ui.js';
import Camera from './camera.js';
import StateManager from './state_manager.js';

const state = StateManager.instance;

const unwrap = (t) => { return t ? t : 'none'; }
const clamp = (v) => { return v < 0 ? 0 : v > 255 ? 255 : v; }

export default class Engine {
    // TODO: Maybe we move these out somewhere else
    camera_enabled = false;
    enableCamera = () => { console.error("[Engine]::error : Camera fn() not defined."); };
    disableCamera = () => { console.error("[Engine]::error : Camera fn() not defined."); };
    enableMapCursor = () => { console.error("[Engine]::error : Map Cursor fn() not defined."); };
    disableMapCursor = () => { console.error("[Engine]::error : Map Cursor fn() not defined."); };

    constructor() 
        {
            this.clock = new THREE.Clock();
            this.scene = new THREE.Scene();
            this.initRenderer();
            this.ui = new UI(this.enableListeners, this.disableListeners);
            this.camera = new Camera(this.renderer);

            state.setState({
                "night_cycle": 0, // 255 is full night, 0 is full day
                "day_cycle": 0, // 255 is full day, 0 is full night
                "camera_target": 'none', // Must be a player object or null (free fly)
                "selection_mode": 'none', // This will be used for 'building' or 'selecting' objects
                "selected_target": 'none',
                "cursor_target": 'none',
                "moving_state": "Resting",
                "camera_mode": "third-person", // first-person, third-person, top-down
            });

            state.redrawUI = this.redrawUI;
        }

    initRenderer = () => 
        {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setClearColor(0x000000);
            this.renderer.gammaFactor = 2.2;
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            let canvas = document.getElementById('canvas');
            canvas.appendChild(this.renderer.domElement);
        }

    // This function has to be called at the end of the Game Initialization
    // as the Camera is a part of the Engine, but the Map is part of the Game
    configureListeners = () => 
        {
            this.enableCamera = this.camera.enable;
            this.disableCamera = this.camera.disable;
            this.enableMapCursor = this.map.enable;
            this.disableMapCursor = this.map.disable;
        }

    enableListeners = () => 
        {
            console.log("Enabling Listeners");
            this.enableCamera();
            this.enableMapCursor();
        }

    disableListeners = () => 
        {
            console.log("Disabling Listeners");
            this.disableCamera();
            this.disableMapCursor();
        }


    redrawUI = () => 
        { 
            console.log("Redrawing UI");
            let local_state = state.getState();
            console.log(local_state);
            
            this.ui.updateUI(state); }

}