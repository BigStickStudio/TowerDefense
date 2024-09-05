const grid_width = 80;  // If these are not whole numbers
const grid_height = 60; // We end up with .5s in the grid
const square_size = 15;
const frame_size = 0.5;
const spawn_buffer = 4;
const path_buffer = 2;

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