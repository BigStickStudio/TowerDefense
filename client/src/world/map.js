import MapConstructor from './map_constructor.js';
import MapInterface from './map_controller.js';

// Cleanest Utility Class in the Game - Do not make a mess here please
export default class Map extends MapInterface {
    constructor() 
        { 
            super();
            this.instance = new MapConstructor();
        }
}