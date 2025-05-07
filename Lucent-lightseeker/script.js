const player = document.getElementById("player");
const lightOrb = document.getElementById("light-orb");
const gameArea = document.getElementById("game-area");
const goal = document.getElementById("goal");
const levelLabel = document.getElementById("level-num");

let posX = 100;
let posY = 100;
const speed = 4;
const keys = {};
let currentLevel = 0;
let orbCollected = false;

const levels = [
  {
    type: "manual",
    start: { x: 100, y: 100 },
    goal: { x: 600, y: 300 },
    orb: { x: 300, y: 150 },
    walls: [
      { x: 200, y: 200 }, { x: 240, y: 200 },
      { x: 200, y: 240 }, { x: 280, y: 240 },
      { x: 240, y: 280 }, { x: 280, y: 280 }
    ],
    hiddenWalls: [
      { x: 400, y: 200 }, { x: 440, y: 200 },
      { x: 400, y: 240 }
    ]
  },
  {
    type: "manual",
    start: { x: 60, y: 60 },
    goal: { x: 600, y: 400 },
    orb: { x: 120, y: 250 },
    walls: [
      { x: 100, y: 100 }, { x: 140, y: 100 },
      { x: 180, y: 100 }, { x: 180, y: 140 },
      { x: 180, y: 180 }, { x: 140, y: 180 }
    ],
    hiddenWalls: [
      { x: 400, y: 200 }, { x: 440, y: 200 },
      { x: 480, y: 200 }
    ]
  }
];

function generateRandomLevel() {
  const size = 40;
  const numWalls = 25;
  const numHidden = 10;

  const walls = [], hiddenWalls = [];
  for (let i = 0; i < numWalls; i++) {
    walls.push({
      x: Math.floor(Math.random() * 15) * size,
      y: Math.floor(Math.random() * 10) * size
    });
  }
  for (let i = 0; i < numHidden; i++) {
    hiddenWalls.push({
      x: Math.floor(Math.random() * 15) * size,
      y: Math.floor(Math.random() * 10) * size
    });
  }

  return {
    type: "random",
    start: { x: 40, y: 40 },
    goal: { x: 640, y: 440 },
    orb: { x: 320, y: 200 },
    walls,
    hiddenWalls
  };
}

function loadLevel(index) {
  orbCollected = false;
  gameArea.querySelectorAll(".wall, .hidden-wall, .reveal-orb").forEach(e => e.remove());

  if (index >= levels.length) {
    levels.push(generateRandomLevel());
  }

  const level = levels[index];
  posX = level.start.x;
  posY = level.start.y;

  level.walls.forEach(w => {
    const wall = document.createElement("div");
    wall.classList.add("wall");
    wall.style.left = w.x + "px";
    wall.style.top = w.y + "px";
    gameArea.appendChild(wall);
  });

  level.hiddenWalls.forEach(hw => {
    const wall = document.createElement("div");
    wall.classList.add("hidden-wall");
    wall.style.left = hw.x + "px";
    wall.style.top = hw.y + "px";
    gameArea.appendChild(wall);
  });

  const orb = document.createElement("div");
  orb.classList.add("reveal-orb");
  orb.style.left = level.orb.x + "px";
  orb.style.top = level.orb.y + "px";
  gameArea.appendChild(orb);

  goal.style.left = level.goal.x + "px";
  goal.style.top = level.goal.y + "px";

  levelLabel.innerText = index + 1;
}

document.addEventListener("keydown", (e) => (keys[e.key.toLowerCase()] = true));
document.addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = false));

function isColliding(x, y, selector) {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements).some(el => {
    const r = el.getBoundingClientRect();
    return (
      x < r.right && x + 40 > r.left &&
      y < r.bottom && y + 40 > r.top
    );
  });
}

function gameLoop() {
  let nextX = posX;
  let nextY = posY;

  if (keys["w"]) nextY -= speed;
  if (keys["s"]) nextY += speed;
  if (keys["a"]) nextX -= speed;
  if (keys["d"]) nextX += speed;

  if (!isColliding(nextX, posY, ".wall") &&
      (!isColliding(nextX, posY, ".hidden-wall") || orbCollected)) posX = nextX;

  if (!isColliding(posX, nextY, ".wall") &&
      (!isColliding(posX, nextY, ".hidden-wall") || orbCollected)) posY = nextY;

  player.style.left = posX + "px";
  player.style.top = posY + "px";
  lightOrb.style.left = (posX - 20) + "px";
  lightOrb.style.top = (posY - 20) + "px";

  // Orb reveal
  const orb = document.querySelector(".reveal-orb");
  if (orb && isColliding(posX, posY, ".reveal-orb")) {
    orb.remove();
    orbCollected = true;
    document.querySelectorAll(".hidden-wall").forEach(hw => {
      hw.style.background = "#555";
      hw.style.boxShadow = "0 0 8px #aaa";
    });
  }

  // Goal reached
  const g = goal.getBoundingClientRect();
  if (
    posX + 20 > g.left && posX < g.right &&
    posY + 20 > g.top && posY < g.bottom
  ) {
    currentLevel++;
    loadLevel(currentLevel);
  }

  requestAnimationFrame(gameLoop);
}

loadLevel(currentLevel);
gameLoop();
