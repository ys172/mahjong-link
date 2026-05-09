const boardEl = document.querySelector("#board");
const canvas = document.querySelector("#lineCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const leftCountEl = document.querySelector("#leftCount");
const timerEl = document.querySelector("#timer");
const messageEl = document.querySelector("#message");
const hintButton = document.querySelector("#hintButton");
const shuffleButton = document.querySelector("#shuffleButton");
const restartButton = document.querySelector("#restartButton");
const modal = document.querySelector("#resultModal");
const resultTitle = document.querySelector("#resultTitle");
const resultText = document.querySelector("#resultText");
const modalRestartButton = document.querySelector("#modalRestartButton");

const IS_PHONE_PORTRAIT = window.matchMedia("(max-width: 700px) and (orientation: portrait)").matches;
const ROWS = IS_PHONE_PORTRAIT ? 17 : 8;
const COLS = IS_PHONE_PORTRAIT ? 8 : 17;
const TOTAL_TIME = 240;
const NUMBERS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const ICONS = [
  ...Array.from({ length: 9 }, (_, index) => ({ kind: "wan", value: index + 1, name: `${NUMBERS[index + 1]}万` })),
  ...Array.from({ length: 9 }, (_, index) => ({ kind: "bamboo", value: index + 1, name: `${NUMBERS[index + 1]}条` })),
  ...Array.from({ length: 9 }, (_, index) => ({ kind: "dot", value: index + 1, name: `${NUMBERS[index + 1]}筒` })),
  { kind: "wind", value: "東", name: "东风" },
  { kind: "wind", value: "南", name: "南风" },
  { kind: "wind", value: "西", name: "西风" },
  { kind: "wind", value: "北", name: "北风" },
  { kind: "dragon", value: "中", name: "红中" },
  { kind: "dragon", value: "發", name: "发财" },
  { kind: "dragon", value: "白", name: "白板" },
];

let grid = [];
let selected = null;
let score = 0;
let timeLeft = TOTAL_TIME;
let timerId = null;
let locked = false;

function startGame() {
  score = 0;
  timeLeft = TOTAL_TIME;
  selected = null;
  locked = false;
  modal.classList.add("hidden");
  buildGrid();
  renderBoard();
  updateStats();
  setMessage("选中两张相同麻将牌，路径通畅就会消除。");
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
}

function buildGrid() {
  const pieces = ICONS.flatMap((_, type) => [type, type, type, type]);

  shuffleArray(pieces);
  grid = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      row,
      col,
      type: pieces[row * COLS + col],
      removed: false,
    })),
  );

  ensurePlayableBoard();
}

function renderBoard() {
  boardEl.style.setProperty("--cols", COLS);
  boardEl.style.setProperty("--rows", ROWS);
  boardEl.innerHTML = "";

  for (const tile of grid.flat()) {
    const button = document.createElement("button");
    button.className = "tile";
    button.type = "button";
    button.dataset.row = tile.row;
    button.dataset.col = tile.col;
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `${ICONS[tile.type].name}麻将牌`);
    button.innerHTML = renderMahjongFace(ICONS[tile.type]);
    button.addEventListener("click", () => selectTile(tile.row, tile.col));
    boardEl.appendChild(button);
  }
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

  const color = tile.value === "中" ? "#d9282f" : tile.value === "發" ? "#1d7a3f" : "#111827";
  return `<text x="36" y="54" text-anchor="middle" class="tile-text honor-text" fill="${color}">${tile.value}</text>`;
}

const GREEN = "green";
const RED = "red";
const BLACK = "black";

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

function bambooStick(x, y, colorName) {
  const body = getMarkColor(colorName);
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
  const ring = getMarkColor(colorName);
  return `
    <g transform="translate(${x} ${y})">
      <circle r="10.2" fill="#ffffff" stroke="#111827" stroke-width="1.6"/>
      <circle r="8.1" fill="none" stroke="${ring}" stroke-width="2"/>
      <circle r="5.2" fill="#ffffff" stroke="${ring}" stroke-width="1.6"/>
      <circle r="2.5" fill="${ring}"/>
    </g>
  `;
}

