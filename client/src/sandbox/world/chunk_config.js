import { Color } from 'three';

export const MAX_CHUNK_COUNT = 54;
export const MEGA_CHUNK_COUNT = 27;
export const MID_CHUNK_COUNT = 9;
export const MIN_CHUNK_COUNT = 3;
export const SQUARE_SIZE = 6;
export const TILE_COUNT = 310;
export const CHUNK_SIZE = SQUARE_SIZE * 5;
export const MAX_CHUNK_SIZE = CHUNK_SIZE * MAX_CHUNK_COUNT;
export const MEGA_CHUNK_SIZE = CHUNK_SIZE * MEGA_CHUNK_COUNT;
export const MID_CHUNK_SIZE = CHUNK_SIZE * MID_CHUNK_COUNT;
export const MIN_CHUNK_SIZE = CHUNK_SIZE * MIN_CHUNK_COUNT;
export const MAP_SIZE = SQUARE_SIZE * TILE_COUNT;
export const MAP_CENTER = MAP_SIZE / 2;
export const CHUNK_COUNT = MAP_SIZE / CHUNK_SIZE;
export const MAX_CHUNK_OFFSET = Math.ceil((CHUNK_COUNT % MAX_CHUNK_COUNT) / 2);
export const MAX_OFFSET_SIZE = MAX_CHUNK_OFFSET * CHUNK_SIZE;
export const MEGA_CHUNK_OFFSET = (MAX_CHUNK_OFFSET % MEGA_CHUNK_COUNT);
export const MEGA_OFFSET_SIZE = MEGA_CHUNK_OFFSET * CHUNK_SIZE;
export const MID_CHUNK_OFFSET = (MEGA_CHUNK_OFFSET % MID_CHUNK_COUNT);
export const MID_OFFSET_SIZE = MID_CHUNK_OFFSET * CHUNK_SIZE;
export const MIN_CHUNK_OFFSET = (MID_CHUNK_OFFSET % MIN_CHUNK_COUNT);
export const MIN_OFFSET_SIZE = MIN_CHUNK_OFFSET * CHUNK_SIZE;
export const MAX_ID_TABLE = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
export const MID_ID_TABLE = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q"];
export const night_top_color = new Color(0x996611);
export const night_bottom_color = new Color(0x00cc99);
export const day_top_color = new Color().setHSL(1, 1, 1);
export const day_bottom_color = new Color().setHSL(0.25, .5, .7);