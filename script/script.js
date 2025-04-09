console.log("Script is geladen");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

const gridSize = 20;

let snake = [{ x: 200, y: 200 }];
let food = getRandomFoodPosition();
let powerUp = null;
let isInvincible = false;
let powerUpTimeout;
let powerUpTimer = 0; // Timer variabele
let directionChanged = false;
let direction = "RIGHT";
let score = 0;
let highscore = 0;
let gameOver = false;
const initialSnakeSpeed = 250;
let snakeSpeed = initialSnakeSpeed;
let gameInterval;
let foodEaten = 0;
let showSpeedIncreaseText = false;
let speedTextTimeout;
let obstacles = [];

// Functie om een rechthoek te tekenen (gebruikt voor de slang en het voedsel)
function drawRect(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridSize, gridSize);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, gridSize, gridSize);
}

// Functie om de power-up te tekenen (stervormige power-up)
function drawPowerUp() {
    if (!powerUp) return;
    ctx.beginPath();
    const cx = powerUp.x + gridSize / 2;
    const cy = powerUp.y + gridSize / 2;
    const spikes = 5;
    const outerRadius = gridSize / 2;
    const innerRadius = gridSize / 4;
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = "gold";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Voeg deze regel toe om de timer elke seconde bij te werken
setInterval(updateTimer, 1000); // Dit zorgt ervoor dat updateTimer elke seconde wordt aangeroepen

function updateTimer() {
    if (isInvincible) {
        if (powerUpTimer > 0) {
            powerUpTimer--;
        } else {
            isInvincible = false;
            clearTimeout(powerUpTimeout);
        }
    }
}

// Teken de timer in retro-stijl
function drawTimer() {
    if (isInvincible) {
        const fontSize = 24; // Stel het lettertype formaat in
        ctx.font = `${fontSize}px 'Press Start 2P', sans-serif`;  // Retro lettertype
        ctx.fillStyle = "white";  // Witte tekstkleur
        ctx.fillText(`Time: ${powerUpTimer}s`, 10, 30);  // Tekst links boven
    }
}


function updateTimer() {
    if (isInvincible) {
        // Als de power-up actief is, verminder de timer elke seconde
        if (powerUpTimer > 0) {
            powerUpTimer--;
        }
    }
}

// Functie om de timer in retro-stijl te tekenen
function drawTimer() {
    if (isInvincible) {
        const fontSize = 24; // Stel het lettertype formaat in
        ctx.font = `${fontSize}px 'Press Start 2P', sans-serif`;  // Retro lettertype
        ctx.fillStyle = "white";  // Witte tekstkleur
        ctx.fillText(`Time: ${powerUpTimer}s`, 10, 30);  // Tekst links boven
    }
}


// Genereer een random locatie voor de power-up
function getRandomPowerUpPosition() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
    } while (
        snake.some(seg => seg.x === pos.x && seg.y === pos.y) ||
        (food && food.x === pos.x && food.y === pos.y) ||
        obstacles.some(obstacle => obstacle.some(block => block.x === pos.x && block.y === pos.y))
    );
    return pos;
}

function checkPowerUpPickup() {
    if (!powerUp) return;

    // Controleer of de kop van de slang de power-up raakt
    if (snake[0].x === powerUp.x && snake[0].y === powerUp.y) {
        powerUp = null; // Verwijder de power-up
        isInvincible = true; // Zet onsterfelijkheid aan
        powerUpTimer = 10; // Zet de timer op 10 seconden
        clearTimeout(powerUpTimeout);
        powerUpTimeout = setTimeout(() => {
            isInvincible = false; // Zet onsterfelijkheid uit na 10 seconden
        }, 10000); // Power-up duurt nu 10 seconden
    }
}


// Laat om de 40 seconden een power-up spawnen
setInterval(() => {
    if (!gameOver && !powerUp) {
        powerUp = getRandomPowerUpPosition();
    }
}, 40000); // Elke 40 sec


