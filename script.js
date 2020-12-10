const STARTING_SPEED = 0.2;
const INCREASE_SPEED_FACTOR = 1.2;
const STARTING_SNAKE_SIZE = 3;
const STARTING_POS = [2, 2];
const STORAGE_KEY = 'snake-leaderboard';
const GRID_SIZE = 20;
let i, j;

let leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (leaderboard === null) {
  console.log('No local leaderboard found.');
  leaderboard = {};
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
}

if (Object.keys(leaderboard).length > 0) {
  const main = document.getElementsByTagName('main').item(0);
  const lb = document.createElement('div');
  lb.className = 'leaderboard';
  const container = document.createElement('div');
  container.id = 'leaderboard';
  const h2 = document.createElement('h2');
  h2.innerText = 'Leaderboard';
  lb.appendChild(h2);
  lb.appendChild(container);
  main.appendChild(lb);
  main.style.gridTemplateColumns = '1fr 1fr';
  Object.keys(leaderboard)
    .sort((prev, next) => leaderboard[next].score - leaderboard[prev].score + 1)
    .map((time) => {
      const date = new Date(time);
      const div = document.createElement('div');
      div.className = 'lb-row';
      const nameDiv = document.createElement('div');
      nameDiv.innerText = leaderboard[time].name;
      const pointsDiv = document.createElement('div');
      pointsDiv.innerText = leaderboard[time].score;
      const timeDiv = document.createElement('div');
      timeDiv.innerText =
        date.getDate().toString().padStart(2, '0') +
        '/' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        date.getFullYear() +
        ' - ' +
        date.getHours().toString().padStart(2, '0') +
        ':' +
        date.getMinutes().toString().padStart(2, '0');
      div.appendChild(nameDiv);
      div.appendChild(timeDiv);
      div.appendChild(pointsDiv);
      container.appendChild(div);
    });
}

const GRID_PARENT = document.getElementById('grid');
const grid = [];
let row;
for (i = 0; i < GRID_SIZE; i++) {
  grid[i] = [];
  GRID_PARENT.innerHTML += `<div class="row" id="row${i}"></div>`;
  row = document.getElementById(`row${i}`);
  for (j = 0; j < GRID_SIZE; j++) {
    grid[i].push(0);
    row.innerHTML += `<div class="cell" id="col${j}"></div>`;
  }
}

const generateFood = (snake, lastFood) => {
  if (lastFood) {
    grid[lastFood[0]][lastFood[1]] = 0;
  }
  let f = [
    Math.round(Math.random() * (GRID_SIZE - 1)),
    Math.round(Math.random() * (GRID_SIZE - 1))
  ];
  while (snake.some((p) => p[0] === f[0] && p[1] === f[1]))
    f = [
      Math.round(Math.random() * (GRID_SIZE - 1)),
      Math.round(Math.random() * (GRID_SIZE - 1))
    ];
  console.log('new food at', f);
  return f;
};

const paint = (grid, snake, food) => {
  for (i = 0; i < GRID_SIZE; i++) {
    row = document.getElementById(`row${i}`);
    for (j = 0; j < GRID_SIZE; j++) {
      const cell = row.querySelector(`#col${j}`);
      if (snake.some((p) => p[0] === i && p[1] === j)) {
        grid[i][j] = 1;
        if (i === snake[0][0] && j === snake[0][1]) {
          // Is head
          const neck = snake[1];
          if (neck[1] === snake[0][1] + 1) {
            cell.className = 'cell snake head head-left';
          }
          if (neck[1] === snake[0][1] - 1) {
            cell.className = 'cell snake head head-right';
          }
          if (neck[0] === snake[0][0] + 1) {
            cell.className = 'cell snake head head-down';
          }
          if (neck[0] === snake[0][0] - 1) {
            cell.className = 'cell snake head head-up';
          }
        } else cell.className = 'cell snake';
      } else if (i === food[0] && j === food[1]) {
        grid[i][j] = 2;
        cell.className = 'cell food';
      } else {
        grid[i][j] = 0;
        cell.className = 'cell';
      }
    }
  }
};

const walk = (snake, direction) => {
  switch (direction) {
    case 'r':
      if (snake[0][1] === GRID_SIZE - 1) return -1;
      if (snake.some((p) => p[0] === snake[0][0] && p[1] === snake[0][1] + 1))
        return -1;
      return [[snake[0][0], snake[0][1] + 1], ...snake];
    case 'l':
      if (snake[0][1] === 0) return -1;
      if (snake.some((p) => p[0] === snake[0][0] && p[1] === snake[0][1] - 1))
        return -1;
      return [[snake[0][0], snake[0][1] - 1], ...snake];
    case 'u':
      if (snake[0][0] === 0) return -1;
      if (snake.some((p) => p[0] === snake[0][0] - 1 && p[1] === snake[0][1]))
        return -1;
      return [[snake[0][0] - 1, snake[0][1]], ...snake];
    case 'd':
      if (snake[0][0] === GRID_SIZE - 1) return -1;
      if (snake.some((p) => p[0] === snake[0][0] + 1 && p[1] === snake[0][1]))
        return -1;
      return [[snake[0][0] + 1, snake[0][1]], ...snake];
    default:
      return snake;
  }
};

let speed = STARTING_SPEED;
let direction = 'r';

let snake = [STARTING_POS];
let snakeSize = STARTING_SNAKE_SIZE;

let food = generateFood(snake);
grid[food[0]][food[1]] = 2;

document.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      if (direction !== 'r') {
        direction = 'l';
        timeoutStack.forEach((id) => {
          clearTimeout(id);
        });
        game(speed);
      }
      break;
    case 'ArrowRight':
      if (direction !== 'l') {
        direction = 'r';
        timeoutStack.forEach((id) => {
          clearTimeout(id);
        });
        game(speed);
      }
      break;
    case 'ArrowUp':
      if (direction !== 'd') {
        direction = 'u';
        timeoutStack.forEach((id) => {
          clearTimeout(id);
        });
        game(speed);
      }
      break;
    case 'ArrowDown':
      if (direction !== 'u') {
        direction = 'd';
        timeoutStack.forEach((id) => {
          clearTimeout(id);
        });
        game(speed);
      }
      break;
    default:
      return;
  }
});

let timeoutStack = [];

const tickGame = (tick) => {
  timeoutStack.push(
    setTimeout(() => {
      game();
    }, tick * 1000)
  );
};

const game = () => {
  snake = walk(snake, direction);
  if (snake === -1) {
    const h1 = document.getElementsByTagName('h1').item(0);
    h1.innerHTML = 'You lost.';
    h1.className = 'lost';
    // Save user on leaderboard
    if (snakeSize - 3 > 0) {
      const name = prompt('Enter your name for the leaderboard', 'Unknown');
      if (name) {
        const date = new Date();
        leaderboard[date.toUTCString()] = { name, score: snakeSize - 3 };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
      }
    }
    return;
  } else {
    snake = snake.slice(0, snakeSize);
  }
  if (snake[0][0] === food[0] && snake[0][1] === food[1]) {
    snakeSize++;
    if (snakeSize % 3 === 0) {
      speed /= INCREASE_SPEED_FACTOR;
    }
    food = generateFood(snake, food);
    grid[food[0]][food[1]] = 2;
  }
  paint(grid, snake, food);
  tickGame(speed);
  const dataTags = document.getElementsByTagName('data');
  dataTags.item(0).innerHTML = snakeSize - STARTING_SNAKE_SIZE;
  dataTags.item(1).innerHTML = Math.round(1 / speed);
};

tickGame(speed);
