
export default class Chunk {
    constructor(layer, position, size, start, end, offset) {
        console.log("Creating Chunk", layer, position, size)
        this.layer = layer;
        this.position = position;
        this.size = size;
        this.start = start;
        this.end = end;
        this.offset = offset;
    }
}

Chunk.prototype.contains = function(position)
    {
        return this.start.x < position.x + this.offset && 
               position.x - this.offset < this.end.x && 
               this.start.z < position.z + this.offset  && 
               position.z - this.offset < this.end.z;
    }