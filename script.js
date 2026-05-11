const boardEl = document.querySelector("#board");
const canvas = document.querySelector("#lineCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const leftCountEl = document.querySelector("#leftCount");
const levelEl = document.querySelector("#level");
const timerEl = document.querySelector("#timer");
const messageEl = document.querySelector("#message");
const hintButton = document.querySelector("#hintButton");
const shuffleButton = document.querySelector("#shuffleButton");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");
const pauseOverlay = document.querySelector("#pauseOverlay");
const modal = document.querySelector("#resultModal");
const resultTitle = document.querySelector("#resultTitle");
const resultText = document.querySelector("#resultText");
const modalRestartButton = document.querySelector("#modalRestartButton");

const ROWS = 9;
const COLS = 8;
const HIGH_SCORE_KEY = "mahjong-link-high-score";
const NUMBERS = ["", "一", "二", "三", "四", "伍", "六", "七", "八", "九"];
const GREEN = "green";
const RED = "red";
const BLACK = "black";

const LEVELS = [
  { name: "第一关", time: 180, hints: 4, shuffles: 2, minPairs: 10, kinds: ["wan", "dragon"] },
  { name: "第二关", time: 120, hints: 3, shuffles: 1, minPairs: 7, kinds: ["wan", "bamboo", "dragon"] },
  { name: "第三关", time: 90, hints: 2, shuffles: 1, minPairs: 4, kinds: ["wan", "bamboo", "dot", "wind", "dragon"] },
];

const ICONS = [
  ...Array.from({ length: 9 }, (_, i) => ({ kind: "wan", value: i + 1, name: `${NUMBERS[i + 1]}万` })),
  ...Array.from({ length: 9 }, (_, i) => ({ kind: "bamboo", value: i + 1, name: `${NUMBERS[i + 1]}条` })),
  ...Array.from({ length: 9 }, (_, i) => ({ kind: "dot", value: i + 1, name: `${NUMBERS[i + 1]}筒` })),
  { kind: "wind", value: "东", name: "东风" },
  { kind: "wind", value: "南", name: "南风" },
  { kind: "wind", value: "西", name: "西风" },
  { kind: "wind", value: "北", name: "北风" },
  { kind: "dragon", value: "中", name: "红中" },
  { kind: "dragon", value: "發", name: "发财" },
  { kind: "dragon", value: "白", name: "白板" },
];

const DOT_LAYOUTS = {
  2: [{ x: 36, y: 33, color: GREEN }, { x: 36, y: 70, color: GREEN }],
  3: [{ x: 24, y: 28, color: GREEN }, { x: 36, y: 52, color: RED }, { x: 50, y: 76, color: BLACK }],
  4: [{ x: 24, y: 32, color: GREEN }, { x: 49, y: 32, color: BLACK }, { x: 24, y: 72, color: BLACK }, { x: 49, y: 72, color: GREEN }],
  5: [{ x: 24, y: 30, color: GREEN }, { x: 49, y: 30, color: BLACK }, { x: 36, y: 52, color: RED }, { x: 24, y: 75, color: BLACK }, { x: 49, y: 75, color: GREEN }],
  6: [{ x: 25, y: 28, color: GREEN }, { x: 47, y: 28, color: GREEN }, { x: 25, y: 54, color: RED }, { x: 47, y: 54, color: RED }, { x: 25, y: 78, color: RED }, { x: 47, y: 78, color: RED }],
  7: [{ x: 22, y: 27, color: GREEN }, { x: 36, y: 39, color: GREEN }, { x: 50, y: 51, color: GREEN }, { x: 25, y: 66, color: RED }, { x: 47, y: 66, color: RED }, { x: 25, y: 84, color: RED }, { x: 47, y: 84, color: RED }],
  8: [{ x: 25, y: 22, color: BLACK }, { x: 47, y: 22, color: BLACK }, { x: 25, y: 39, color: BLACK }, { x: 47, y: 39, color: BLACK }, { x: 25, y: 57, color: BLACK }, { x: 47, y: 57, color: BLACK }, { x: 25, y: 74, color: BLACK }, { x: 47, y: 74, color: BLACK }],
  9: [{ x: 21, y: 27, color: BLACK }, { x: 36, y: 27, color: BLACK }, { x: 51, y: 27, color: BLACK }, { x: 21, y: 52, color: RED }, { x: 36, y: 52, color: RED }, { x: 51, y: 52, color: RED }, { x: 21, y: 77, color: GREEN }, { x: 36, y: 77, color: GREEN }, { x: 51, y: 77, color: GREEN }],
};

const BAMBOO_LAYOUTS = {
  2: [{ x: 36, y: 32, color: GREEN }, { x: 36, y: 72, color: GREEN }],
  3: [{ x: 36, y: 31, color: RED }, { x: 25, y: 72, color: GREEN }, { x: 47, y: 72, color: GREEN }],
  4: [{ x: 25, y: 32, color: GREEN }, { x: 47, y: 32, color: GREEN }, { x: 25, y: 72, color: GREEN }, { x: 47, y: 72, color: GREEN }],
  5: [{ x: 24, y: 29, color: GREEN }, { x: 48, y: 29, color: GREEN }, { x: 36, y: 52, color: RED }, { x: 24, y: 76, color: GREEN }, { x: 48, y: 76, color: GREEN }],
  6: [{ x: 22, y: 31, color: GREEN }, { x: 36, y: 31, color: GREEN }, { x: 50, y: 31, color: GREEN }, { x: 22, y: 73, color: GREEN }, { x: 36, y: 73, color: GREEN }, { x: 50, y: 73, color: GREEN }],
  7: [{ x: 36, y: 25, color: RED }, { x: 22, y: 48, color: GREEN }, { x: 36, y: 48, color: GREEN }, { x: 50, y: 48, color: GREEN }, { x: 22, y: 78, color: GREEN }, { x: 36, y: 78, color: GREEN }, { x: 50, y: 78, color: GREEN }],
  9: [{ x: 21, y: 27, color: GREEN }, { x: 36, y: 27, color: RED }, { x: 51, y: 27, color: GREEN }, { x: 21, y: 52, color: GREEN }, { x: 36, y: 52, color: RED }, { x: 51, y: 52, color: GREEN }, { x: 21, y: 77, color: GREEN }, { x: 36, y: 77, color: RED }, { x: 51, y: 77, color: GREEN }],
};

let grid = [];
let selected = null;
let score = 0;
let highScore = loadHighScore();
let timeLeft = 0;
let timerId = null;
let locked = false;
let paused = false;
let hintsLeft = 0;
let shufflesLeft = 0;
let currentLevel = 0;

function init() {
  try {
    startGame();
    bindEvents();
  } catch (error) {
    showFatalError(error);
  }
}

function startGame() {
  score = 0;
  currentLevel = 0;
  modal.classList.add("hidden");
  startLevel();
}

function startLevel() {
  const level = getLevelConfig();
  timeLeft = level.time;
  hintsLeft = level.hints;
  shufflesLeft = level.shuffles;
  selected = null;
  locked = false;
  paused = false;
  pauseOverlay?.classList.add("hidden");
  buildGrid(level);
  refreshBoard();
  updateStats();
  clearPath();
  setMessage(`${level.name}：选中两张相同麻将牌，连线不超过两次转弯就会消除。最高分 ${highScore}`);
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
}

function getLevelConfig() {
  return LEVELS[currentLevel] || LEVELS[LEVELS.length - 1];
}

function buildGrid(level) {
  const allowedTypes = ICONS
    .map((icon, type) => ({ icon, type }))
    .filter(({ icon }) => level.kinds.includes(icon.kind))
    .map(({ type }) => type);
  const pairTypes = [...allowedTypes];
  while (pairTypes.length < (ROWS * COLS) / 2) {
    pairTypes.push(allowedTypes[Math.floor(Math.random() * allowedTypes.length)]);
  }
  shuffleArray(pairTypes);
  const pieces = pairTypes.flatMap((type) => [type, type]);
  shuffleArray(pieces);

  grid = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      row,
      col,
      type: pieces[row * COLS + col],
      removed: false,
    })),
  );

  ensurePlayableBoard(level.minPairs);
}