// Functie om de slang met afgeronde hoeken te tekenen
function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0; // Het eerste segment is de kop
        const color = isHead ? "green" : "lime"; // Hoofd van de slang is anders van kleur
        const radius = gridSize / 4; // Strakke ronde hoeken

        ctx.beginPath();
        ctx.arc(segment.x + gridSize / 2, segment.y + gridSize / 2, radius, 0, Math.PI * 2); // Rond de hoeken af
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "black"; // Zwarte rand voor duidelijkheid
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// Aangepaste functie om een kleine appel te tekenen
function drawFood() {
    // Hier teken ik een eenvoudige appel als een klein symbool
    // We maken een klein vierkant voor de appel
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 3, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Teken de steel van de appel (kleine lijn boven de appel)
    ctx.beginPath();
    ctx.moveTo(food.x + gridSize / 2, food.y + gridSize / 3);
    ctx.lineTo(food.x + gridSize / 2, food.y - gridSize / 3);
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Functie om het raster van witte lijnen te tekenen
function drawGrid() {
    ctx.strokeStyle = "white"; // Witte lijn voor het raster
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Maak het canvas schoon

    // Teken het raster op de achtergrond
    drawGrid();

    // Teken de slang met afgeronde hoeken
    drawSnake();

    // Teken het voedsel
    drawFood();

    // Teken de power-up
    drawPowerUp();

    // Teken de timer als de power-up actief is
    drawTimer();

    // Teken alle obstakels
    obstacles.forEach(obstacle => {
        obstacle.forEach(block => drawRect(block.x, block.y, "blue"));
    });

    // Update de score en highscore in de HTML
    document.getElementById('score').textContent = score;
    document.getElementById('highscore').textContent = highscore;
}

// In de game loop, update de timer
function gameLoop() {
    updateTimer();  // Update de timer
    moveSnake();
    drawGame();
}


function moveSnake() {
    if (gameOver) return;
    directionChanged = false; //
    let head = { ...snake[0] };  // Maak een kopie van de huidige kop van de slang
        
    // Verander de positie van de kop op basis van de richting
    switch (direction) {
        case "UP": head.y -= gridSize; break;
        case "DOWN": head.y += gridSize; break;
        case "LEFT": head.x -= gridSize; break;
        case "RIGHT": head.x += gridSize; break;
    }

    let hitSelf = snake.some((seg, index) => index !== 0 && seg.x === head.x && seg.y === head.y);
let hitObstacle = obstacles.some(obstacle => obstacle.some(block => block.x === head.x && block.y === head.y));
    
    // Controleer of de slang tegen de muur botst, zichzelf raakt of tegen het obstakel botst
if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
) {
    endGame();
    return;
}

// Alleen controleren op obstakels en jezelf als je NIET onsterfelijk bent
if (!isInvincible && (hitSelf || hitObstacle)) {
    endGame();
    return;
}

    
    snake.unshift(head);  // Voeg een nieuwe kop toe aan de slang
    // Controleer of de slang het voedsel heeft gegeten
    if (head.x === food.x && head.y === food.y) {
        score += 10;  // Verhoog de score
        foodEaten++;  // Verhoog het aantal gegeten voedsel
        food = getRandomFoodPosition();  // Genereer nieuw voedsel

        // Speel het geluid af en toon de alert
        playAppleSoundAndAlert();  

        // Elke 3 gegeten voedsel, verhoog de snelheid
// Elke 3 gegeten voedsel, verhoog de snelheid
if (foodEaten % 3 === 0) {
    snakeSpeed = Math.max(50, snakeSpeed - 20);  // Verhoog de snelheid
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        moveSnake();
        drawGame();
    }, snakeSpeed);

    // === Toon SPEED INCREASED melding ===
    showSpeedIncreaseText = true;

    const speedUpSound = document.getElementById("speedUpSound");
if (speedUpSound) speedUpSound.play();


    clearTimeout(speedTextTimeout);
    speedTextTimeout = setTimeout(() => {
        showSpeedIncreaseText = false;
    }, 2000); // Toon 2 seconden
}


        // Elke 6 gegeten voedsel, voeg een obstakel toe
        if (foodEaten % 6 === 0) {
            obstacles.push(getRandomObstaclePosition());  // Voeg een nieuw obstakel toe aan de lijst
        }
    } else {
        snake.pop();  // Verwijder het laatste segment als er geen voedsel is gegeten
    }

    // Controleer of de slang de power-up heeft gepakt
    checkPowerUpPickup();
}


// Functie om een willekeurige voedselpositie te genereren
function getRandomFoodPosition() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
        };
    } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y)); // Zorg ervoor dat het voedsel niet op de slang komt
    return newFood;
}

function playAppleSoundAndAlert() {
    const appleSound = document.getElementById("appleSound");
    appleSound.play();  // Speel het geluid af
}

