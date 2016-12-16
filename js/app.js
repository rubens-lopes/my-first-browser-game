var enableCollision = true;
var initialScore = 0;
var initialLifes = 3;
var theme = 'default';

/**
 *Persona
 */
var Persona = function (sprite, x, lane) {
    this.sprite = sprite;
    this.x = x || 0;
    this.lane = lane || 0;
    this.flip = false;
    this.flop = false;
};
Persona.prototype.render = function () {
    drawImage(Resources.get(this.sprite), this.x * 101, (this.lane * 83) - 39, this.flip, this.flop);

    if (this.showCollisionBox) {
    ctx.beginPath();
    ctx.rect((this.x * 101) + this.offset.x, ((this.lane * 83) - 39) + this.offset.y, this.width, this.height);
    ctx.closePath();    
    ctx.stroke();
}    
};

/**
 *Enemies
 */
var Enemy = function (lane, sprite) {
    Persona.call(this, sprite || 'images/' + theme + '/enemy-bug.png', 2, lane);
    this.speed = getRandomArbitrary(1, 5);
    this.flip = Math.random() >= 0.5;
    this.x = this.flip ? 6 : -1;
    this.width = 98;
    this.height = 65;
    this.offset = { x: 2, y: 78 };
    this.showCollisionBox = false;
};
Enemy.prototype = Object.create(Persona.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function (dt) {
    if (this.flip) {
        this.x -= this.speed * dt;

        if (this.x < -1)
            this.replace();    
    }
    else {
        this.x += this.speed * dt;
        
        if (this.x > 5)
            this.replace();    
    }
    if ((this.x * 101) + this.offset.x < (player.x * 101) + player.offset.x + player.width
        && (this.x * 101) + this.offset.x + this.width > (player.x * 101) + player.offset.x
        && ((this.lane * 83) - 39) + this.offset.y < ((player.lane * 83) - 39) + player.offset.y + player.height
        && this.height + ((this.lane * 83) - 39) + this.offset.y > ((player.lane * 83) - 39) + player.offset.y
        && enableCollision) {
                    if (--player.lifes < 1) {
                        score.clear();
                        player.reset();
                        return;
                    }
                    player.toInitialPosition();
        }
};
Enemy.prototype.replace = function () {
    var i = allEnemies.indexOf(this);
    allEnemies.push(new Enemy(this.lane));
    
    if (i > -1)
        allEnemies.splice(i, 1);

    delete this;
};

/**
 *Player
 */
var Player = function (sprite, x) {
    var initialX = isNaN(x) ? 2 : x;
    
    Persona.call(this, sprite, initialX, 5);
    this.lifes = initialLifes;
    this.initialX = initialX;
    this.finalX = this.x;
    this.finalY = this.lane;
    this.speed = 4;
    this.width = 30;
    this.height = 30;
    this.offset = { x: 35, y: 110 };
    this.showCollisionBox = false;
};
Player.prototype = Object.create(Persona.prototype);
Player.prototype.constructor = Player;
Player.prototype.toInitialPosition = function () {
    this.x = 2;
    this.lane = 5;
    this.finalX = this.x;
    this.finalY = this.lane;
}
Player.prototype.render = function () {
    Persona.prototype.render.call(this);
    var sprite = Resources.get('images/' + theme + '/heart.png');

    for (var i = 0; i < this.lifes; i++) {
        drawImage(sprite, i * sprite.width, 0);
    }
};
Player.prototype.update = function (dt) {
    if (this.x < this.finalX)
        this.x = Math.min(this.x + (this.speed * dt), this.finalX);
    if (this.x > this.finalX)
        this.x = Math.max(this.x - (this.speed * dt), this.finalX);
    if (this.lane > this.finalY)
        this.lane = Math.max(this.lane - (this.speed * dt), this.finalY);
    if (this.lane < this.finalY)
        this.lane = Math.min(this.lane + (this.speed * dt), this.finalY);

    if (this.lane === 0) {
        score.add(1);
        this.toInitialPosition();
    }
};
Player.prototype.handleInput = function (input) {
    switch (input) {
        case 'left':
            this.finalX--;
            break;
        case 'up':
            this.finalY--;
            break;
        case 'right':
            this.finalX++;
            break;
        case 'down':
            this.finalY++;
            break;
    }

    if (this.finalX < 0)
        this.finalX = 0; 
    if (this.finalX > 4)
        this.finalX = 4; 
    if (this.finalY < 0)
        this.finalY = 0;
    if (this.finalY > 5)
        this.finalY = 5;
};
Player.prototype.reset = function () {
    this.lifes = initialLifes;
    this.x = this.initialX;
    this.lane = 5;
    this.finalX = this.x;
    this.finalY = this.lane;
    scene = 'playerSelection';
};

/**
 *Score
 */
var Score = function () { 
    this.score = initialScore;
    this.highScore = 0;
    this.charsToPrint = [];
}
Score.prototype.render = function () {
    if (this.charsToPrint.length === 0)
        return;    
    
    var lastWidth = 0;
    this.charsToPrint.forEach(function (c) {
        var image = Resources.get(c);
        drawImage(image, ctx.canvas.width - image.width - lastWidth, 0);
        lastWidth += image.width;
    }, this);
};
Score.prototype.update = function () {
    var s = this;

    s.charsToPrint = [];
    var chars = s.score.toString().split('');

    chars.forEach(function (c) {
        s.charsToPrint.unshift('images/' + theme + '/number' + c + '.png');
    });
};
Score.prototype.clear = function () {
    if (this.score > this.highScore)
        this.highScore = this.score;
    
    this.score = initialScore;
};
Score.prototype.add = function (points) {
    this.score += points;
};

/**
 *Selector
 */
var Selector = function () {
    this.x = 2;
    this.y = 5;
    this.finalX = this.x;
    this.speed = 4;
}
Selector.prototype.render = function () {
    ctx.drawImage(Resources.get('images/' + theme + '/selector.png') , this.x * 101, (this.y * 83) - 39);
};
Selector.prototype.update = function (dt) {
            if (this.x < this.finalX)
                this.x = Math.min(this.x + (this.speed * dt), this.finalX);
            if (this.x > this.finalX)
                this.x = Math.max(this.x - (this.speed * dt), this.finalX);
};
Selector.prototype.handleInput = function (input) {
    switch (input) {
        case 'left':
            this.finalX--;
            break;
        case 'right':
            this.finalX++;
            break;
        case 'confirm':
            startScene('main', this.finalX);    
            break;
    }

    if (this.finalX < 0)
        this.finalX = 0; 
    if (this.finalX > 4)
        this.finalX = 4; 
};

/**
 *Init & helpers
 */
var player;
var allEnemies;
var score;

var selector = new Selector();
var scene = 'playerSelection';
var allPlayers = [
        new Player('images/' + theme + '/char-boy.png', 0),
        new Player('images/' + theme + '/char-cat-girl.png', 1),
        new Player('images/' + theme + '/char-horn-girl.png', 2),
        new Player('images/' + theme + '/char-pink-girl.png', 3),
        new Player('images/' + theme + '/char-princess-girl.png', 4)
    ];

function startScene(sc, x) {
    allEnemies = [
        new Enemy(1),
        new Enemy(2),
        new Enemy(3)
    ];
    score = new Score();
    player = allPlayers[x];
    player.toInitialPosition();

    scene = sc;
};

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    var allowedSelectorKeys = {
        37: 'left',
        39: 'right',
        13: 'confirm',
        32: 'confirm',
    };

    switch (scene) {
        case 'main':
            player.handleInput(allowedKeys[e.keyCode]);
            break;
        case 'playerSelection':
            selector.handleInput(allowedSelectorKeys[e.keyCode]);
            break;
    }    
});
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
function drawImage(img, x, y, flip, flop, center, deg, width, height) {
    ctx.save();

    if(typeof width === 'undefined') width = img.width;
    if(typeof height === 'undefined') height = img.height;
    if(typeof center === 'undefined') center = false;

    // Set rotation point to center of image, instead of top/left
    if(center) {
        x -= width/2;
        y -= height/2;
    }

    // Set the origin to the center of the image
    ctx.translate(x + width/2, y + height/2);

    // Rotate the canvas around the origin
    var rad = 2 * Math.PI - deg * Math.PI / 180;    
    ctx.rotate(rad);

    // Flip/flop the canvas
    if(flip) flipScale = -1; else flipScale = 1;
    if(flop) flopScale = -1; else flopScale = 1;
    ctx.scale(flipScale, flopScale);

    // Draw the image    
    ctx.drawImage(img, -width/2, -height/2, width, height);

    ctx.restore();
}