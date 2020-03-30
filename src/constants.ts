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
export const ARENA_GRID_LINE_W = 0.5;
export const ARENA_GRID_LINE_COUNT = ARENA_GRID_CELL_COUNT - 1;

export const CAMERA_ZOOM_SPEED = 50;

export const SPHERE_COLORS = [
  hex('#FEB2B2'), // red
  hex('#FBD38D'), // orange
  hex('#FAF089'), // yellow
  hex('#9AE6B4'), // green
  hex('#81E6D9'), // teal
  hex('#90CDF4'), // blue
  hex('#A3BFFA'), // indigo
  hex('#D6BCFA'), // purple
  hex('#FBB6CE') // pink
];

export const NAME_COLOR_STRS = [
  '#742A2A',
  '#7B341E',
  '#744210',
  '#22543D',
  '#234E52',
  '#2A4365',
  '#3C366B',
  '#44337A',
  '#702459'
];

export const NAME_CANVAS_L = 1280;

export const NAME_SIZE_STRS = [
  `${NAME_CANVAS_L / 80}px sans-serif`,
  `${NAME_CANVAS_L / 60}px sans-serif`,
  `${NAME_CANVAS_L / 40}px sans-serif`,
  `${NAME_CANVAS_L / 30}px sans-serif`,
  `${NAME_CANVAS_L / 20}px sans-serif`,
  `bold ${NAME_CANVAS_L / 15}px sans-serif`,
  `bold ${NAME_CANVAS_L / 12}px sans-serif`,
  `bold ${NAME_CANVAS_L / 10}px sans-serif`
];

export const NAME_SIZE_R_LIMIT = NAME_CANVAS_L / 4;
export const NAME_SIZE_STEP = NAME_SIZE_R_LIMIT / NAME_SIZE_STRS.length;

export enum GameState {
  START = 1,
  CONNECTING = 2,
  WAITING_TO_START = 3,
  PLAYING = 4,
  GAME_OVER = 5
}