function refreshBoard() {
  boardEl.style.setProperty("--cols", COLS);
  boardEl.style.setProperty("--rows", ROWS);
  boardEl.innerHTML = "";

  for (const tile of grid.flat()) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.row = String(tile.row);
    button.dataset.col = String(tile.col);
    button.className = tile.removed ? "tile empty" : "tile";
    button.disabled = tile.removed;
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-hidden", tile.removed ? "true" : "false");
    button.setAttribute("aria-label", tile.removed ? "空位" : `${ICONS[tile.type].name}麻将牌`);
    button.innerHTML = tile.removed ? "" : renderMahjongFace(ICONS[tile.type]);
    button.addEventListener("click", () => selectTile(tile.row, tile.col));
    boardEl.appendChild(button);
  }

  updateActionButtons();
}

function renderMahjongFace(tile) {
  return `
    <svg class="mahjong-face" viewBox="0 0 72 104" aria-hidden="true">
      <rect x="3" y="3" width="66" height="98" rx="7" fill="#ffffff" stroke="#d7d7d7" stroke-width="2"/>
      ${renderTileArt(tile)}
    </svg>
  `;
}

function renderTileArt(tile) {
  if (tile.kind === "wan") return renderWan(tile.value);
  if (tile.kind === "bamboo") return renderBamboo(tile.value);
  if (tile.kind === "dot") return renderDot(tile.value);
  return renderHonor(tile);
}

