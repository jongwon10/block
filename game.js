var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var box = 20;
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var snake = [];
snake[0] = { x: 10 * box, y: 10 * box };
var food = { x: Math.floor(Math.random() * ((canvasWidth - box) / box)) * box, 
             y: Math.floor(Math.random() * ((canvasWidth - box) / box)) * box };
var score = 0;
var d;
var speed = 125;
var speeds = 0.9;
var gameOver = false;
var savedState = null;
var gameStarted = false;
var specialFood = { x: 0, y: 0, active: false };
var foodEatenCount = 0;

var snakeImg = document.getElementById('snakeImg');
var foodImg = document.getElementById('foodImg');
var specialFoodImg = document.getElementById('specialFoodImg');

var bestScore = parseInt(localStorage.getItem('bestScore')) || 0;

if (bestScore === null) {
    bestScore = 0;
} else {
    bestScore = parseInt(bestScore);
}

if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore);
}

document.addEventListener('keydown', direction);

function direction(event) {
    if (gameStarted) {
        if (event.keyCode == 37 && d !== 'RIGHT') {
            d = 'LEFT';
        } else if (event.keyCode == 38 && d !== 'DOWN') {
            d = 'UP';
        } else if (event.keyCode == 39 && d !== 'LEFT') {
            d = 'RIGHT';
        } else if (event.keyCode == 40 && d !== 'UP') {
            d = 'DOWN';
        }
    }
}

function collision(head, array) {
    if (array.length === 0) {
        return false;
    }

    for (var i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

function gameSpeed() {
    speed *= speeds;
}

$(document).on("click", "#sBtn", function() {
    console.log("sBtn click");
    $("#sBtn").css("display", "none");
    $("#nPopup").css("display", "block");
});

function startGame() {
    console.log("startGame");
    var popup = document.getElementById('nPopup');
    popup.style.display = 'none';

    resetGame();

    gameStarted = true;
}

function resetGame() {
    snake = [];
    snake[0] = { x: 10 * box, y: 10 * box };
    food = { x: Math.floor(Math.random() * ((canvasWidth - box) / box)) * box, 
             y: Math.floor(Math.random() * ((canvasWidth - box) / box)) * box };
    score = 0;
    d = undefined;
    speed = 125;
    speeds = 0.9;
    gameOver = false;
    gameStarted = false;
    specialFood = { x: 0, y: 0, active: false };
    foodEatenCount = 0;

    clearInterval(game);
    game = setInterval(draw, speed);

    $("#goPopup").css("display", "none");

    $("#cBtn").off("click", cBtnClick);
    $("#cBtn").on("click", cBtnClick);
    $(document).off("keydown", direction);
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for (var i = 0; i < snake.length; i++) {
        ctx.drawImage(snakeImg, snake[0].x, snake[0].y, box, box);
        ctx.fillStyle = 'burlywood';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.drawImage(foodImg, food.x, food.y, box, box);

    var snakeX = snake[0].x;
    var snakeY = snake[0].y;

    if (d === 'LEFT') snakeX -= box;
    if (d === 'UP') snakeY -= box;
    if (d === 'RIGHT') snakeX += box;
    if (d === 'DOWN') snakeY += box;

    if (snakeX == food.x && snakeY == food.y) {
        score += 10;
        foodEatenCount++;
        food = { 
            x: Math.floor(Math.random() * ((canvasWidth - box) / box)) * box, 
            y: Math.floor(Math.random() * ((canvasHeight - box) / box)) * box 
        };

        if (specialFood.active) {
            specialFood.active = false;
        }

        var eatSound = document.getElementById('eatSound');
        eatSound.play();

        if(foodEatenCount % 5 == 0) {
            specialFood.x = Math.floor(Math.random() * ((canvasWidth - box) / box)) * box;
            specialFood.y = Math.floor(Math.random() * ((canvasHeight - box) / box)) * box;
            specialFood.active = true;
        }

        gameSpeed();
        clearInterval(game);
        game = setInterval(draw, speed);
    } else {
        snake.pop();
    }

    if(specialFood.active) {
        ctx.drawImage(specialFoodImg, specialFood.x, specialFood.y, box, box);
    }

    if(specialFood.active && snakeX == specialFood.x && snakeY == specialFood.y) {
        specialFood.active = false;
        
        var lengthToReduce = 2;
        if(snake.length > lengthToReduce) {
            for(let i = 0; i < lengthToReduce; i++) {
                snake.pop();
            }
        } else {
            // 뱀의 길이가 줄어들 길이보다 작거나 같은 경우, 뱀의 길이를 1로 설정
            while(snake.length > 1) {
                snake.pop();
            }
        }
    }

    var newHead = { x: snakeX, y: snakeY };

    if (snakeX < 0 || snakeX >= canvasWidth || snakeY < 0 || snakeY >= canvasHeight) {
        endGame();
        console.log("Game over - Hit wall!");
        
        return;
    }

    if (collision(newHead, snake)) {
        endGame();
        console.log("Game over - Hit itself!");
        
        return;
    }

    snake.unshift(newHead);

    var scoreDisplay = document.getElementById("score");
    if(scoreDisplay) {
        scoreDisplay.innerText = 'Score: ' + score;
    } else {
        console.error("Score display element not found.");
    }

    var bestScoreDisplay = document.getElementById("bestScore");
    if(bestScoreDisplay) {
        bestScoreDisplay.innerText = 'Best Score: ' + bestScore;
    } else {
        console.error("Best score display element not found.");
    }
}

function endGame() {
    clearInterval(game);
    console.log("GameOver!");

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }

    $("#final-score").text("Final Score: " + score);
    $("#best-score").text("Best Score: " + bestScore);
    $("#goPopup").css("display", "block");

    $("#cBtn").off("click");


    $(document).on("click", "#rBtn", function() {
        console.log("rBtn click");

        resetGame();
        $("#goPopup").css("display", "none");
        $("#nPopup").css("display", "block");
        $("#cBtn").off("click", cBtnClick);
        $(document).off("keydown", direction);
    });

    $(document).on("click", "#nBtn", function() {
        console.log("nBtn click");
        
        location.reload();
    }); 
}

function pauseGame() {
    clearInterval(game);

    if (!gameOver) {
        savedState = {
            snake: JSON.parse(JSON.stringify(snake)),
            food: { x: food.x, y: food.y },
            score: score
        };
    }
}

function resumeGame() {

    if (savedState) {
        snake = JSON.parse(JSON.stringify(savedState.snake));
        food = { x: savedState.food.x, y: savedState.food.y };
        score = savedState.score;
        game = setInterval(draw, speed);
        savedState = null;
    }
}

function cBtnClick() {
    console.log("cBtn clicked");

    pauseGame();
    $("#ePopup").css("display", "block");

    $("#okBtn").on("click", function() {
        console.log("okBtn click");

        location.reload();
    });

    $("#noBtn").on("click", function() {
        console.log("noBtn click");

        $("#ePopup").css("display", "none");
        $("#goPopup").css("display", "none");

        resumeGame();
        console.log("Game resumed");
    });
}

var game = setInterval(draw, speed);