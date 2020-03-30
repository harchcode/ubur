import { Game } from './game';
import { Updater } from './updater';
import { Drawer } from './drawer';
import { Sphere } from './types';

const gameUI = document.getElementById('game-ui') as HTMLDivElement;
const titleUI = document.getElementById('title-ui') as HTMLDivElement;
const nameInput = document.getElementById('name-input') as HTMLInputElement;
const startButton = document.getElementById(
  'start-button'
) as HTMLButtonElement;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const nameCanvas = document.getElementById('name') as HTMLCanvasElement;

const game = new Game();

const drawer = new Drawer(game, canvas, nameCanvas);
const updater = new Updater(game, (eaten: Sphere) => {
  if (eaten === drawer.playerSphere) {
    drawer.setPlayerSphere();
    titleUI.style.display = 'flex';
  }
});

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

startButton.onclick = () => {
  titleUI.style.display = 'none';
  const player = game.spawnPlayer(nameInput.value);
  drawer.setPlayerSphere(player);
};