function renderWan(value) {
  return `
    <text x="36" y="36" text-anchor="middle" class="tile-text rank-text">${NUMBERS[value]}</text>
    <text x="36" y="72" text-anchor="middle" class="tile-text wan-text">萬</text>
  `;
}

function renderBamboo(value) {
  if (value === 1) {
    return `
      <path d="M35 28 C45 30 51 39 49 50 C46 65 38 75 35 88 C32 75 24 65 21 50 C19 39 25 30 35 28Z" fill="none" stroke="#0d6f3c" stroke-width="3"/>
      <path d="M35 35 C30 47 30 58 35 69 C40 58 40 47 35 35Z" fill="#d9282f"/>
      <path d="M24 46 C14 42 14 34 23 32 C30 36 31 43 24 46Z" fill="#0d6f3c"/>
      <path d="M46 46 C56 42 56 34 47 32 C40 36 39 43 46 46Z" fill="#0d6f3c"/>
      <circle cx="35" cy="27" r="4" fill="#d9282f"/>
      <path d="M18 60 C13 62 11 67 13 72 M52 60 C57 62 59 67 57 72 M24 78 C31 73 39 73 46 78" fill="none" stroke="#0d6f3c" stroke-width="3" stroke-linecap="round"/>
    `;
  }

  if (value === 8) {
    return `
      <path d="M17 30 L25 44 L36 30 L47 44 L55 30" fill="none" stroke="#168a46" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M17 66 L25 80 L36 66 L47 80 L55 66" fill="none" stroke="#168a46" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M17 22 L25 36 L36 22 L47 36 L55 22" fill="none" stroke="#168a46" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M17 58 L25 72 L36 58 L47 72 L55 58" fill="none" stroke="#168a46" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    `;
  }

  return BAMBOO_LAYOUTS[value].map((mark) => bambooStick(mark.x, mark.y, mark.color)).join("");
}

function renderDot(value) {
  if (value === 1) return dotOne();
  return DOT_LAYOUTS[value].map((mark) => dotRing(mark.x, mark.y, mark.color)).join("");
}

function renderHonor(tile) {
  if (tile.value === "白") {
    return `
      <rect x="21" y="27" width="30" height="50" rx="2" fill="#ffffff" stroke="#111827" stroke-width="3"/>
      <rect x="26" y="32" width="20" height="40" fill="none" stroke="#7d8794" stroke-width="2"/>
    `;
  }

  const color = tile.value === "中" ? "#d9282f" : tile.value === "發" ? "#168a46" : "#111827";
  return `<text x="36" y="54" text-anchor="middle" class="tile-text honor-text" fill="${color}">${tile.value}</text>`;
}

