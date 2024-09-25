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

        // Calculate the Z position and height of the chunk
        while (z < end_z)
            {
                let [z_chunk_size, z_count] = (z < offset || z >= config.CHUNK_COUNT - offset) ? 
                            [offset_size, offset] : [chunk_size, count];

                let z_position = calculatePosition(z, z_chunk_size);
                let height = z_chunk_size;
                let x = start_x;

                // Calculate the X position and width of the chunk
                while (x < end_x)
                    {
                        let [x_chunk_size, x_count] = (x < offset || x >= config.CHUNK_COUNT - offset) ?
                                [offset_size, offset] : [chunk_size, count];

                        let x_position = calculatePosition(x, x_chunk_size);
                        let width = x_chunk_size;

                        let chunk = new Chunk(layer, 
                            {x: x_position, z: z_position}, 
                            {w: width, h: height},
                            {x: x, z: z},                         // Start Position
                            {x: x + x_count, z: z + z_count},     // End Position
                            {x: x_count, z: z_count}              // Offset
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
                    let chunks = [];

                    const {x: start_x, z: start_z} = chunk.start; 
                    const {x: end_x, z: end_z} = chunk.end;
                    const {x: x_step, z: z_step} = chunk.offset;
                    let x_distance = chunk.xDistance(position);
                    let z_distance = chunk.zDistance(position);

                    let z = start_z;
                    let x = start_x;

                    if (z < z_distance)
                        {
                            while (z + z_step < position.z && z < end_z)
                                { z += z_step; }

                            const partial_z_nodes = new HexNode(chunk.layer + 1, {x: start_x, z: start_z}, {x: end_x, z: z});
                            console.log("Partial Z < z_distance: ", partial_z_nodes);
                            chunks = [...partial_z_nodes.chunks];
                        }
                    else 
                        {
                            while (z - z_step > position.z && z > start_z)
                                { z -= z_step; }

                            const partial_z_nodes = new HexNode(chunk.layer + 1, {x: start_x, z: z}, {x: end_x, z: end_z});
                            console.log("Partial Z > z_distance: ", partial_z_nodes);
                            chunks = [...partial_z_nodes.chunks];
                        }


                    if (z < end_z) 
                        {
                            if (x < x_distance) 
                                {
                                    while (x + x_step < position.x && x < end_x)
                                        { x += x_step; }

                                    const partial_x_nodes = new HexNode(chunk.layer + 1, {x: start_x, z: z}, {x: x, z: end_z});
                                    console.log("Partial X < x_distance", partial_x_nodes);
                                    chunks = [...chunks, ...partial_x_nodes.chunks];
                                }
                            else 
                                {
                                    while (x - x_step > position.x && x > start_x)
                                        { x -= x_step; }

                                    const partial_x_nodes = new HexNode(chunk.layer + 1, {x: x, z: z}, {x: end_x, z: end_z});
                                    console.log("Partial X > x_distance", partial_x_nodes);
                                    chunks = [...chunks, ...partial_x_nodes.chunks];
                                }
                        }

                    const [rem_x_start, rem_x_end] = (x < end_x) ? [x, end_x] : [start_x, x];
                    const [rem_z_start, rem_z_end] = (z < end_z) ? [z, end_z] : [start_z, z];

                    if (x != start_x && x != end_x)
                        {
                            const remaining_nodes = new HexNode(chunk.layer + 1, {x: rem_x_start, z: rem_z_start}, {x: rem_x_end, z: rem_z_end});
                            console.log("Partial XZ", remaining_nodes);
                            chunks = [...chunks, ...remaining_nodes.chunks];
                        }

                    // new_nodes.calculateSubdivisions(position);
                    new_chunks.push(...chunks);
                    // TODO: Flag chunk in scene to be removed
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


