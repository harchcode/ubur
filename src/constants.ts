import { hex } from './utils/color';
import { circleAreaFromRadius } from './utils/math';

export const WORLD_L = 2000;
export const MAX_SPHERE_R = 100;
export const MAX_SPHERE_AREA = circleAreaFromRadius(MAX_SPHERE_R);
export const MIN_SPHERE_R = 1;
export const MIN_SPHERE_AREA = circleAreaFromRadius(MIN_SPHERE_R);
export const STARTING_SPHERE_R = 5;
export const MAX_SPHERE_V = 50;

export const FPS = 60;
export const MPF = 1000 / FPS;

export const BACK_COLOR = hex('#C05621');
export const ARENA_COLOR = hex('#FFFFF0');
export const ARENA_GRID_COLOR = hex('#B7791F');
export const ARENA_GRID_CELL_COUNT = 50;
export const ARENA_GRID_CELL_L = WORLD_L / ARENA_GRID_CELL_COUNT;
export const ARENA_GRID_LINE_W = 1;
export const ARENA_GRID_LINE_COUNT = ARENA_GRID_CELL_COUNT - 1;

export const SPHERE_COLORS = [
  hex('#EF5753'),
  hex('#FAAD63'),
  hex('#FFF382'),
  hex('#51D88A'),
  hex('#64D5CA'),
  hex('#6CB2EB'),
  hex('#7886D7'),
  hex('#A779E9'),
  hex('#FA7EA8')
];

export enum GameState {
  START = 1,
  CONNECTING = 2,
  WAITING_TO_START = 3,
  PLAYING = 4,
  GAME_OVER = 5
}
