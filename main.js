const canvas = document.getElementById(`game`);

const game = {
    ctx: undefined,
    canvas: canvas,
    running: true,
    score: 0,
    blocks: [],
    rows: 1,
    cols: Math.floor((canvas.getAttribute(`width`) - 40) / 64) - 1,
    indent: 0,
    sprites: {
        background: undefined,
        platform: undefined,
        ball: undefined,
        block: undefined,
    },
    platform: {
        x: canvas.getAttribute(`width`) / 2 - 52,
        y: canvas.getAttribute(`height`) - 50,
        width: 104,
        height: 24,
        velocity: 10,
        dx: 0,
        ball: true,
        releaseBall: function() {
            if(this.ball) {
                game.ball.jump();
                this.ball = false;
            }
        },
        move: function() {
            this.x += this.dx;
            if(this.ball) {
                game.ball.x += this.dx;
            }
        },
        stop: function() {
            this.dx = 0;
        },
    },
    ball: {
        width: 22,
        height: 22,
        frame: 0,
        x: canvas.getAttribute(`width`) / 2 - 11,
        y: canvas.getAttribute(`height`) - 72,
        velocity: 5,
        dx: 0,
        dy: 0,
        jump: function() {
            this.dy = -this.velocity;
            this.dx = 0;
            setInterval(() => {
                this.frame++;
                if(this.frame > 3){
                    this.frame = 0;
                }
            }, 100);
        },
        move: function() {
            this.x += this.dx;
            this.y += this.dy;
        },
        collide: function(element) {
            const x = this.x;
            const y = this.y;
            if(x + this.width > element.x &&
                x < element.x + element.width &&
                y + this.height > element.y &&
                y < element.y + element.height) {
                    return true;
            }
        },
        bumpBlock: function(block) {
            this.dy *= -1;
            block.isAlive = false;
            game.score++;
            if(game.score >= game.blocks.length) {
                game.over("You Win!");
            }
        },
        onTheLeftSide: function(platform) {
            return (this.x + this.width / 2) < (platform.x + platform.width / 2);
        },
        bumpPlatform: function(platform) {
            this.dy = -this.velocity;
            this.dx = this.onTheLeftSide(platform) ? -this.velocity : this.velocity;
        },
        checkBounce: function() {
            const x = this.x + this.dx;
            const y = this.y + this.dy;
            if(x < 0) {
                this.x = 0;
                this.dx = this.velocity;
            } else if(x + this.width > canvas.getAttribute(`width`)) {
                this.x = canvas.getAttribute(`width`) - this.width;
                this.dx = -this.velocity;
            } else if(y < 0) {
                this.y = 0;
                this.dy = this.velocity;
            } else if(y + this.height > canvas.getAttribute(`height`)){
                game.over(`Game Over`);
            }
        }
    },
    init: function() {
        this.ctx = canvas.getContext(`2d`);
        this.ctx.font = `20px Arial`;
        this.ctx.fillStyle = `#FFF`;

        window.addEventListener(`keydown`, (e) => {
            if(e.keyCode === 37){
                this.platform.dx = -this.platform.velocity;
            } else if(e.keyCode === 39){
                this.platform.dx = this.platform.velocity;
            } else if(e.keyCode === 32){
                this.platform.releaseBall();
            }
        });
        window.addEventListener(`keyup`, (e) => {
            this.platform.stop();
        });
    },
    load: function() {
        for(let image in this.sprites) {
            this.sprites[image] = new Image();
            this.sprites[image].src = `images/${image}.png`;
        }
        if(this.cols > 1) this.indent = (canvas.getAttribute(`width`) - 40 - 64 * this.cols) / (this.cols - 1);
    },
    create: function() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    x: (64 + this.indent) * col + 20,
                    y: (32 + this.indent) * row + 20,
                    width: 64,
                    height: 32,
                    isAlive: true,
                });
            }
        }
    },
    start: function() {
        this.init();
        this.load();
        this.create();
        this.run();
    },
    render: function() {
        this.ctx.clearRect(0, 0, canvas.getAttribute(`width`), canvas.getAttribute(`height`));
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.ctx.drawImage(this.sprites.ball, this.ball.width * this.ball.frame, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.blocks.forEach(item => {
            if(item.isAlive){
                this.ctx.drawImage(this.sprites.block, item.x, item.y);
            }
        });
        this.ctx.fillText(`Score - ` + this.score, 15, canvas.getAttribute(`height`) - 15);
    },
    update: function() {
        if(this.ball.collide(this.platform)){
            this.ball.bumpPlatform(this.platform);
        }
        if(this.platform.dx) {
            this.platform.move();
        }
        if(this.ball.dx || this.ball.dy) {
            this.ball.move();
        }
        this.blocks.forEach(item => {
            if(item.isAlive){
                if(this.ball.collide(item)){
                    this.ball.bumpBlock(item);
                }
            }
        });
        this.ball.checkBounce();
    },
    run: function() {
        this.update();
        this.render();
        if(this.running){
            window.requestAnimationFrame(function() {
                game.run();
            });
        }
    },
    over: function(message) {
        alert(message);
        this.running = false;
        window.location.reload();
    }
};

window.addEventListener(`DOMContentLoaded`, function() {
    game.start();
})