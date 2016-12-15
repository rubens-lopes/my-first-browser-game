var enableCollision = true;
/**
 *Persona
 */
var Persona = function (sprite, x, y) {
    this.sprite = sprite;
    this.x = x || 0;
    this.y = y || 0;
    this.flip = false;
    this.flop = false;
};
Persona.prototype.render = function () {
    drawImage(Resources.get(this.sprite), this.x * 101, (this.y * 83) - 35, this.flip, this.flop);
}
Persona.prototype.xEdges = function () {
    return {
        start: (this.x * 101),
        end: (this.x * 101) + 101
    };
}

/**
 *Enemies
 */
var Enemy = function (lane, speed, sprite) {
    Persona.call(this, sprite || 'images/enemy-bug.png', -1, lane);
    this.speed = speed || 2;
    this.flip = Math.random() >= 0.5;
};
Enemy.prototype = Object.create(Persona.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function (dt) {
    if (this.flip) {
        this.x -= this.speed * dt;

        if (this.x < -1)
            this.x = 6;
    }
    else {
        this.x += this.speed * dt;
        
        if (this.x > 5)
            this.x = -1;
    }    
};

/**
 *Player
 */
var Player = function (sprite) {
    Persona.call(this, sprite, 2, 5);
    this.score = 0;
};
Player.prototype = Object.create(Persona.prototype);
Player.prototype.constructor = Player;
Player.prototype.reset = function () {
    this.x = 2;
    this.y = 5;
}
Player.prototype.update = function () {
    var p = this;
    var pXEdges = p.xEdges();

if(enableCollision)    
    allEnemies.forEach(function (e) {
        if (p.y === e.y) {
            var eXEdges = e.xEdges();

            if ((eXEdges.end > pXEdges.start && eXEdges.end < pXEdges.end)
                || (eXEdges.start > pXEdges.end && eXEdges.start < pXEdges.start)) {
                    this.score = 0;
                    p.reset();
                return;
               }
        }
    });
        
    if (p.y === 0) {
        this.score++;
        this.reset();
    }
};
Player.prototype.handleInput = function (input) {
    switch (input) {
        case 'left':
            this.x--;
            break;
        case 'up':
            this.y--;
            break;
        case 'right':
            this.x++;
            break;
        case 'down':
            this.y++;
            break;
    }

    if (this.x < 0)
        this.x = 0; 
    if (this.x > 4)
        this.x = 4; 
    if (this.y < 0)
        this.y = 0;
    if (this.y > 5)
        this.y = 5;
};

var player = new Player('images/char-horn-girl.png');
var allEnemies = [new Enemy(1), new Enemy(2, 3), new Enemy(3, 2)];

document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

function drawImage(img, x, y, flip, flop, center, deg, width, height) {
    ctx.save();

    if(typeof width === "undefined") width = img.width;
    if(typeof height === "undefined") height = img.height;
    if(typeof center === "undefined") center = false;

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