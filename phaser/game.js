var game = new Phaser.Game(1600, 900, Phaser.AUTO, 'game');

//  Our core Bullet class
//  This is a simple Sprite object that we set a few properties on
//  It is fired by all of the Weapon classes

var Bullet = function (game, key) {

    Phaser.Sprite.call(this, game, 0, 0, key);
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    this.anchor.set(.5,.5);

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;

    this.tracking = false;
    this.scaleSpeed = 0;

};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.fire = function (x, y, angle, speed, gx, gy) {

    gx = gx || 0;
    gy = gy || 0;

    this.reset(x, y);
    this.scale.set(1);

    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);

    this.angle = angle;

    // if (source.currentColor === 0)
    // {
    //     this.loadTexture('bullet-white', 0);
    // }
    // else if (source.currentColor === 1)
    // {
    //     this.loadTexture('bullet-red', 0);
    // }
    // else if (source.currentColor === 2)
    // {
    //     this.loadTexture('bullet-green', 0);
    // }
    // else if (source.currentColor === 3)
    // {
    //     this.loadTexture('bullet-blue', 0);
    // }

    this.body.gravity.set(gx, gy);

};

Bullet.prototype.update = function () {

    if (this.tracking)
    {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }

    if (this.scaleSpeed > 0)
    {
        this.scale.x += this.scaleSpeed;
        this.scale.y += this.scaleSpeed;
    }

};

var Weapon = {};

////////////////////////////////////////////////////
//  A single bullet is fired in front of the ship //
////////////////////////////////////////////////////

Weapon.SingleBullet = function (game) {

    Phaser.Group.call(this, game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 1000;

    this.pattern = Phaser.ArrayUtils.numberArrayStep(-800, 800, 200);
    this.pattern = this.pattern.concat(Phaser.ArrayUtils.numberArrayStep(800, -800, -200));

    this.patternIndex = 0;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet-white'), true);
    }

    return this;

};

Weapon.SingleBullet.prototype = Object.create(Phaser.Group.prototype);
Weapon.SingleBullet.prototype.constructor = Weapon.SingleBullet;

Weapon.SingleBullet.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var y = source.y;

    if (source.isRight === true)
    {
        var x = source.x + 70;
        angle = 315;
    }
    else
    {
        var x = source.x - 70;
        angle = 225;
    }

    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 600);



    this.nextFire = this.game.time.time + this.fireRate;

};


//////////////////////////////////////////////////////
//  3-way Fire (directly above, below and in front) //
//////////////////////////////////////////////////////

Weapon.ThreeWay = function (game) {

    Phaser.Group.call(this, game, game.world, 'Three Way', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 100;

    for (var i = 0; i < 96; i++)
    {
        this.add(new Bullet(game, 'bullet7'), true);
    }

    return this;

};

Weapon.ThreeWay.prototype = Object.create(Phaser.Group.prototype);
Weapon.ThreeWay.prototype.constructor = Weapon.ThreeWay;

Weapon.ThreeWay.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var y = source.y;

    if (source.isRight === true)
    {
        var x = source.x + 70;
        angle = 0;
    }
    else
    {
        var x = source.x - 70;
        angle = 180;
    }

    this.getFirstExists(false).fire(x, y, 270, this.bulletSpeed, 0, 0);
    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 0);
    this.getFirstExists(false).fire(x, y, 90, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

////////////////////////////////////////////////////
//  Bullets are fired out scattered on the y axis //
////////////////////////////////////////////////////

Weapon.ScatterShot = function (game) {

    Phaser.Group.call(this, game, game.world, 'Scatter Shot', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 600;
    this.fireRate = 40;

    for (var i = 0; i < 32; i++)
    {
        this.add(new Bullet(game, 'bullet5'), true);
    }

    return this;

};

Weapon.ScatterShot.prototype = Object.create(Phaser.Group.prototype);
Weapon.ScatterShot.prototype.constructor = Weapon.ScatterShot;

Weapon.ScatterShot.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var y = source.y + this.game.rnd.between(-10, 10);

    if (source.isRight === true)
    {
        var x = source.x + 90;
        angle = 0;
    }
    else
    {
        var x = source.x - 90;
        angle = 180;
    }

    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

//////////////////////////////////////////////////////////////////////////
//  Fires a streaming beam of lazers, very fast, in front of the player //
//////////////////////////////////////////////////////////////////////////

Weapon.Beam = function (game) {

    Phaser.Group.call(this, game, game.world, 'Beam', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 1000;
    this.fireRate = 45;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet11'), true);
    }

    return this;

};

Weapon.Beam.prototype = Object.create(Phaser.Group.prototype);
Weapon.Beam.prototype.constructor = Weapon.Beam;

Weapon.Beam.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var y = source.y;

    if (source.isRight === true)
    {
        var x = source.x + 90;
        angle = 0;
    }
    else
    {
        var x = source.x - 90;
        angle = 180;
    }

    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 0);

    this.nextFire = this.game.time.time + this.fireRate;

};

///////////////////////////////////////////////////////////////////////
//  A three-way fire where the top and bottom bullets bend on a path //
///////////////////////////////////////////////////////////////////////

Weapon.SplitShot = function (game) {

    Phaser.Group.call(this, game, game.world, 'Split Shot', false, true, Phaser.Physics.ARCADE);

    this.nextFire = 0;
    this.bulletSpeed = 700;
    this.fireRate = 40;

    for (var i = 0; i < 64; i++)
    {
        this.add(new Bullet(game, 'bullet8'), true);
    }

    return this;

};