function getMarkColor(colorName) {
  if (colorName === RED) return "#d9282f";
  if (colorName === BLACK) return "#111827";
  return "#168a46";
}

function selectTile(row, col) {
  if (locked) return;
  const tile = grid[row][col];
  if (tile.removed) return;

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
  first.removed = true;
  second.removed = true;
  score += 120 + Math.max(0, timeLeft);
  selected = null;
  markSelection();
  drawPath(path);
  updateStats();
  setMessage("漂亮，连上了！");

  setTimeout(() => {
    clearPath();
    renderRemoved();
    locked = false;

    if (getRemainingTiles().length === 0) {
      endGame(true);
      return;
    }

    if (!findAvailablePair()) {
      shuffleRemaining();
      setMessage("没有可连的组合，已经自动洗牌。");
    }
  }, 240);
}

function tick() {
  timeLeft -= 1;
  updateStats();

  if (timeLeft <= 0) {
    endGame(false);
  }
}

function updateStats() {
  scoreEl.textContent = score;
  leftCountEl.textContent = getRemainingTiles().length;
  timerEl.textContent = formatTime(Math.max(timeLeft, 0));
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function endGame(won) {
  locked = true;
  clearInterval(timerId);
  resultTitle.textContent = won ? "通关成功！" : "时间到";
  resultText.textContent = won ? `最终分数：${score}` : `还剩 ${getRemainingTiles().length} 张，分数：${score}`;
  modal.classList.remove("hidden");
}

function markSelection() {
  document.querySelectorAll(".tile").forEach((el) => {
    const row = Number(el.dataset.row);
    const col = Number(el.dataset.col);
    el.classList.toggle("selected", selected?.row === row && selected?.col === col);
  });
}

function renderRemoved() {
  document.querySelectorAll(".tile").forEach((el) => {
    const tile = grid[Number(el.dataset.row)][Number(el.dataset.col)];
    el.classList.toggle("removed", tile.removed);
  });
}

function getRemainingTiles() {
  return grid.flat().filter((tile) => !tile.removed);
}

function findPath(a, b) {
  const expandedRows = ROWS + 2;
  const expandedCols = COLS + 2;
  const start = { row: a.row + 1, col: a.col + 1 };
  const target = { row: b.row + 1, col: b.col + 1 };
  const blocked = Array.from({ length: expandedRows }, () => Array(expandedCols).fill(false));

  for (const tile of grid.flat()) {
    if (!tile.removed && tile !== a && tile !== b) {
      blocked[tile.row + 1][tile.col + 1] = true;
    }
  }

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];
  const queue = [{ ...start, dir: -1, turns: 0, path: [start] }];
  const visited = new Map();

  while (queue.length) {
    const current = queue.shift();
    if (current.row === target.row && current.col === target.col) {
      return simplifyPath(current.path).map(toBoardPoint);
    }

    directions.forEach((direction, dirIndex) => {
      const nextTurns = current.dir === -1 || current.dir === dirIndex ? current.turns : current.turns + 1;
      if (nextTurns > 2) return;

      const next = {
        row: current.row + direction.row,
        col: current.col + direction.col,
      };
      if (next.row < 0 || next.row >= expandedRows || next.col < 0 || next.col >= expandedCols) return;
      if (blocked[next.row][next.col]) return;

      const key = `${next.row},${next.col},${dirIndex}`;
      if ((visited.get(key) ?? 3) <= nextTurns) return;
      visited.set(key, nextTurns);

      queue.push({
        ...next,
        dir: dirIndex,
        turns: nextTurns,
        path: [...current.path, next],
      });
    });
  }

  return null;
}

