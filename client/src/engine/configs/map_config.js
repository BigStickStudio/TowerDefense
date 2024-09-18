import * as THREE from 'three';

const square_size = 6;
const frame_size = 0.5;
const spawn_buffer = 8;
const path_buffer = 5;
const night_top_color = new THREE.Color(0x996611);
const night_bottom_color = new THREE.Color(0x00cc99);
const day_top_color = new THREE.Color().setHSL(1, 1, 1);
const day_bottom_color = new THREE.Color().setHSL(0.25, .5, .7);

const lerpTopColor = (night_value) => { return night_top_color.lerp(day_top_color, night_value); }
const lerpBottomColor = (night_value) => { return night_bottom_color.lerp(day_bottom_color, night_value); }

const config = {
    lerpTopColor: lerpTopColor,
    lerpBottomColor: lerpBottomColor,
    night_top_color: new THREE.Color(0x996611),
    night_bottom_color: new THREE.Color(0x00cc99),
    day_top_color: new THREE.Color().setHSL(1, 1, 1),
    day_bottom_color: new THREE.Color().setHSL(0.25, .5, .7),
    spawn_buffer: spawn_buffer,
    path_buffer: path_buffer,
    square_size: square_size,
    frame_size: frame_size,
    square_offset: Math.floor(square_size / 2),
}

export default config;