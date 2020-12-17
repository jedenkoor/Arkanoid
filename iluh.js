

let game = {
  statusGame: undefined,
  level: {},
  width: 1300,
  height: 731,
  default: {
      platform: {
          width: 104,
          height: 24,
          magnet: false,
          type: 1,
          bullet: [],
          bulletInterval: undefined,
      },
  },
  ctx: undefined,
  platform: undefined,
  ball: undefined,
  blocks: [],
  moln: false,
  sprites: {
      background: undefined,
      platformsmall: undefined,
      platform: undefined,
      platformbig: undefined,
      platformmedium: undefined,
      ball: undefined,
      block: undefined,
      glass: undefined,
      klipartz: undefined,
      klipartzBack: undefined,
  },
  botton: {
      pause: () => {
          game.statusGame.play = false;
          let block = document.getElementsByClassName('pause');
          block[0].removeAttribute('style');
      },
      play: () => {
          game.statusGame.play = true;
          let block = document.getElementsByClassName('pause');
          block[0].style.display = 'none';
      },
      sound: () => {
          game.statusGame.sound = !game.statusGame.sound;
      },
      fulldisplay: _ => {
          game.helper.enterFullscreen('game-block');
      },
  },
  create: function () {
      if(this.level.list[this.level.active]) {
          this.level.list[this.level.active].block.forEach((item,key) => {
              let typeList = item.split('');
              typeList.forEach((type, typeKey) => {
                  let obj = this.level.blockType[type];
                  if(!obj) return;
                  let block = Object.assign({}, obj);

                  if(!block.width) block.width = 64;
                  if(!block.height) block.height = 32;

                  block.x = (block.width + 4) * typeKey + 45;
                  block.y = (block.height + 6) * key + 35;

                  block.isAlive = true;
                  block.score = block.live;

                  this.blocks.push(block);
              });
          });
      } else {
          alert('YOU WINN');
      }
  },
  start: function() {
      this.statusGame.setGameLive(false, 3);
      this.init();
      this.load();
      this.create();
      this.run();
  },
  init: function () {
      let canvas = document.getElementById('game');
      this.ctx = canvas.getContext('2d');
      window.addEventListener("keydown", (e) => {
          switch (e.keyCode) {
              case 37:
                  this.platform.dx = -this.platform.velocity;
              break;
              case 39:
                  this.platform.dx = this.platform.velocity;
              break;
              case 32:
                  this.platform.releaseBall();
              break;
          }
      });

      window.addEventListener('mousemove', (e) => {
          const pos = this.helper.getMousePos(canvas, e);
          if(pos.x > 0 && pos.x < this.width) {
              this.platform.move(pos.x - this.platform.width / 2);
          }
      }, false);

      window.addEventListener("touchmove", (e) => {
          const pos = this.helper.getMousePos(canvas, e);
          if(pos.x > 0 && pos.x < this.width) {
              this.platform.move(pos.x);
          }
          this.render();
      }, false);

      window.addEventListener('mouseup', (e) => {
          this.platform.releaseBall();
      }, false);
      window.addEventListener("keyup", (e) => {
          switch (e.keyCode) {
              case 37: case 39:
                  this.platform.stop();
              break;
          }
      });
      setInterval(_=> {
          this.moln = !this.moln;
      }, 150);
      for(let id in this.botton) {
          document.getElementById(id).addEventListener('click', this.botton[id]);
      }
  },
  load: function () {
      const sprites = this.sprites;
      for(let key in sprites) {
          sprites[key] = new Image();
          sprites[key].src = `images/${key}.png`;
      }
  },
  render: function() {
      const sprites = this.sprites;
      const ball = this.ball;
      this.ctx.clearRect(0, 0, this.width, this.hight);
      this.ctx.drawImage(sprites.background, 0, 0);

      if(this.platform.magnet) {
          let klipartz = sprites.klipartz;
          if(this.moln) {
              klipartz = sprites.klipartzBack;
          }
          this.ctx.drawImage(klipartz, this.platform.x, this.platform.y - 20, this.platform.width, this.platform.height);
      }

      this.ctx.drawImage(sprites[this.platform.typeImg[this.platform.type]], this.platform.x, this.platform.y);//sprites.platform


      this.ctx.drawImage(sprites.ball, ball.width * ball.frame, 0, ball.width, ball.height, ball.x, ball.y, ball.width, ball.height);
      this.blocks.forEach( block => {
          if(block.isAlive) {
              this.ctx.drawImage(sprites[block.type ? block.type : 'block'],block.width * (block.live - 1),0,block.width,block.height,block.x, block.y, block.width, block.height);
          }
      });
      this.gift.list.forEach( gift => {
          this.ctx.drawImage(gift.img, gift.x, gift.y);
      });
      this.platform.bullet.forEach( bullet => {
          this.ctx.drawImage(bullet.img, bullet.x, bullet.y);
      });
  },
  update: function() {
      if(this.ball.collide(this.platform)) {
          this.ball.bumpPlatform();
      }
      if(this.platform.dx) {
          this.platform.move();
      }
      if(this.ball.dx || this.ball.dy) {
          this.ball.move();
      }
      if(this.gift.list.length > 0) {
          this.gift.move();
      }
      this.activeBlock = 0;
      this.blocks.forEach( (element) => {
          if(!element.isAlive) return false;
          if(this.ball.collide(element)) {
              this.ball.bumpBlock(element);
          }
          if(game.platform.bullet.length) {
              game.platform.bullet.forEach((bullet, bulletKey) => {
                  if(this.helper.collide(element, bullet)) {
                      game.helper.touchBlock(element);
                      delete game.platform.bullet[bulletKey];
                  }
              });
          }
          this.activeBlock++;
      });
      if(game.platform.bullet.length) {
          game.platform.bullet.forEach(bullet => {
              bullet.y -= bullet.dy;
          });
      }
      this.ball.checkBounds();
  },
  restart: function() {
      this.ball.restart();
      this.platform.restart();
      this.gift.restart();
  },
  nextGameLevel: function() {
      this.restart();
      this.create();
      this.update();
  },
  run: function() {
      if(this.activeBlock === 0) {
          this.level.nextLevel();
          return false;
      }
      if(this.statusGame.play) {
          this.update();
          this.render();
      }
      window.requestAnimationFrame(() => {
          this.run();
      });
  },
  over: function () {
      this.statusGame.setGameLive(true);
      game.helper.playSound('sound/gameover.wav');
      this.statusGame.play = false;
      if(this.statusGame.live > 0) {
          setTimeout(() => {
              setTimeout(() => {
                  this.statusGame.play = true;
              }, 2000);
              this.restart();
          }, 1000);
      }
  }
};
game.statusGame = {
  play: true,
  activeBlock: 0,
  score: 0,
  sound: false,
  live: 3,
  addScore: function (value) {
    this.score += value * 100;
    document.getElementById('score').innerHTML = `${this.score}`;
  },
  setGameLive: function (sub = true, value = false) {
      if(value) {
          this.live = value;
      } else if (sub === true) {
          this.live--;
      } else if (sub === false) {
          this.live++;
      }
      document.getElementById('live').innerHTML = `${this.live}`;
  },
},
game.helper = {
  checkBounds: function (element) {
      if ((element.y + element.dy) + element.height > game.height) {
          return true;
      }
      return false;
  },
  collide: function (element, inE) {
      let x = inE.x + inE.dx;
      let y = inE.y + inE.dy;
      return (
          (x + inE.width) > element.x &&
          x < element.x + element.width &&
          y + inE.height > element.y &&
          y < element.y + element.height
      );
  },
  getMousePos: function (canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      let x = evt.clientX;
      let y = evt.clientY;
      if('touches' in evt) {
          x = evt.touches[0].pageX;
          y = evt.touches[0].pageY;
      }
      return {
          x: (x - rect.left) / (rect.right - rect.left) * canvas.width,
          y: (y - rect.top) / (rect.bottom - rect.top) * canvas.height
      };
  },
  enterFullscreen: function (id) {
      var el = document.getElementById(id);
      console.log(el);
      if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      } else {
        el.mozRequestFullScreen();
      }
  },
  playSound: function (src) {
      if(game.statusGame.sound) {
          var audio = new Audio();
          audio.preload = 'auto';
          audio.src = src;
          audio.play();
      }
  },
  touchSide: (r1, r2) => {
      let x = r2.x + r2.dx;
      let y = r2.y + r2.dy;
      let dx = x - r1.x;
      let dy = y - r1.y;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      let side = '';
      if ((angle >= -15 && angle < 24) || (angle > 315 && angle < 360)) {
          side = 'right';
      } else if (angle >= 24 && angle < 119) {
          side = 'bottom';
      } else if (angle >= 119 && angle < 225 || angle >= -160 && angle <= -139) {
          side = 'left';
      } else {
          side = 'top';
      }
      return side;
  },
  touchBlock: function (block) {
      let destroy = true;
      if('live' in block) {
          block.live--;
          if(block.live > 0) {
              destroy = false;
          }
      }
      if(destroy) {
          block.isAlive = false;
          game.statusGame.addScore(block.score);
          game.gift.add(block.x, block.y);
      }
  }
};
game.level = {
  nextLevel: function () {
      game.helper.playSound('sound/levelComplite.wav');
      this.active++;
      let block = document.querySelector('.copmlite_level');
      block.querySelector('span').innerHTML = this.active;
      document.getElementById('level').innerHTML = `${this.active + 1}`;
      block.removeAttribute('style');
      game.nextGameLevel();
      setTimeout(() => {
          block.style.display = 'none';
          game.run();
      }, 2000);
  },
  list: [
      {
          block: [
              ,,,,,,,
              'AAAAAAAAAAAAAAAAAA',
              'AAAAAAAAAAAAAAAAAA'
          ],
      },
      {
          block: [
              'AAAAAAAAAAAAAAAAAA',
              'AAAAAAAAAAAAAAAAAA',
              'BBBBBBBBBBBBBBBBBB'
          ],
      },
      {
          block: [
              'AAAAAAAAAAAAAAAAAA',
              'AAAAAAAAAAAAAAAAAA',
              'BBBBBBBBBBBBBBBBBB'
          ],
      },
      {
          block: [
              ,
              ,
              'AAAAAAAAAAAAAAAAAA',
              'AAAAAAAAAAAAAAAAAA',
              'FFFFFFFFFFFFFFFFFF'
          ],
      },
  ],
  active: 0,
  blockType: {
      'A': { live: 1 },
      'B': { live: 2 },
      'C': { live: 3 },
      'D': { live: 4 },
      'E': { live: 5 },
      'F': { live: 3, type: "glass" },
      'G': { live: 2, type: "glass" },
      'H': { live: 1, type: "glass" },
  },
};
game.ball = {
  width: 22,
  height: 22,
  frame: 0,
  x: (game.width / 2) - 10,
  y: game.height - 65,
  dx: 0,
  dy: 0,
  velocity: 8,
  touches: {
      x: false,
      dx: false,
      dy: false,
  },
  restart: function () {
      this.x = (game.width / 2) - 10;
      this.y = game.height - 65;
      this.dx = 0;
      this.dy = 0;
  },
  jump: function () {
      if(this.touches.dx !== false && this.touches.dy !== false) {
          this.dy = this.touches.dy;
          this.dx = this.touches.dx;
          this.touches.x = false;
          this.touches.dx = false;
          this.touches.dy = false;
      } else {
          this.dy = -this.velocity;
          this.dx = 0;
      }
      setInterval(()=> {
          if(game.platform.ball === false) {
              this.frame++;
              if(this.frame > 3) {
                  this.frame = 0;
              }
          }
      }, 50);
  },
  move: function (x = false, y = false) {
      this.x = x ? x : this.x + this.dx;
      this.y = y ? y : this.y + this.dy;
  },
  collide: function (element) {
      let x = this.x + this.dx;
      let y = this.y + this.dy;
      return (
          (x + this.width) > element.x &&
          x < element.x + element.width &&
          y + this.height > element.y &&
          y < element.y + element.height
      );
  },
  bumpBlock: function (block) {
      let side = game.helper.touchSide(block, this);

      if(side == 'top' || side == 'bottom') {
          this.dy *= -1;
      } else {
          this.dx *= -1;
      }

      game.helper.touchBlock(block);

      if(block.type === 'glass') {
          game.helper.playSound(`sound/glass.wav`);
      } else {
          game.helper.playSound(`sound/block.wav`);
      }
  },
  bumpPlatform: function () {
      game.helper.playSound('sound/block.wav');
      let percent = (money, tallage) => money / 100 * tallage;
      let percentIn = (money, sub) => 100 / money * sub;

      let data = {
          platform: {
              leftPoint: game.platform.x,
              width: game.platform.width,
              maxGradus: undefined,
              centerGradus: undefined,
              ball: {
                  gradus: undefined,
                  center: undefined,
              }
          },
          ball: {
              leftPoint: this.x,
              width: this.width,
          },
      };

      data.platform.ball.center = (data.ball.leftPoint + data.ball.width/2) - data.platform.leftPoint;
      data.platform.maxGradus = data.platform.width / 180;
      data.platform.centerGradus = data.platform.maxGradus / 2;
      data.platform.ball.gradus = ((data.platform.ball.center / 180) - data.platform.maxGradus) + data.platform.centerGradus;

      if(Math.abs(data.platform.ball.gradus) > data.platform.centerGradus) {
          data.platform.ball.gradus = data.platform.ball.gradus < 0 ? -data.platform.centerGradus : data.platform.centerGradus;
      }

      data.direction = data.platform.ball.gradus < 0 ? false : true;
      data.y = percentIn(data.platform.centerGradus, data.platform.ball.gradus);

      if(Math.abs(data.y) > 85) {
          data.y = data.y ? 85 : -85;
      }

      data.dy = this.velocity + percent(this.velocity, -Math.abs(data.y));
      data.dx = this.velocity + (data.dy * -1);
      data.dx = data.direction ?  -1 * Math.abs(data.dx) : data.dx;
      data.dy = -Math.abs(data.dy);
      data.dx *= -1;
      this.dx = data.dx;
      this.dy = data.dy;
      //game.platform.magnet = !game.platform.magnet;

      if(game.platform.magnet) {
          this.touches.dx = this.dx;
          this.touches.dy = this.dy;
          this.touches.x = (this.x)  - game.platform.x;
          this.dx = 0;
          this.dy = 0;
          game.platform.ball = this;
      }
  },
  checkBounds: function () {
      let x = this.x + this.dx;
      let y = this.y + this.dy;
      if( x < 0 || x + this.width > game.width) {
          this.x = (x < 0) ? 0 : (game.width - this.width);
          this.dx *= -1;
          game.helper.playSound('sound/walf.wav');
      } else if (y < 0) {
          this.y = 0;
          this.dy *= -1;
          game.helper.playSound('sound/walf.wav');
      }
      if(y + this.height > game.height) {
          game.over();
      }
  }
};
game.platform = {
  x: (game.width / 2) - 50,
  y: game.height - 40,
  bullet: [],
  bulletInterval: undefined,
  typeImg: [
      'platformsmall',
      'platform',
      'platformmedium',
      'platformbig',
  ],
  dx: 0,
  velocity: 8,
  ball: game.ball,
  width: game.default.platform.width,
  height: game.default.platform.height,
  magnet: game.default.platform.magnet,
  type: game.default.platform.type,
  restart: function()  {
      this.x = (game.width / 2) - 50;
      this.y = game.height - 40;
      clearInterval(this.bulletInterval);
      for(let defaultKey in game.default.platform) {
          this[defaultKey] = game.default.platform[defaultKey];
      }
      this.ball = game.ball;
  },
  move: function (x = false) {
      this.x = x === false ? this.x + this.dx : x;
      let maxPoint = game.width - this.width;
      this.x = this.x - 1 > 0 ? (this.x + 1 > maxPoint ? maxPoint : this.x) : 0;
      if(this.ball && this.x > 0 && this.x != maxPoint) {
          if(this.ball.touches.x !== false) {
              this.ball.x = this.ball.touches.x + this.x;
          } else {
              this.ball.x = this.x + (this.width / 2) - this.ball.width / 2;
          }
      }
  },
  stop: function () {
      this.dx = 0;
      if(this.ball) {
          this.ball.dx = 0;
      }
  },
  releaseBall: function () {
      if(this.ball) {
          this.ball.jump();
          this.ball = false;
      }
  }
};
game.gift = {
  add: function (x = 0, y = 0) {
      const getRandomInt = max => {
          return Math.floor(Math.random() * Math.floor(max));
      };
      let typeKeys = Object.keys(this.type);
      let randInt = getRandomInt(typeKeys.length);
      let key = typeKeys[randInt];
      if(!key) {
          return false;
      }
      let gift = Object.assign({}, this.type[key]);
      gift.x = x;
      gift.y = y;
      gift.dx = 0;
      gift.dy = 3;
      gift.width = 40;
      gift.height = 40;
      if('img' in gift) {
          let image = new Image();
          image.src = gift.img;
          gift.img = image;
      }
      this.list.push(gift);
  },
  restart: function()  {
      this.list = [];
  },
  move: function (x = false, y = false) {
      this.list.forEach( (gift, keyGift) => {
          gift.x = x ? x : gift.x + gift.dx;
          gift.y = y ? y : gift.y + gift.dy;
          let destroy = false;

          if(game.helper.collide(game.platform, gift)) {
              if('action' in gift) {
                  gift.action();
              }
              destroy = true;
          } else if(game.helper.checkBounds(gift)) {
              destroy = true;
          }

          if(destroy) {
              this.destroy(keyGift);
          }
      });
  },
  destroy: function (key) {
      delete this.list[key];
  },
  list: [],
  type: {
      increasePlatform: {
          param: {
              value: game.platform.width / 2,
          },
          action: function () {
              if(game.platform.type !== 3) {
                  game.platform.width += this.param.value;
                  game.platform.type++;
              }
          },
          img: 'images/gift/plus.png',
      },
      decreasePlatform: {
          param: {
              value: game.platform.width / 2,
          },
          action: function () {
              if(game.platform.type !== 0) {
                  game.platform.width -= this.param.value;
                  game.platform.type--;
                  game.platform.releaseBall();
              }
          },
          img: 'images/gift/minus.png',
      },
      magnet: {
          action: function () {
              game.platform.magnet = true;
          },
          img: 'images/gift/magnet.png',
      },
      death: {
          action: function () {
              game.over();
          },
          img: 'images/gift/death.png',
      },
      life: {
          action: function () {
              game.statusGame.setGameLive(false);
          },
          img: 'images/gift/life.png',
      },
      bullet: {
          action: function () {
              const addBullet = (x) => {
                  let img = new Image();
                  img.src = 'images/gift/bullet.png';
                  return {
                      width: 5,
                      height: 15,
                      x,
                      y: game.platform.y,
                      dy: game.ball.velocity,
                      dx: 0,
                      img
                  };
              };
              if(game.platform.bulletInterval === undefined) {
                  game.platform.bulletInterval = setInterval(() => {
                      if(game.statusGame.play) {
                          game.platform.bullet.push(addBullet(game.platform.x));
                          game.platform.bullet.push(addBullet(game.platform.x + game.platform.width));
                      }
                  }, 500);
              }
          },
          img: 'images/gift/bulleticon.png',
      },
  }
};

const startGame = (fullScreen = false) => {
  if(fullScreen) {
      game.helper.enterFullscreen('game-block');
  }
  document.getElementsByTagName('main')[0].removeAttribute('style');
  game.start();
};
window.addEventListener("load", () => {
  document.getElementById('full').addEventListener('click', _ => {
      startGame(true);
  });
  document.getElementById('notfull').addEventListener('click', _ => {
      startGame();
  });
});