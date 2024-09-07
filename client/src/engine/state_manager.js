import * as THREE from "three";
import camera_config from "../configs/camera_config.js";
import game_config_map from "../configs/game_config_map.js";
import map_config from "../configs/map_config.js";
import KeyBoardWarrior from "./keyboard_controller.js";

let instance = null;

// TODO: Move these to a utility file
const unwrap = (t) => { return t ? t : 'none'; }
const clamp = (v) => { return v < 0 ? 0 : v > 255 ? 255 : v; }

export default class StateManager {
    constructor() 
        { 
            this.updateUI = () => 
                { console.error("[StateManager]::error : UI redraw fn() not defined."); }
            
            this.clock = new THREE.Clock();
            this.scene = new THREE.Scene();
            this.initRenderer();
            this.keyboard = new KeyBoardWarrior();
            this.init(); 
        }
        
    init = () => 
        { 
            this.state = {
                "game_mode": 'pvp',
                "game_type": 'battle',
                "game_size": '1v1',
                "camera_target": new THREE.Object3D(),
                "camera_position": camera_config.default_camera_position, // first-person, third-person, top-down
                "cursor_target": 'none',
                "selected_target": 'none',
                "selection_mode": 'none', // This will be used for 'building', 'upgrading', or 'observing' objects
                "moving_state": "Resting",
                "night_cycle": 0.0, // 255 is full night, 0 is full day
                "day_cycle": 0.0, // 255 is full day, 0 is full night
                "fixed_camera": camera_config.default_camera_position === "third-person", // (Fixed vs Free Fly)
            };
            
            this.configuration_count = game_config_map[this.game_mode][this.game_type][this.match_size].config_count;
            this.configuration = Math.floor(Math.random() * this.configuration_count);
            console.log("[StateManager]::configuration:", this.configuration);
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

    static get instance()
        {
            if (!instance) 
                { instance = new StateManager(); }

            return instance;
        }

    redrawUI = (from) => { 
        //console.error(`[StateManager]::redrawUI(${from})`);
        this.updateUI(this.state); 
    }
    
    get key_pressed() { return this.keyboard.key_pressed; }
    
    get game_mode() { return this.state["game_mode"]; }
    get game_type() { return this.state["game_type"]; }
    get match_size() { return this.state["game_size"]; }

    get game_config() 
        { return game_config_map[this.game_mode][this.game_type][this.match_size]["configuration"][this.configuration]; }

    get half_grid() { 
        let grid_size = this.grid_size;
        return {
            x: grid_size.x / 2,
            y: grid_size.y / 2, 
        }; 
    }

    get map_center() {
        let half_grid = this.half_grid;
        let square_size = this.square_size;
        return {
            x: half_grid.x * square_size,
            y: half_grid.y * square_size,
        };
    }

    get grid_size() { return this.game_config["grid_size"]; }
    get square_size() { return map_config.square_size; }
    get field_size_x() { return this.grid_size.x * map_config.square_size; }
    get field_size_y() { return this.grid_size.y * map_config.square_size; }
    
    set fixed_camera(value)
        { this.state["fixed_camera"] = value; this.redrawUI(`Fixed Camera(${value})`); }
    
    get fixed_camera()
        { return this.state["fixed_camera"]; }

    // Called when we drag the mouse from top-down OR when we double click a character
    // - When Enabled the camera should switch to a target
    // - When Disabled the camera should switch to a free fly
    toggleCameraMode = () =>
        { this.fixed_camera = !this.fixed_camera; }

    get camera_target() { return this.state["camera_target"]; }

    set camera_target(value)
        { this.state["camera_target"] = value; this.redrawUI(`Camera Target(${value})`); }
    
    set camera_target_name(value)
        { this.state["camera_target"].name = value; this.redrawUI(`Camera Target Name(${value})`); }

    set camera_position(value)
        { this.state["camera_position"] = value; this.redrawUI(`Camera Position(${value})`); }
    
    get camera_position()
        { return this.state["camera_position"]; }

    get top_down()
        { return this.state["camera_position"] === "top-down"; }

    set moving_state(value)
        { this.state["moving_state"] = value; this.redrawUI(`Moving State(${value})`); }

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

    set cursor_target(value)
        { 
            this.state["cursor_target"] = value; 
            this.redrawUI(`Cursor Target(${value})`);
        }

    get cursor_target()
        { return this.state["cursor_target"]; }
}