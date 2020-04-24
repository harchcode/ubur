import { Game } from './game';
import { Updater } from './updater';
import { Drawer } from './drawer';
import { Sphere } from './types';
import { circleAreaFromRadius } from './utils/math';
import { SHOOT_DELAY } from './constants';

const gameUI = document.getElementById('game-ui') as HTMLDivElement;
const titleUI = document.getElementById('title-ui') as HTMLDivElement;
const nameInput = document.getElementById('name-input') as HTMLInputElement;
const startButton = document.getElementById(
  'start-button'
) as HTMLButtonElement;
const scoreText = document.getElementById('score-text') as HTMLSpanElement;

const rankItems: HTMLLIElement[] = [];
for (let i = 1; i <= 6; i++) {
  rankItems.push(document.getElementById(`rank-${i}`) as HTMLLIElement);
}

const canvas = document.getElementById('game') as HTMLCanvasElement;
const nameCanvas = document.getElementById('name') as HTMLCanvasElement;

const game = new Game();

const drawer = new Drawer(game, canvas, nameCanvas);

let lastShootTime = Date.now();

const onClick = (ev: MouseEvent) => {
  if (!drawer.playerSphere) return;

  const currentTime = Date.now();
  if (currentTime - lastShootTime < SHOOT_DELAY) return;

  lastShootTime = currentTime;

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
    gameUI.style.display = 'none';

    window.removeEventListener('mousedown', onClick);

    return true;
  }

  return false;
});

game.start(updater, drawer);

const compareSphereByRadius = (a: Sphere, b: Sphere) => b.r - a.r;

startButton.onclick = () => {
  titleUI.style.display = 'none';
  gameUI.style.display = 'block';

  const player = game.spawnPlayer(nameInput.value);
  drawer.setPlayerSphere(player);

  window.addEventListener('mousedown', onClick);

  const updateScore = () => {
    if (!drawer.playerSphere) return;

    const playerScore = Math.floor(
      circleAreaFromRadius(player.r) * 100
    ).toString();

    scoreText.textContent = playerScore;

    const sortedPlayers = game.players.toArray();
    sortedPlayers.sort(compareSphereByRadius);

    let playerRank = 0;
    for (let i = 0; i < sortedPlayers.length; i++) {
      if (sortedPlayers[i] === player) {
        playerRank = i + 1;
        break;
      }
    }

    for (let i = 0; i < 5; i++) {
      const rankItem = rankItems[i];

      rankItem.children[1].textContent = sortedPlayers[i].name;
      rankItem.children[2].textContent = Math.floor(
        circleAreaFromRadius(sortedPlayers[i].r) * 100
      ).toString();

      if (sortedPlayers[i] === player) {
        rankItem.classList.add('player-rank');
      } else {
        rankItem.classList.remove('player-rank');
      }
    }

    if (playerRank < 6) {
      rankItems[5].style.display = 'none';
    } else {
      rankItems[5].style.display = 'flex';

      rankItems[5].children[0].textContent = playerRank.toString();
      rankItems[5].children[1].textContent = player.name;
      rankItems[5].children[2].textContent = playerScore;
    }

    setTimeout(updateScore, 1000);
  };

  updateScore();
};