function bambooStick(x, y, colorName) {
  const body = markColor(colorName);
  return `
    <g transform="translate(${x} ${y})">
      <path d="M0 -14 C5 -10 5 -5 0 -1 C-5 -5 -5 -10 0 -14Z" fill="#ffffff" stroke="${body}" stroke-width="2"/>
      <path d="M0 14 C5 10 5 5 0 1 C-5 5 -5 10 0 14Z" fill="#ffffff" stroke="${body}" stroke-width="2"/>
      <rect x="-3.7" y="-4.2" width="7.4" height="8.4" rx="2.4" fill="${body}" stroke="#ffffff" stroke-width="0.7"/>
      <path d="M0 -11 L0 -5.5 M0 5.5 L0 11" stroke="${body}" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  `;
}

function dotOne() {
  return `
    <g transform="translate(36 52)">
      <circle r="18" fill="#ffffff" stroke="#168a46" stroke-width="3"/>
      <circle r="14" fill="none" stroke="#168a46" stroke-width="2"/>
      <path d="M-11 -2 C-7 -11 7 -11 11 -2 M-12 2 C-7 11 7 11 12 2" fill="none" stroke="#168a46" stroke-width="2"/>
      <circle r="8" fill="#ffffff" stroke="#168a46" stroke-width="2"/>
      <circle r="5" fill="#e23838" stroke="#ffffff" stroke-width="1.5"/>
    </g>
  `;
}

function dotRing(x, y, colorName) {
  const ring = markColor(colorName);
  return `
    <g transform="translate(${x} ${y})">
      <circle r="10.2" fill="#ffffff" stroke="#111827" stroke-width="1.6"/>
      <circle r="8.1" fill="none" stroke="${ring}" stroke-width="2"/>
      <circle r="5.2" fill="#ffffff" stroke="${ring}" stroke-width="1.6"/>
      <circle r="2.5" fill="${ring}"/>
    </g>
  `;
}

function markColor(name) {
  if (name === RED) return "#d9282f";
  if (name === BLACK) return "#111827";
  return "#168a46";
}

function selectTile(row, col) {
  if (locked || paused) return;
  const tile = grid[row][col];
  if (!tile || tile.removed) return;

  if (!selected) {
    selected = tile;
    markSelection();
    return;
  }

  if (selected === tile) {
    selected = null;
    markSelection();
    return;
  }

  if (selected.type !== tile.type) {
    selected = tile;
    markSelection();
    setMessage("牌面不一样，换一张试试。");
    return;
  }

  const path = findPath(selected, tile);
  if (!path) {
    selected = tile;
    markSelection();
    setMessage("这两张牌之间被挡住了。");
    return;
  }

  removePair(selected, tile, path);
}

function removePair(first, second, path) {
  locked = true;
  selected = null;
  markSelection();
  drawPath(path);
  setMessage("连上了，马上消除。");

  setTimeout(() => {
    first.removed = true;
    second.removed = true;
    timeLeft += 1;
    score += 140;
    clearPath();
    refreshBoard();
    updateStats();
    setMessage("漂亮，消除成功！奖励 +1 秒。");
  }, 150);

  setTimeout(() => {
    locked = false;
    if (getRemainingTiles().length === 0) {
      completeLevel();
      return;
    }
    if (!findAvailablePair()) {
      shuffleRemaining();
      setMessage(`没有可连接组合，已自动洗牌。现在有 ${countAvailablePairs()} 组可连。`);
    }
  }, 230);
}

function tick() {
  if (paused) return;
  timeLeft -= 1;
  updateStats();
  if (timeLeft <= 0) endGame(false);
}

function updateStats() {
  scoreEl.textContent = String(score);
  leftCountEl.textContent = String(getRemainingTiles().length);
  if (levelEl) levelEl.textContent = `${currentLevel + 1}/${LEVELS.length}`;
  timerEl.textContent = formatTime(Math.max(timeLeft, 0));
  updateActionButtons();
}

function updateActionButtons() {
  hintButton.innerHTML = `<span aria-hidden="true">?</span><small>${hintsLeft}</small>`;
  shuffleButton.innerHTML = `<span aria-hidden="true">↻</span><small>${shufflesLeft}</small>`;
  if (pauseButton) pauseButton.innerHTML = `<span aria-hidden="true">${paused ? "▶" : "Ⅱ"}</span>`;
  hintButton.disabled = hintsLeft <= 0 || locked || paused;
  shuffleButton.disabled = shufflesLeft <= 0 || locked || paused;
}

