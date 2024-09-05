const grid_width = 75;
const grid_height = 80;
const square_size = 15;
const frame_size = 0.5;
const spawn_buffer = 5;
const path_buffer = 4;

const config = {
    spawn_buffer: spawn_buffer,
    path_buffer: path_buffer,
    grid_size: {
        x: grid_width,
        y: grid_height,
    },
    square_size: square_size,
    frame_size: frame_size,
    map_offset: (square_size / 2),
}

export default config;