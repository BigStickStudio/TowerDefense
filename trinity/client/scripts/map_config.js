const grid_width = 30;
const grid_height = 50;
const square_size = 15;
const frame_size = 0.5;

const config = {
    grid_size: {
        x: grid_width,
        y: grid_height,
    },
    square_size: square_size,
    frame_size: frame_size,
    map_offset: (square_size / 4).toFixed(1),
}

export default config;