function markSelection() {
  document.querySelectorAll(".tile").forEach((el) => {
    const row = Number(el.dataset.row);
    const col = Number(el.dataset.col);
    const active = selected && selected.row === row && selected.col === col;
    el.classList.toggle("selected", Boolean(active));
  });
}

function findPath(a, b) {
  const expandedRows = ROWS + 2;
  const expandedCols = COLS + 2;
  const start = { row: a.row + 1, col: a.col + 1 };
  const target = { row: b.row + 1, col: b.col + 1 };
  const blocked = Array.from({ length: expandedRows }, () => Array(expandedCols).fill(false));

  for (const tile of grid.flat()) {
    if (!tile.removed && tile !== a && tile !== b) blocked[tile.row + 1][tile.col + 1] = true;
  }

  const dirs = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];
  const queue = [{ ...start, dir: -1, turns: 0, path: [start] }];
  const visited = new Map();

  while (queue.length) {
    const current = queue.shift();
    if (current.row === target.row && current.col === target.col) return simplifyPath(current.path).map(toBoardPoint);

    dirs.forEach((dir, dirIndex) => {
      const turns = current.dir === -1 || current.dir === dirIndex ? current.turns : current.turns + 1;
      if (turns > 2) return;
      const next = { row: current.row + dir.row, col: current.col + dir.col };
      if (next.row < 0 || next.row >= expandedRows || next.col < 0 || next.col >= expandedCols) return;
      if (blocked[next.row][next.col]) return;
      const key = `${next.row},${next.col},${dirIndex}`;
      if ((visited.get(key) ?? 3) <= turns) return;
      visited.set(key, turns);
      queue.push({ ...next, dir: dirIndex, turns, path: [...current.path, next] });
    });
  }

  return null;
}

function simplifyPath(path) {
  const result = [path[0]];
  for (let i = 1; i < path.length - 1; i += 1) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];
    const sameRow = prev.row === current.row && current.row === next.row;
    const sameCol = prev.col === current.col && current.col === next.col;
    if (!sameRow && !sameCol) result.push(current);
  }
  result.push(path[path.length - 1]);
  return result;
}

function toBoardPoint(point) {
  return { row: point.row - 1, col: point.col - 1 };
}

function findAvailablePair() {
  return findAvailablePairs(1)[0] || null;
}

function findAvailablePairs(limit = Infinity) {
  const tiles = getRemainingTiles();
  const pairs = [];
  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (tiles[i].type === tiles[j].type) {
        const path = findPath(tiles[i], tiles[j]);
        if (path) {
          pairs.push([tiles[i], tiles[j], path]);
          if (pairs.length >= limit) return pairs;
        }
      }
    }
  }
  return pairs;
}

function countAvailablePairs(limit = getLevelConfig().minPairs) {
  return findAvailablePairs(limit).length;
}

function showHint() {
  if (locked || paused) return;
  if (hintsLeft <= 0) {
    setMessage("提示次数已经用完了。");
    return;
  }
  const match = findAvailablePair();
  if (!match) {
    setMessage("暂时没有可提示的组合，请使用洗牌。");
    return;
  }
  hintsLeft -= 1;
  updateActionButtons();
  const [first, second] = match;
  document.querySelectorAll(".tile").forEach((el) => el.classList.remove("hint"));
  [first, second].forEach((tile) => {
    const el = getTileElement(tile);
    if (el) el.classList.add("hint");
  });
  setMessage("这两张可以连起来。");
  setTimeout(() => document.querySelectorAll(".tile").forEach((el) => el.classList.remove("hint")), 900);
}

function shuffleRemaining() {
  const remaining = getRemainingTiles();
  const types = remaining.map((tile) => tile.type);
  let attempts = 0;
  do {
    shuffleArray(types);
    remaining.forEach((tile, index) => {
      tile.type = types[index];
    });
    attempts += 1;
  } while (countAvailablePairs() < Math.min(getLevelConfig().minPairs, Math.floor(remaining.length / 2)) && attempts < 160);
  selected = null;
  refreshBoard();
}