// Functie om een willekeurige obstakelpositie te genereren (nu horizontaal of verticaal met 3 blokken)
function getRandomObstaclePosition() {
    let newObstacle = [];
    let startX, startY, orientation;
    
    // Kies willekeurig of het obstakel horizontaal of verticaal moet zijn
    orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
    
    do {
        if (orientation === "horizontal") {
            // Kies een startpositie voor een horizontaal obstakel
            startX = Math.floor(Math.random() * (canvas.width / gridSize - 2)) * gridSize; // -2 voor ruimte voor 3 blokken
            startY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
            newObstacle = [
                { x: startX, y: startY },
                { x: startX + gridSize, y: startY },
                { x: startX + 2 * gridSize, y: startY }
            ];
        } else {
            // Kies een startpositie voor een verticaal obstakel
            startX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
            startY = Math.floor(Math.random() * (canvas.height / gridSize - 2)) * gridSize; // -2 voor ruimte voor 3 blokken
            newObstacle = [
                { x: startX, y: startY },
                { x: startX, y: startY + gridSize },
                { x: startX, y: startY + 2 * gridSize }
            ];
        }
    } while (
        snake.some(seg => newObstacle.some(block => block.x === seg.x && block.y === seg.y)) || 
        newObstacle.some(block => block.x === food.x && block.y === food.y)
    );  // Zorg ervoor dat het obstakel niet op de slang of het voedsel komt
    return newObstacle;
}

// Functie om het spel te beëindigen
function endGame() {
    gameOver = true;

    // Speel game over geluid af
    const gameOverSound = document.getElementById("gameOverSound");
    gameOverSound.currentTime = 0; // Zorgt ervoor dat hij opnieuw begint
    gameOverSound.play();

    if (score > highscore) highscore = score;
    clearInterval(gameInterval);
    console.log("Game over!");
}

// Functie om het spel te starten of opnieuw te starten
function startGame() {
    console.log("Start het spel!");
    clearInterval(gameInterval);
    gameOver = false;
    snake = [{ x: 200, y: 200 }];
    food = getRandomFoodPosition();
    obstacles = [];
    direction = "RIGHT";
    score = 0;
    foodEaten = 0;
    snakeSpeed = initialSnakeSpeed; // bug snelheid resetten


    // stel een interval in om de slang te bewegen en het spel te tekenen
    gameInterval = setInterval(() => {
        moveSnake();
        drawGame();
    }, snakeSpeed);
}

// Event listener voor toetsenbordinput (besturing van de slang)
document.addEventListener("keydown", (e) => {
    if (directionChanged || gameOver) return;

    e.preventDefault();
    switch (e.key) {
        case "ArrowUp":
        case "w":
            if (direction !== "DOWN") {
                direction = "UP";
                directionChanged = true;
            }
            break;
        case "ArrowDown":
        case "s":
            if (direction !== "UP") {
                direction = "DOWN";
                directionChanged = true;
            }
            break;
        case "ArrowLeft":
        case "a":
            if (direction !== "RIGHT") {
                direction = "LEFT";
                directionChanged = true;
            }
            break;
        case "ArrowRight":
        case "d":
            if (direction !== "LEFT") {
                direction = "RIGHT";
                directionChanged = true;
            }
            break;
    }
});


// Event listener voor het laden van de DOM (voor de restart-knop)
document.addEventListener("DOMContentLoaded", () => {
    const restartButton = document.getElementById("restartButton");
    if (!restartButton) {
        console.error("De restart-knop kon niet worden gevonden!");
    } else {
        restartButton.addEventListener("click", () => {
            console.log("Restart-knop is geklikt!");
            startGame();  // Start het spel opnieuw bij het klikken op de restart-knop
        });
    }
});


// Start het spel bij het laden van het script
startGame();

// ====== GAME OVER Retro Pixel Art Toevoeging ======

let showGameOverText = true;

setInterval(() => {
    if (gameOver) {
        showGameOverText = !showGameOverText;
        drawGame(); // opnieuw tekenen om knippering toe te passen
    }
}, 500);

function drawGameOver() {
    if (!showGameOverText) return;
    ctx.fillStyle = "white";
    ctx.font = "32px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
}

// Voeg deze aanroep toe aan je bestaande drawGame functie zonder de rest aan te raken:
const origineleDrawGame = drawGame;
drawGame = function() {
    origineleDrawGame();
    if (gameOver) drawGameOver();
    if (!gameOver) drawSpeedIncreaseText();

};

function drawSpeedIncreaseText() {
    if (!showSpeedIncreaseText) return;

    ctx.fillStyle = "yellow";
    ctx.font = "28px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("SPEED INCREASED!", canvas.width / 2, canvas.height / 2 - 40);
}

