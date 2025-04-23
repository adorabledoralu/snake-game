// 游戏配置
const config = {
    gridSize: 20, // 网格大小
    initialSpeed: 150, // 初始速度（毫秒）
    speedIncrement: 2, // 速度增量
    maxSpeed: 50 // 最大速度
};

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = config.gridSize;
        this.tileCount = this.canvas.width / this.gridSize;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.speed = config.initialSpeed;
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

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.calculateGameArea();
            this.draw();
        });
    }

    calculateGameArea() {
        const containerWidth = this.canvas.parentElement.clientWidth;
        const containerHeight = this.canvas.parentElement.clientHeight;
        
        // 保持网格为正方形
        const gridSize = Math.min(
            Math.floor(containerWidth / config.gridSize),
            Math.floor(containerHeight / config.gridSize)
        ) * config.gridSize;
        
        this.canvas.width = gridSize;
        this.canvas.height = gridSize;
        this.gridSize = gridSize / this.tileCount;
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
            if (this.score % 100 === 0 && this.speed > config.maxSpeed) { // 每100分加速一次，最低速度限制在最大速度
                this.speed -= config.speedIncrement; // 每次减少速度增量毫秒
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
        this.ctx.fillStyle = '#CCBA80';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        // 绘制垂直线
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // 绘制蛇（水晶风格）
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const size = this.gridSize - 2;

            // 创建渐变
            const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
            gradient.addColorStop(0, 'rgba(255, 146, 45, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 146, 45, 1)');
            gradient.addColorStop(1, 'rgba(255, 146, 45, 0.8)');

            // 绘制水晶方块
            this.ctx.fillStyle = gradient;
            
            // 添加阴影效果
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            
            // 绘制描边
            this.ctx.strokeStyle = 'rgba(204, 115, 36, 0.8)';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(x, y, size, size);
            
            // 填充方块
            this.ctx.fillRect(x, y, size, size);
            
            // 添加高光效果
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(x + 2, y + 2, size/3, size/3);
        });

        // 绘制食物（水晶风格）
        const foodX = this.food.x * this.gridSize;
        const foodY = this.food.y * this.gridSize;
        const foodSize = this.gridSize - 2;

        // 创建食物渐变
        const foodGradient = this.ctx.createLinearGradient(foodX, foodY, foodX + foodSize, foodY + foodSize);
        foodGradient.addColorStop(0, 'rgba(253, 2, 147, 0.8)');
        foodGradient.addColorStop(0.5, 'rgba(253, 2, 147, 1)');
        foodGradient.addColorStop(1, 'rgba(253, 2, 147, 0.8)');

        // 绘制水晶食物
        this.ctx.fillStyle = foodGradient;
        
        // 添加阴影效果
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // 绘制食物描边
        this.ctx.strokeStyle = 'rgba(202, 2, 117, 0.8)';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(foodX, foodY, foodSize, foodSize);
        
        // 填充食物
        this.ctx.fillRect(foodX, foodY, foodSize, foodSize);
        
        // 添加食物高光效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(foodX + 2, foodY + 2, foodSize/3, foodSize/3);

        // 重置阴影
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
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