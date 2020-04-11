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

const onClick = (ev: MouseEvent) => {
  if (!drawer.playerSphere) return;

  const sphereX = window.innerWidth * 0.5;
  const sphereY = window.innerHeight * 0.5;

  const mouseX = ev.clientX;
  const mouseY = window.innerHeight - ev.clientY;

  const relX = mouseX - sphereX;
  const relY = mouseY - sphereY;
  const len = Math.sqrt(relX * relX + relY * relY);

  const dirX = relX / len;
  const dirY = relY / len;

  game.shoot(drawer.playerSphere, dirX, dirY);
};

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

const updater = new Updater(game, (eaten: Sphere) => {
  if (eaten === drawer.playerSphere) {
    drawer.setPlayerSphere();
    titleUI.style.display = 'flex';

    window.removeEventListener('mousedown', onClick);
  }
});

game.start(updater, drawer);

startButton.onclick = () => {
  titleUI.style.display = 'none';
  const player = game.spawnPlayer(nameInput.value);
  player.r = 5;
  player.vx = 0;
  player.vy = 0;
  drawer.setPlayerSphere(player);

  window.addEventListener('mousedown', onClick);
};
