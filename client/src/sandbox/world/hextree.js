import Chunk from './chunk.js';
import * as config from './chunk_config.js';

const HALF_CHUNK = config.CHUNK_SIZE / 2;
const HALF_SQUARE = config.SQUARE_SIZE / 2;
const HALF_MAP = config.MAP_SIZE / 2;  

const OFFSETS = [config.MAX_CHUNK_OFFSET, config.MID_CHUNK_OFFSET, config.MIN_CHUNK_OFFSET, 0];
const OFFSET_SIZES = [config.MAX_OFFSET_SIZE, config.MID_OFFSET_SIZE, config.MIN_OFFSET_SIZE, 0];
const SIZES = [config.MAX_CHUNK_SIZE, config.MID_CHUNK_SIZE, config.MIN_CHUNK_SIZE, config.CHUNK_SIZE];
const COUNTS = [config.MAX_CHUNK_COUNT, config.MID_CHUNK_COUNT, config.MIN_CHUNK_COUNT, 1];



export default class HexNode {
    chunks = [];               // Array of chunks in the region

    constructor(subdivision, start, end) {
        this.layer = subdivision;
        this.start = start;
        this.end = end;
        this.initGrid();
    }

    initGrid = () => {
        const { layer, start, end, chunks } = this;
        const offset = OFFSETS[layer];
        const offset_size = OFFSET_SIZES[layer];
        const chunk_size = SIZES[layer];
        const count = COUNTS[layer];

        const calculatePosition = (index, size) => 
            { return (index * config.CHUNK_SIZE) + (size / 2) - config.MAP_CENTER; }

        let [z, end_z] = [start?.z ?? start, end?.z ?? end];
        let [start_x, end_x] = [start?.x ?? start, end?.x ?? end];

        // Calculate the Z position and size of the chunk
        while (z < end_z)
            {
                let [z_chunk_size, z_count] = (z < offset || z >= config.CHUNK_COUNT - offset) ? 
                            [offset_size, offset] : [chunk_size, count];

                let z_position = calculatePosition(z, z_chunk_size);
                let height = z_chunk_size;
                let x = start_x;
                let z_offset_scalar = z_count / 4;

                // Calculate the X position and size of the chunk
                while (x < end_x)
                    {
                        let [x_chunk_size, x_count] = (x < offset || x >= config.CHUNK_COUNT - offset) ?
                                [offset_size, offset] : [chunk_size, count];

                        let x_position = calculatePosition(x, x_chunk_size);
                        let width = x_chunk_size;
                        let x_offset_scalar = x_count / 4;

                        let chunk = new Chunk(layer, 
                            {x: x_position, z: z_position}, 
                            {w: width, h: height},
                            {x: x, z: z},                         // Start Position
                            {x: x + x_count, z: z + z_count},     // End Position
                            {x: x_offset_scalar, z: z_offset_scalar}    // Offset
                        );

                        chunks.push(chunk);
                        x += x_count;
                    }

                z += z_count;
            }
    }

    calculateSubdivisions = (position) => {
        if (this.layer >= 3)
            { return; }

        let new_chunks = [];

        const filter = (chunk) => { 
            if (chunk.contains(position)) 
                {
                    let new_nodes = new HexNode(chunk.layer + 1, chunk.start, chunk.end);
                    new_nodes.calculateSubdivisions(position);
                    new_chunks.push(...new_nodes.chunks);

                    return false;
                }

            return true;
        }

        this.chunks = this.chunks.filter(filter);
        this.chunks.push(...new_chunks);
    }
}


HexNode.prototype.getPosition = function(n)  
    { return (n * CHUNK_SIZE) - HALF_MAP + HALF_CHUNK; }


HexNode.prototype.calculatePosition = function()
    {
        let x = Math.floor((this.min.x + this.max.x) / 2);
        let z = Math.floor((this.min.z + this.max.z) / 2);
        this.position = { x: x, z: z };
    }

HexNode.prototype.calculateSize = function()
    {
        this.size = { h: h, w: w };
    }


