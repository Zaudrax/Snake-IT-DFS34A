let snake = document.getElementById("snake");
let gameContainer = document.getElementById("game-container");
let gameOverOverlay = document.getElementById("game-over-overlay");
let gameOverScore = document.getElementById("game-over-score");
let lastDirection = "right";
let nextDirection = "right";
let directionLocked = false;
let snakeLength = 1;
let snakePositions = [{ x: 0, y: 0 }];
let gameRunning = true;

// TODO:
// - Ensure the apple never spawns on the snake.
// - Add a score system.
// - Add a dedicated game-over page.
// - Add pause/resume.

const containerSize = [
  gameContainer.style.width ? parseInt(gameContainer.style.width) : 0,
  gameContainer.style.height ? parseInt(gameContainer.style.height) : 0,
];
const snakeStyle = getComputedStyle(snake);
const snakeSize = snakeStyle.width ? parseInt(snakeStyle.width) : 50;
setInterval(loopGame, 300);
startGame();

// Updates the current movement direction from keyboard input.
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      saveDirection("left");
      break;
    case "ArrowRight":
      saveDirection("right");
      break;
    case "ArrowUp":
      saveDirection("up");
      break;
    case "ArrowDown":
      saveDirection("down");
      break;
  }
});

// Stores the last chosen direction.
function saveDirection(event) {
  if (directionLocked) return;
  if (isOppositeDirection(lastDirection, event) && snakeLength > 1) return;
  nextDirection = event;
  directionLocked = true;
}

// Returns true if nextDirection is the direct opposite of currentDirection.
function isOppositeDirection(currentDirection, nextDirection) {
  return (
    (currentDirection === "left" && nextDirection === "right") ||
    (currentDirection === "right" && nextDirection === "left") ||
    (currentDirection === "up" && nextDirection === "down") ||
    (currentDirection === "down" && nextDirection === "up")
  );
}

// Main game loop: move, detect collisions, check apple.
function loopGame() {
  if (!gameRunning) return;
  moveSnake(nextDirection);
  lastDirection = nextDirection;
  directionLocked = false;
  if (collideWithSelf()) {
    GameOver();
    return;
  }
  checkEatApple();
  if (collideWithWall()) {
    GameOver();
  }
}

// Moves the snake by one grid cell based on the active direction.
function moveSnake(event) {
  const head = snakePositions[0];
  const newHead = { x: head.x, y: head.y };

  if (event == "left") {
    newHead.x -= snakeSize;
  } else if (event == "right") {
    newHead.x += snakeSize;
  } else if (event == "up") {
    newHead.y -= snakeSize;
  } else if (event == "down") {
    newHead.y += snakeSize;
  }

  snakePositions.unshift(newHead);
  if (snakePositions.length > snakeLength) {
    snakePositions.pop();
  }

  renderSnake();
}

// Returns true when the snake collides with itself.
function collideWithSelf() {
  const head = snakePositions[0];
  for (let i = 1; i < snakePositions.length; i++) {
    const segment = snakePositions[i];
    if (head.x === segment.x && head.y === segment.y) {
      return true;
    }
  }
  return false;
}

// Returns true when the snake leaves the game container boundaries.
function collideWithWall() {
  const snakeRect = snake.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();

  if (
    snakeRect.left < containerRect.left ||
    snakeRect.right > containerRect.right ||
    snakeRect.top < containerRect.top ||
    snakeRect.bottom > containerRect.bottom
  ) {
    return true;
  }
  return false;
}

// Renders the snake head and body from tracked grid positions.
function renderSnake() {
  snake.style.left = snakePositions[0].x + "px";
  snake.style.top = snakePositions[0].y + "px";

  const bodySegments = gameContainer.getElementsByClassName("snake-body");

  while (bodySegments.length < snakeLength - 1) {
    const segment = document.createElement("div");
    segment.classList.add("snake-body");
    segment.style.width = snakeSize + "px";
    segment.style.height = snakeSize + "px";
    segment.style.position = "absolute";
    gameContainer.appendChild(segment);
  }

  while (bodySegments.length > snakeLength - 1) {
    gameContainer.removeChild(bodySegments[bodySegments.length - 1]);
  }

  for (let i = 1; i < snakePositions.length; i++) {
    const segment = bodySegments[i - 1];
    segment.style.left = snakePositions[i].x + "px";
    segment.style.top = snakePositions[i].y + "px";
  }
}

// Removes all rendered snake body segments except the head.
function removeBodySegments() {
  const bodySegments = gameContainer.getElementsByClassName("snake-body");
  while (bodySegments.length > 0) {
    gameContainer.removeChild(bodySegments[0]);
  }
}

// Resets the snake position and movement direction.
function resetSnake() {
  snakeLength = 1;
  snakePositions = [{ x: 0, y: 0 }];
  snake.style.left = "0px";
  snake.style.top = "0px";
  lastDirection = "right";
  nextDirection = "right";
  directionLocked = false;
  removeBodySegments();
}

// Creates an apple at a random position aligned to the grid.
function generateApple() {
  const apple = document.createElement("div");
  apple.classList.add("apple");
  apple.style.left =
    Math.floor(Math.random() * (containerSize[0] / snakeSize)) * snakeSize +
    "px";
  apple.style.top =
    Math.floor(Math.random() * (containerSize[1] / snakeSize)) * snakeSize +
    "px";
  gameContainer.appendChild(apple);
}

// Detects collisions between the snake and apples.
function checkEatApple() {
  const snakeRect = snake.getBoundingClientRect();
  const apples = document.getElementsByClassName("apple");

  for (let apple of apples) {
    const appleRect = apple.getBoundingClientRect();
    if (
      snakeRect.left < appleRect.right &&
      snakeRect.right > appleRect.left &&
      snakeRect.top < appleRect.bottom &&
      snakeRect.bottom > appleRect.top
    ) {
      gameContainer.removeChild(apple);
      snakeLength += 1;
      const tail = snakePositions[snakePositions.length - 1];
      snakePositions.push({ x: tail.x, y: tail.y });
      renderSnake();
      generateApple();
    }
  }
}

// Removes existing apples and spawns a new one.
function resetApple() {
  const apples = document.getElementsByClassName("apple");
  for (let apple of apples) {
    gameContainer.removeChild(apple);
  }
  generateApple();
}

// Initializes the game state at startup.
function startGame() {
  renderSnake();
  generateApple();
}

// Shows the in-game game-over overlay and pauses the loop.
function GameOver() {
  gameRunning = false;
  const score = snakeLength - 1;
  gameOverScore.textContent = `Score : ${score}`;
  gameOverOverlay.classList.remove("hidden");
}

// Hides the overlay and restarts the game.
function restartGame() {
  gameOverOverlay.classList.add("hidden");
  resetGame();
  gameRunning = true;
}

// Resets all game elements after a game over.
function resetGame() {
  resetSnake();
  resetApple();
}
