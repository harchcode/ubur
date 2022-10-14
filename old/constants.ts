import { hex } from './utils/color';
import { circleAreaFromRadius } from './utils/math';

export const WORLD_L = 2000;
export const MAX_SPHERE_R = 100;
export const MAX_SPHERE_AREA = circleAreaFromRadius(MAX_SPHERE_R);
export const MIN_SPHERE_R = 1;
export const MIN_SPHERE_AREA = circleAreaFromRadius(MIN_SPHERE_R);
export const STARTING_PLAYER_R = 5;
export const STARTING_PLAYER_R_RANDOMNESS = 1;
export const MAX_SPHERE_SPEED = 100;

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

export const PLAYER_COLORS = [
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

export const FOOD_COLORS = [
  hex('#E53E3E'), // red
  hex('#DD6B20'), // orange
  hex('#D69E2E'), // yellow
  hex('#38A169'), // green
  hex('#319795'), // teal
  hex('#3182CE'), // blue
  hex('#5A67D8'), // indigo
  hex('#805AD5'), // purple
  hex('#D53F8C') // pink
];

export const BULLET_COLORS = [
  hex('#E53E3E'), // red
  hex('#DD6B20'), // orange
  hex('#D69E2E'), // yellow
  hex('#38A169'), // green
  hex('#319795'), // teal
  hex('#3182CE'), // blue
  hex('#5A67D8'), // indigo
  hex('#805AD5'), // purple
  hex('#D53F8C') // pink
];

export const AM_COLOR = hex('#1A202C');

export const PLAYER_NAME_COLORS = [
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

export const FOOD_SPAWN_R_MIN = 1;
export const FOOD_SPAWN_R_MAX = 5;
export const AM_SPAWN_R_MIN = 1;
export const AM_SPAWN_R_MAX = 20;

export const SHOOT_DELAY = 100;
export const SHOOT_AREA_RATIO_SQ = 0.98;
export const SHOOT_AREA_RATIO = Math.sqrt(SHOOT_AREA_RATIO_SQ);
export const BULLET_AREA_RATIO = Math.sqrt(1 - SHOOT_AREA_RATIO_SQ);
export const SHOOT_FORCE = 5;
export const BULLET_SPEED = 120;

export const SPHERE_R_CHANGE_SPEED = 10;

export const R_DECREASE_RATIO = 0.001;

export const FOOD_SPAWN_DELAY = 0.1;
export const AM_SPAWN_DELAY = 1;
export const MAX_SPHERE_COUNT = 800;

export const FAKE_PLAYER_NAMES = [
  'Bambino',
  'Stud',
  'Babe',
  'Tater Tot',
  'Coach',
  'Amazon',
  'Lady',
  'Ticklebutt',
  'Rockette',
  'Goose',
  'Einstein',
  'Sweetums',
  'Tater',
  'Dearey',
  'Frau Frau',
  'Friendo',
  'Apple Jack',
  'Brown Sugar',
  'Rosie',
  'Anvil',
  'Fun Size',
  'Cold Front',
  'Amiga',
  'Cinnamon',
  'Silly Sally',
  'Tickles',
  'Thunder Thighs',
  'Juicy',
  'Blimpie',
  'Double Bubble',
  'Big Nasty',
  'Dulce',
  'Diet Coke',
  'Lulu',
  'Gordo',
  'Catwoman',
  'Colonel',
  'Flyby',
  'Golden Graham',
  'Boo Bear',
  'Bello',
  'T-Dawg',
  'Piggy',
  'Gams',
  'Amour',
  'Wifey',
  'Goonie',
  'Chubs',
  'Inchworm',
  'Belch',
  'Terminator',
  'Boo Bug',
  'Donuts',
  'Hawk',
  'Figgy',
  'Pyscho',
  'Hulk',
  'Fellow',
  'Bug',
  'Diesel',
  'Biscuit',
  'Toots',
  'Scarlet',
  'Sweet Tea',
  'Butter',
  'Janitor',
  'Cheese',
  'Spicy',
  'Crumbles',
  'Sassafras',
  'Drake',
  'Chewbacca',
  'Smiley',
  'Snuggles',
  'Chump',
  'Boomhauer',
  'Peppermint',
  'Cello',
  'Chef',
  'Taco',
  'Cheeky',
  'Slick',
  'Kitty',
  'Happy',
  'Pansy',
  'Ghoulie',
  'Tank',
  'Sunny',
  'Tough Guy',
  'Psycho',
  'Frodo',
  'Cat',
  'Music Man',
  'Birdy',
  'Halfmast',
  'Twizzler',
  'Cruella',
  'Creep',
  'Dottie',
  'Bellbottoms',
  'Red Velvet',
  'Gingersnap',
  'DJ',
  'Sassy',
  'Hammer',
  'Pixie',
  'Tomcat',
  'Silly Gilly',
  'Rumplestiltskin',
  'Queen Bee',
  'Gummy Pop',
  'Mouse',
  'Beanpole',
  'Dilly Dally',
  'Mad Max',
  'Baby',
  'Candycane',
  'Doll',
  'Donut',
  'Harry Potter',
  'Beauty',
  'Beast',
  'Ginger',
  'Skunk',
  'Lover',
  'Smudge',
  'Oompa Loompa',
  'Kit-Kat',
  'Luna',
  'Salt',
  'Butternut',
  'Snoopy',
  'Guapo',
  'Twinkly',
  'Cookie',
  'Candy',
  'Bubbles',
  'Pickle',
  'Skinny Jeans',
  'Buds',
  'Swiss Miss',
  'Dirty Harry',
  'Cricket',
  'Bean',
  'Grease',
  'Duckling',
  'Mistress',
  'Baby Boo',
  'Superman',
  'Ice Queen'
];

export const LS_PLAYER_NAME = 'playerName';
