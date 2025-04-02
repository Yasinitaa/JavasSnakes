console.log("Script is geladen");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 400;

const gridSize = 20;

// Pseudo-code:
// - Initialiseer de slang op een bepaalde positie.
let snake = [{ x: 200, y: 200 }];
// - Genereer een willekeurige voedselpositie.
let food = getRandomFoodPosition();
// - Begin met de slang naar rechts bewegen.
let direction = "RIGHT";
// - Zet de begin score en highscore.
let score = 0;
let highscore = 0;
let gameOver = false;
// - Stel de snelheid van het spel in.
const snakeSpeed = 250;
let gameInterval;

// Functie om een rechthoek te tekenen (gebruikt voor de slang en het voedsel)
function drawRect(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridSize, gridSize);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, gridSize, gridSize);
}

// Functie om het spel te tekenen (slang, voedsel en score)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Maak het canvas schoon
    snake.forEach(segment => drawRect(segment.x, segment.y, "lime"));  // Teken de slang
    drawRect(food.x, food.y, "red");  // Teken het voedsel
    // Update de score en highscore in de HTML
    document.getElementById('score').textContent = score;
    document.getElementById('highscore').textContent = highscore;
}

// Functie om de slang te verplaatsen
function moveSnake() {
    if (gameOver) return; // Stop het spel als het game over is
    let head = { ...snake[0] };  // Maak een kopie van de huidige kop van de slang

    // Verander de positie van de kop op basis van de richting
    switch (direction) {
        case "UP": head.y -= gridSize; break; // ga omhoog
        case "DOWN": head.y += gridSize; break; // ga omlaag
        case "LEFT": head.x -= gridSize; break; // ga linksaf
        case "RIGHT": head.x += gridSize; break; // ga rechtsaf
    }

    // Controleer of de slang tegen de muur botst of zichzelf raakt
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height ||
        snake.some((seg, index) => index !== 0 && seg.x === head.x && seg.y === head.y)) {
        endGame();  // Stop het spel als er een botsing is
        return;
    }

    snake.unshift(head);  // Voeg een nieuwe kop toe aan de slang
    // Controleer of de slang het voedsel heeft gegeten
    if (head.x === food.x && head.y === food.y) {
        score += 10;  // Verhoog de score
        food = getRandomFoodPosition();  // Genereer nieuw voedsel
    } else {
        snake.pop();  // Verwijder het laatste segment als er geen voedsel is gegeten
    }
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

// Functie om het spel te beëindigen
function endGame() {
    gameOver = true;
    // Update de highscore als de huidige score hoger is
    if (score > highscore) highscore = score;
    clearInterval(gameInterval);  // Stop het spel
    console.log("Game over!");
}

// Functie om het spel te starten of opnieuw te starten
function startGame() {
    console.log("Start het spel!");
    clearInterval(gameInterval);  // Stop elk vorig interval
    gameOver = false;  // Zet game over naar false
    snake = [{ x: 200, y: 200 }];  // Reset de slang naar de beginpositie
    food = getRandomFoodPosition();  // Genereer nieuw voedsel
    direction = "RIGHT";  // Zet de beginrichting van de slang
    score = 0;  // Reset de score

    // Stel een interval in om de slang te bewegen en het spel te tekenen
    gameInterval = setInterval(() => {
        moveSnake();
        drawGame();
    }, snakeSpeed);
}

// Event listener voor toetsenbordinput (besturing van de slang)
document.addEventListener("keydown", (e) => {
    e.preventDefault();  // Voorkom standaard gedrag van de toets
    switch (e.key) {
        case "ArrowUp": case "w": if (direction !== "DOWN") direction = "UP"; break;
        case "ArrowDown": case "s": if (direction !== "UP") direction = "DOWN"; break;
        case "ArrowLeft": case "a": if (direction !== "RIGHT") direction = "LEFT"; break;
        case "ArrowRight": case "d": if (direction !== "LEFT") direction = "RIGHT"; break;
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