function simplifyPath(path) {
  if (path.length <= 2) return path;
  const simplified = [path[0]];

  for (let i = 1; i < path.length - 1; i += 1) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];
    const sameRow = prev.row === current.row && current.row === next.row;
    const sameCol = prev.col === current.col && current.col === next.col;

    if (!sameRow && !sameCol) {
      simplified.push(current);
    }
  }

  simplified.push(path[path.length - 1]);
  return simplified;
}

function toBoardPoint(point) {
  return {
    row: point.row - 1,
    col: point.col - 1,
  };
}

function drawPath(path) {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  strokePath(path);
  ctx.lineWidth = 6;
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--line").trim();
  strokePath(path);
}

function strokePath(path) {
  ctx.beginPath();
  path.forEach((point, index) => {
    const pos = cellCenter(point.row, point.col);
    if (index === 0) ctx.moveTo(pos.x, pos.y);
    else ctx.lineTo(pos.x, pos.y);
  });
  ctx.stroke();
}

function cellCenter(row, col) {
  const boardRect = boardEl.getBoundingClientRect();
  const areaRect = canvas.getBoundingClientRect();

  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    return tileCenter(row, col, areaRect);
  }

  const clampedRow = Math.min(Math.max(row, 0), ROWS - 1);
  const clampedCol = Math.min(Math.max(col, 0), COLS - 1);
  const anchor = tileCenter(clampedRow, clampedCol, areaRect);

  if (row < 0) return { x: anchor.x, y: boardRect.top - areaRect.top };
  if (row >= ROWS) return { x: anchor.x, y: boardRect.bottom - areaRect.top };
  if (col < 0) return { x: boardRect.left - areaRect.left, y: anchor.y };
  return { x: boardRect.right - areaRect.left, y: anchor.y };
}

function tileCenter(row, col, areaRect) {
  const tile = getTileElement({ row, col });
  const rect = tile.getBoundingClientRect();

  return {
    x: rect.left - areaRect.left + rect.width / 2,
    y: rect.top - areaRect.top + rect.height / 2,
  };
}

function clearPath() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function findAvailablePair() {
  const tiles = getRemainingTiles();

  for (let i = 0; i < tiles.length; i += 1) {
    for (let j = i + 1; j < tiles.length; j += 1) {
      if (tiles[i].type === tiles[j].type) {
        const path = findPath(tiles[i], tiles[j]);
        if (path) return [tiles[i], tiles[j], path];
      }
    }
  }

  return null;
}

function showHint() {
  if (locked) return;
  const match = findAvailablePair();
  if (!match) {
    shuffleRemaining();
    setMessage("没有可提示的组合，已经洗牌。");
    return;
  }

  const [first, second, path] = match;
  drawPath(path);
  document.querySelectorAll(".tile").forEach((el) => el.classList.remove("hint"));
  [first, second].forEach((tile) => getTileElement(tile).classList.add("hint"));
  setMessage("这两张可以连起来。");

  setTimeout(() => {
    clearPath();
    document.querySelectorAll(".tile").forEach((el) => el.classList.remove("hint"));
  }, 900);
}

function getTileElement(tile) {
  return boardEl.querySelector(`[data-row="${tile.row}"][data-col="${tile.col}"]`);
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
  } while (!findAvailablePair() && attempts < 80);

  renderBoard();
  renderRemoved();
}

function ensurePlayableBoard() {
  let attempts = 0;

  while (!findAvailablePair() && attempts < 40) {
    const types = getRemainingTiles().map((tile) => tile.type);
    shuffleArray(types);
    getRemainingTiles().forEach((tile, index) => {
      tile.type = types[index];
    });
    attempts += 1;
  }
}

function shuffleArray(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
}

hintButton.addEventListener("click", showHint);
shuffleButton.addEventListener("click", () => {
  if (locked) return;
  shuffleRemaining();
  setMessage("棋盘已经重新洗牌。");
});
restartButton.addEventListener("click", startGame);
modalRestartButton.addEventListener("click", startGame);
window.addEventListener("resize", clearPath);
window.addEventListener("orientationchange", () => {
  setTimeout(() => window.location.reload(), 250);
});

startGame();
