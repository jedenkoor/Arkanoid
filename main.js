const canvas = document.getElementById(`game`),
    canvasWidth = canvas.getAttribute(`width`),
    canvasHeight = canvas.getAttribute(`height`);

const game = {
    ctx: undefined,
    canvas: canvas,
    running: true,
    score: 0,
    blocks: [],
    rows: 1,
    cols: Math.floor((canvasWidth - 120) / 64) - 1,
    indent: 0,
    sprites: {
        background: undefined,
        platform: undefined,
        ball: undefined,
        block: undefined,
    },
    platform: {
        x: canvasWidth / 2 - 52,
        y: canvasHeight - 50,
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
            if((this.x > 0 && this.x < canvasWidth - this.width) || (this.x === 0 && this.dx > 0) || (this.x === canvasWidth - this.width && this.dx < 0)){
                this.x += this.dx;
                if(this.ball) {
                    game.ball.x += this.dx;
                }
            } else if(this.x < 0){
                this.x = 0;
                if(this.ball) {
                    game.ball.x = this.width / 2 - 11;
                }
            } else if(this.x > canvasWidth - this.width){
                this.x = canvasWidth - this.width;
                if(this.ball) {
                    game.ball.x = canvasWidth - this.width / 2 - 11;
                }
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
        x: canvasWidth / 2 - 11,
        y: canvasHeight - 72,
        velocity: 8,
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
            const x = this.x + this.dx,
                y = this.y + this.dy;

            if(x + this.width > element.x && x < element.x + element.width && y + this.height > element.y && y < element.y + element.height) {
                return true;
            }
        },
        bumpBlock: function(block, ball) {
            const blockCenterX = block.x + block.width / 2,
                blockCenterY = block.y + block.height / 2,
                ballCenterX = ball.x + ball.dx + ball.width / 2, 
                ballCenterY = ball.y + ball.dy + ball.height / 2,
                vectorBlockBallX = ballCenterX - blockCenterX,
                vectorBlockBallY = ballCenterY - blockCenterY,
                angleBump = Math.atan2(vectorBlockBallY, vectorBlockBallX) * 180 / Math.PI;
                
                if(){

                }

            block.isAlive = false;
            game.score++;
            if(game.score >= game.blocks.length) {
                game.over("You Win!");
            }
        },
        getTanDeg: function(deg) {
            const rad = deg * Math.PI / 180;
            return Math.tan(rad);
        },
        bumpPlatform: function(platform) {
            const ballCenter = this.x + this.width / 2,
                platformCenter = game.platform.x + game.platform.width / 2,
                isLeftSidePlatform = platformCenter > ballCenter,
                isCenterPlatform = platformCenter - ballCenter === 0;

            let gradusRelativeToCenter = Math.abs(platformCenter - ballCenter) * 90 / ((game.platform.width + 22) / 2);
            
            if(gradusRelativeToCenter > 85) {
                gradusRelativeToCenter = 85;
            }

            this.dy = -this.velocity;
            if(!isCenterPlatform){
                if(isLeftSidePlatform){
                    if(gradusRelativeToCenter > 45){
                        this.dy = this.getTanDeg(90 - gradusRelativeToCenter) * (-this.velocity);
                        this.dx = -(Math.sqrt(this.velocity**2 - this.dy**2));
                    } else if(gradusRelativeToCenter < 45){
                        this.dx = this.getTanDeg(gradusRelativeToCenter) * (-this.velocity);
                        this.dy = -(Math.sqrt(this.velocity**2 - this.dx**2));
                    } else if(gradusRelativeToCenter == 45){
                        this.dx = -(Math.sqrt(this.velocity**2 / 2));
                        this.dy = -(Math.sqrt(this.velocity**2 / 2));
                    }
                } else {
                    if(gradusRelativeToCenter > 45){
                        this.dy = this.getTanDeg(90 - gradusRelativeToCenter) * (-this.velocity);
                        this.dx = Math.sqrt(this.velocity**2 - this.dy**2);
                    } else if(gradusRelativeToCenter < 45){
                        this.dx = this.getTanDeg(gradusRelativeToCenter) * (this.velocity);
                        this.dy = -(Math.sqrt(this.velocity**2 - this.dx**2));
                    } else if(gradusRelativeToCenter == 45){
                        this.dx = Math.sqrt(this.velocity**2 / 2);
                        this.dy = -(Math.sqrt(this.velocity**2 / 2));
                    }
                }

                /*this.dy = -(Math.sqrt(this.velocity**2 / 2));
                this.dx = isLeftSidePlatform ? -(Math.sqrt(this.velocity**2 / 2)) : Math.sqrt(this.velocity**2 / 2);
                if(gradusRelativeToCenter > 45){
                    this.dy = this.getTanDeg(90 - gradusRelativeToCenter) * (-this.velocity);
                    this.dx = isLeftSidePlatform ? -(Math.sqrt(this.velocity**2 - this.dy**2)) : Math.sqrt(this.velocity**2 - this.dy**2);
                } else if(gradusRelativeToCenter < 45){
                    const velocity = isLeftSidePlatform ? -this.velocity : this.velocity;
                    this.dx = this.getTanDeg(gradusRelativeToCenter) * (velocity);
                    this.dy = -(Math.sqrt(this.velocity**2 - this.dx**2));
                }*/
            }
        },
        bumpEdge: function() {
            const x = this.x + this.dx,
                y = this.y + this.dy;

            if((x < 0) || (x + this.width > canvasWidth)) {
                this.x = x < 0 ? 0 : canvasWidth - this.width;
                this.dx = -this.dx;
            } else if(y < 0) {
                this.y = 0;
                this.dy = -this.dy;
            } else if(y + this.height > canvasHeight){
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
        if(this.cols > 1) this.indent = (canvasWidth - 120 - 64 * this.cols) / (this.cols - 1);
    },
    create: function() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    x: (64 + this.indent) * col + 60,
                    y: (32 + this.indent) * row + 200,
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
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);
        this.ctx.drawImage(this.sprites.ball, this.ball.width * this.ball.frame, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.blocks.forEach(item => {
            if(item.isAlive){
                this.ctx.drawImage(this.sprites.block, item.x, item.y);
            }
        });
        this.ctx.fillText(`Score - ` + this.score, 15, canvasHeight - 15);
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
                    this.ball.bumpBlock(item, this.ball);
                }
            }
        });
        this.ball.bumpEdge();
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