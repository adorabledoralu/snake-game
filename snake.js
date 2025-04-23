class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.speed = 200;
        this.gameOver = false;

        this.init();
    }

    init() {
        document.getElementById('high-score').textContent = this.highScore;
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('pause-button').addEventListener('click', () => this.togglePause());
        
        // 移动端控制
        document.getElementById('move-up').addEventListener('click', () => this.changeDirection('up'));
        document.getElementById('move-down').addEventListener('click', () => this.changeDirection('down'));
        document.getElementById('move-left').addEventListener('click', () => this.changeDirection('left'));
        document.getElementById('move-right').addEventListener('click', () => this.changeDirection('right'));

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') this.changeDirection('up');
            if (e.key === 'ArrowDown') this.changeDirection('down');
            if (e.key === 'ArrowLeft') this.changeDirection('left');
            if (e.key === 'ArrowRight') this.changeDirection('right');
            if (e.key === 'p') this.togglePause();
        });
    }

    startGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.resetGame();
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.score = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.food = this.generateFood();
        document.getElementById('score').textContent = this.score;
        document.getElementById('pause-button').textContent = '暂停';
    }

    togglePause() {
        if (this.gameOver) return;
        this.isPaused = !this.isPaused;
        document.getElementById('pause-button').textContent = this.isPaused ? '继续' : '暂停';
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    changeDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        if (opposites[newDirection] !== this.direction) {
            this.direction = newDirection;
        }
    }

    update() {
        if (this.isPaused || this.gameOver) return;

        const head = {...this.snake[0]};

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
            // 调整加速逻辑，使速度变化更平缓
            if (this.score % 100 === 0 && this.speed > 100) { // 每100分加速一次，最低速度限制在100
                this.speed -= 20; // 每次减少20毫秒
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#0a0a14';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.ctx.fillStyle = '#4ecca3';
        this.snake.forEach((segment, index) => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // 绘制食物
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    endGame() {
        clearInterval(this.gameLoop);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('high-score').textContent = this.highScore;
        }
        alert(`游戏结束！\n得分：${this.score}\n最高分：${this.highScore}`);
    }
}

// 初始化游戏
window.onload = () => {
    new SnakeGame();
}; 