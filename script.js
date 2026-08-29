const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const coinCount = document.getElementById("coinCount");
const statusText = document.getElementById("statusText");
const gameMessage = document.getElementById("gameMessage");
const messageTitle = document.getElementById("messageTitle");
const messageDetail = document.getElementById("messageDetail");

const worldWidth = 4200;
const keys = {};
let player;
let cameraX = 0;
let coins;
let enemies;
let gameState = "playing";

const platforms = [
    { x: 0, y: 470, w: 720, h: 70 }, { x: 820, y: 410, w: 300, h: 35 },
    { x: 1210, y: 470, w: 620, h: 70 }, { x: 1930, y: 360, w: 270, h: 35 },
    { x: 2280, y: 450, w: 470, h: 90 }, { x: 2850, y: 390, w: 330, h: 35 },
    { x: 3310, y: 470, w: 890, h: 70 },
    { x: 1010, y: 300, w: 150, h: 22 }, { x: 1530, y: 330, w: 170, h: 22 },
    { x: 2500, y: 290, w: 150, h: 22 }, { x: 3500, y: 320, w: 180, h: 22 }
];

function reset() {
    player = { x: 100, y: 400, w: 28, h: 40, vx: 0, vy: 0, grounded: false };
    coins = [250, 505, 900, 1060, 1320, 1600, 2000, 2390, 2570, 2940, 3520, 3650, 3900]
        .map((x, i) => ({ x, y: [420, 420, 360, 250, 420, 290, 310, 400, 240, 340, 420, 270, 420][i], taken: false }));
    enemies = [{ x: 570, y: 430, w: 28, h: 40, min: 480, max: 680, vx: 1.2 },
        { x: 1430, y: 430, w: 28, h: 40, min: 1270, max: 1760, vx: 1.4 },
        { x: 2440, y: 410, w: 28, h: 40, min: 2320, max: 2700, vx: 1.1 }];
    cameraX = 0; gameState = "playing"; gameMessage.classList.add("hidden"); updateHud();
}

function updateHud() {
    coinCount.textContent = `${coins.filter(c => c.taken).length} / ${coins.length}`;
    statusText.textContent = gameState === "playing" ? "RUN!" : gameState === "won" ? "CLEAR" : "TRY AGAIN";
}
function overlaps(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function endGame(state) {
    gameState = state; statusText.textContent = state === "won" ? "CLEAR" : "TRY AGAIN";
    messageTitle.textContent = state === "won" ? "ゴールに到着！" : "もう一度挑戦";
    messageDetail.textContent = state === "won" ? `${coins.filter(c => c.taken).length}枚のコインを集めました。` : "足場から落ちるか、敵に触れました。";
    gameMessage.classList.remove("hidden");
}

function update() {
    if (gameState !== "playing") return;
    const left = keys.ArrowLeft || keys.a, right = keys.ArrowRight || keys.d;
    player.vx = (right ? 4.4 : 0) - (left ? 4.4 : 0); player.vy += .55; player.vy = Math.min(player.vy, 13);
    const oldBottom = player.y + player.h; player.x = Math.max(0, Math.min(worldWidth - player.w, player.x + player.vx)); player.y += player.vy; player.grounded = false;
    platforms.forEach(p => {
        if (player.vy >= 0 && oldBottom <= p.y && player.y + player.h >= p.y && player.x + player.w > p.x && player.x < p.x + p.w) {
            player.y = p.y - player.h; player.vy = 0; player.grounded = true;
        }
    });
    if ((keys[" "] || keys.ArrowUp || keys.w) && player.grounded) { player.vy = -12; player.grounded = false; }
    enemies.forEach(e => { e.x += e.vx; if (e.x < e.min || e.x > e.max) e.vx *= -1; if (overlaps(player, e)) endGame("lost"); });
    coins.forEach(c => { if (!c.taken && Math.hypot(player.x + player.w / 2 - c.x, player.y + player.h / 2 - c.y) < 28) c.taken = true; });
    if (player.y > canvas.height + 100) endGame("lost");
    if (player.x > 3990) endGame("won");
    cameraX += (player.x - cameraX - 260) * .08; cameraX = Math.max(0, Math.min(worldWidth - canvas.width, cameraX)); updateHud();
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#090d1b");
    gradient.addColorStop(0.5, "#10172d");
    gradient.addColorStop(1, "#171a2b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < canvas.width; i += 42) {
        ctx.fillStyle = "rgba(83, 245, 255, 0.08)";
        ctx.fillRect(i, 0, 1, canvas.height);
    }

    ctx.save();
    ctx.translate(-cameraX, 0);

    for (let i = 0; i < worldWidth; i += 80) {
        ctx.fillStyle = "rgba(83, 245, 255, 0.12)";
        ctx.fillRect(i, 120, 24, 2);
    }

    platforms.forEach(p => {
        ctx.fillStyle = "#120d24";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = "rgba(83, 245, 255, 0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
        ctx.fillStyle = "rgba(83, 245, 255, 0.65)";
        ctx.fillRect(p.x, p.y, p.w, 5);
    });

    coins.forEach(c => {
        if (!c.taken) {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.fillStyle = "rgba(255, 184, 77, 0.25)";
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffb84d";
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff3cf";
            ctx.beginPath();
            ctx.arc(-3, -3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });

    enemies.forEach(e => {
        ctx.fillStyle = "rgba(255, 79, 216, 0.2)";
        ctx.fillRect(e.x - 4, e.y - 4, e.w + 8, e.h + 8);
        ctx.fillStyle = "#ff4fd8";
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = "#1d1127";
        ctx.fillRect(e.x + 6, e.y + 10, 5, 5);
        ctx.fillRect(e.x + 18, e.y + 10, 5, 5);
    });

    ctx.fillStyle = "#a8ff5c";
    ctx.fillRect(4010, 270, 6, 200);
    ctx.fillStyle = "rgba(255, 79, 216, 0.9)";
    ctx.beginPath();
    ctx.moveTo(4016, 275);
    ctx.lineTo(4093, 295);
    ctx.lineTo(4016, 315);
    ctx.fill();

    ctx.fillStyle = "rgba(83, 245, 255, 0.18)";
    ctx.fillRect(player.x - 8, player.y - 10, player.w + 16, player.h + 18);
    ctx.fillStyle = "#53f5ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = "#dffcff";
    ctx.fillRect(player.x + 7, player.y + 8, 5, 5);
    ctx.fillRect(player.x + 18, player.y + 8, 5, 5);
    ctx.fillStyle = "rgba(255, 79, 216, 0.75)";
    ctx.fillRect(player.x + 8, player.y + 28, 12, 5);

    ctx.restore();
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
window.addEventListener("keydown", e => { keys[e.key] = true; if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault(); });
window.addEventListener("keyup", e => { keys[e.key] = false; });
document.getElementById("restartButton").addEventListener("click", reset);
document.getElementById("messageButton").addEventListener("click", reset);
reset(); loop();
