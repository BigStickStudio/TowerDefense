
export default class Chunk {
    constructor(layer, position, size, start, end, offset) {
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
        return this.start.x - this.offset.x * 1.25 < position.x &&
                position.x < this.end.x + this.offset.x * .5&& 
                this.start.z - this.offset.z * 1.25 < position.z &&
                position.z < this.end.z + this.offset.z * .5 ;
    }