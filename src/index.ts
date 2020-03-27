import { Game } from './game';
import { Updater } from './updater';
import { Drawer } from './drawer';

const canvas = document.getElementById('game') as HTMLCanvasElement;

const game = new Game();

const updater = new Updater(game);
const drawer = new Drawer(game, canvas);

const resizeWindow = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w;
  canvas.height = h;

  drawer.resize(w, h);
};

window.addEventListener('resize', () => {
  resizeWindow();
});

resizeWindow();

game.start(updater, drawer);