Weapon.SplitShot.prototype = Object.create(Phaser.Group.prototype);
Weapon.SplitShot.prototype.constructor = Weapon.SplitShot;

Weapon.SplitShot.prototype.fire = function (source) {

    if (this.game.time.time < this.nextFire) { return; }

    var y = source.y;

    if (source.isRight === true)
    {
        var x = source.x + 90;
        angle = 0;
    }
    else
    {
        var x = source.x - 90;
        angle = 180;
    }

    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, -500);
    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 0);
    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 500);

    this.nextFire = this.game.time.time + this.fireRate;

};


//  The core game loop

var PhaserGame = function () {

    this.background = null;
    this.foreground = null;

    this.player = null;
    this.cursors = null;
    this.speed = 100;

    this.weapons = [];
    this.currentWeapon = 0;
    this.weaponName = null;

};

PhaserGame.prototype = {

    init: function () {

        this.game.renderer.renderSession.roundPixels = true;

        this.physics.startSystem(Phaser.Physics.ARCADE);

    },

    preload: function () {

        //  We need this because the assets are on Amazon S3
        //  Remove the next 2 lines if running locally
        // this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue007/';
        // this.load.crossOrigin = 'anonymous';

        this.load.image('background', 'assets/back2.png');
        this.load.image('player', 'assets/ship2.png');
        this.load.bitmapFont('shmupfont', 'assets/shmupfont.png', 'assets/shmupfont.xml');

        for (var i = 1; i <= 11; i++)
        {
            this.load.image('bullet' + i, 'assets/bullet' + i + '.png');
        }

        this.load.image('bullet-white', 'assets/newBullet-white.png');
        this.load.image('bullet-red'  , 'assets/newBullet-red.png'  );
        this.load.image('bullet-blue' , 'assets/newBullet-blue.png' );
        this.load.image('bullet-green', 'assets/newBullet-green.png');

        this.load.image('player-red'  , 'assets/ship2-red.png'  );
        this.load.image('player-blue' , 'assets/ship2-blue.png' );
        this.load.image('player-green', 'assets/ship2-green.png');

        //  Note: Graphics are not for use in any commercial project

    },

    create: function () {

        this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.autoScroll(0, -50);

        this.weapons.push(new Weapon.SingleBullet(this.game));
        // this.weapons.push(new Weapon.ThreeWay(this.game));
        this.weapons.push(new Weapon.Beam(this.game));
        this.weapons.push(new Weapon.SplitShot(this.game));

        this.currentWeapon = 0;


        for (var i = 1; i < this.weapons.length; i++)
        {
            this.weapons[i].visible = false;
        }

        this.player = this.add.sprite(800, 450, 'player');
        this.player.currentColor = 0;
        this.player.anchor.setTo(.5,.5)
        this.physics.arcade.enable(this.player);
        this.player.isRight = true;

        this.player.body.collideWorldBounds = true;

        this.weaponName = this.add.bitmapText(8, 364, 'shmupfont', "ENTER = Next Weapon", 24);

        //  Cursor keys to fly + space to fire
        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

        var changeKey = this.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        changeKey.onDown.add(this.nextWeapon, this);

        var changeKey2 = this.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        changeKey2.onDown.add(this.nextColor, this);

    },

    nextWeapon: function () {

        //  Tidy-up the current weapon
        if (this.currentWeapon > 9)
        {
            this.weapons[this.currentWeapon].reset();
        }
        else
        {
            this.weapons[this.currentWeapon].visible = false;
            this.weapons[this.currentWeapon].callAll('reset', null, 0, 0);
            this.weapons[this.currentWeapon].setAll('exists', false);
        }

        //  Activate the new one
        this.currentWeapon++;

        if (this.currentWeapon === this.weapons.length)
        {
            this.currentWeapon = 0;
        }

        this.weapons[this.currentWeapon].visible = true;

        this.weaponName.text = this.weapons[this.currentWeapon].name;

    },

    nextColor: function () {

        this.player.currentColor = (this.player.currentColor+1)%4;

        if (this.player.currentColor === 0)
        {
            this.player.loadTexture('player', 0);
        }
        else if (this.player.currentColor === 1)
        {
            this.player.loadTexture('player-red', 0);
        }
        else if (this.player.currentColor === 2)
        {
            this.player.loadTexture('player-green', 0);
        }
        else if (this.player.currentColor === 3)
        {
            this.player.loadTexture('player-blue', 0);
        }
    },



    update: function () {

        this.player.body.velocity.set(0);

        if (this.cursors.left.isDown)
        {
            if (this.player.isRight === true)
            {
                this.player.isRight = false;
                this.player.scale.x = -1.0;
            }

        }
        else if (this.cursors.right.isDown)
        {
            if (this.player.isRight === false)
            {
                this.player.isRight = true;
                this.player.scale.x = 1.0;
            }


            this.player.isRight = true;
        }

        if (this.cursors.up.isDown)
        {
            this.player.body.velocity.y = -this.speed;
        }
        else if (this.cursors.down.isDown)
        {
            this.player.body.velocity.y = this.speed;
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
        {
            this.weapons[this.currentWeapon].fire(this.player);
        }

    }

};

game.state.add('Game', PhaserGame, true);