function ensurePlayableBoard(minPairs = 1) {
  let attempts = 0;
  while (countAvailablePairs(minPairs) < Math.min(minPairs, Math.floor(getRemainingTiles().length / 2)) && attempts < 160) {
    const remaining = getRemainingTiles();
    const types = remaining.map((tile) => tile.type);
    shuffleArray(types);
    remaining.forEach((tile, index) => {
      tile.type = types[index];
    });
    attempts += 1;
  }
}

function getRemainingTiles() {
  return grid.flat().filter((tile) => !tile.removed);
}

function getTileElement(tile) {
  return boardEl.querySelector(`[data-row="${tile.row}"][data-col="${tile.col}"]`);
}

function drawPath(path) {
  if (!path || path.length < 2) return;
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const points = path.map(cellCenter);
  strokePath(points, 12, "rgba(255, 255, 255, 0.96)");
  strokePath(points, 6, "#0084ff");
}

function strokePath(points, width, color) {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.stroke();
}

function cellCenter(point) {
  const area = canvas.getBoundingClientRect();
  const metrics = getBoardMetrics(area);
  return {
    x: metrics.left + metrics.stepX * point.col,
    y: metrics.top + metrics.stepY * point.row,
  };
}

function getBoardMetrics(area) {
  const first = getTileElement(grid[0][0]).getBoundingClientRect();
  const secondCol = getTileElement(grid[0][1]).getBoundingClientRect();
  const secondRow = getTileElement(grid[1][0]).getBoundingClientRect();
  return {
    left: first.left - area.left + first.width / 2,
    top: first.top - area.top + first.height / 2,
    stepX: secondCol.left - first.left,
    stepY: secondRow.top - first.top,
  };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * scale));
  const height = Math.max(1, Math.round(rect.height * scale));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function clearPath() {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function togglePause() {
  if (locked && !paused) return;
  paused = !paused;
  selected = null;
  markSelection();
  clearPath();
  pauseOverlay?.classList.toggle("hidden", !paused);
  updateActionButtons();
  setMessage(paused ? "游戏已暂停，再按暂停按钮继续。" : `${getLevelConfig().name}：继续游戏。`);
}

function completeLevel() {
  clearInterval(timerId);
  if (currentLevel < LEVELS.length - 1) {
    currentLevel += 1;
    locked = true;
    updateStats();
    setMessage(`进入第 ${currentLevel + 1} 关，难度提高一点。`);
    setTimeout(startLevel, 800);
    return;
  }
  endGame(true);
}

function loadHighScore() {
  try {
    return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore() {
  if (score <= highScore) return false;
  highScore = score;
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
  } catch {
    // Some browsers block localStorage in private mode.
  }
  return true;
}

function endGame(won) {
  locked = true;
  clearInterval(timerId);
  const isNewRecord = saveHighScore();
  const completed = won ? LEVELS.length : currentLevel;
  resultTitle.textContent = won ? "通关成功！" : "时间到了";
  resultText.textContent = `完成 ${completed}/${LEVELS.length} 关，最终分数：${score}。最高分：${highScore}${isNewRecord ? "（新纪录）" : ""}`;
  modal.classList.remove("hidden");
}

function bindEvents() {
  hintButton.addEventListener("click", showHint);
  shuffleButton.addEventListener("click", () => {
    if (locked || paused) return;
    if (shufflesLeft <= 0) {
      setMessage("洗牌次数已经用完了。");
      return;
    }
    shufflesLeft -= 1;
    shuffleRemaining();
    updateActionButtons();
    setMessage(`棋盘已经重新洗牌。现在有 ${countAvailablePairs()} 组可连。`);
  });
  pauseButton?.addEventListener("click", togglePause);
  restartButton.addEventListener("click", startGame);
  modalRestartButton.addEventListener("click", startGame);
  window.addEventListener("resize", clearPath);
}

function shuffleArray(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

function showFatalError(error) {
  boardEl.innerHTML = "";
  leftCountEl.textContent = "0";
  setMessage(`游戏启动失败：${error.message}`);
  console.error(error);
}

init();
