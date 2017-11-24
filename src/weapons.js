class Bullet extends Phaser.Sprite {
  constructor(game, key) {
    super(game, 0, 0, key)

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST

    this.anchor.set(0.5)

    // this.checkWorldBounds = true
    this.outOfBoundsKill = true
    this.exists = false

    this.tracking = false
    this.scaleSpeed = 0
  }

  fire(x, y, angle, speed, gx = 0, gy = 0) {
    this.reset(x, y)
    this.scale.set(1)
    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity)
    this.angle = angle
    this.body.gravity.set(gx, gy)
  }

  update() {
    if (this.tracking) {
      this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    if (this.scaleSpeed > 0) {
      this.scale.x += this.scaleSpeed
      this.scale.y += this.scaleSpeed
    }
  }
}

export class SingleBulletWeapon extends Phaser.Group {
  constructor(game) {
    super(game, game.world, 'Single Bullet', false, true, Phaser.Physics.ARCADE)

    this.nextFire = 0
    this.bulletSpeed = 600
    this.fireRate = 500

    this.pattern = Phaser.ArrayUtils.numberArrayStep(-800, 800, 200)
    this.pattern = this.pattern.concat(Phaser.ArrayUtils.numberArrayStep(800, -800, -200))

    this.patternIndex = 0

    for (let i = 0; i < 64; i++) {
      this.add(new Bullet(game, 'bullet-white'), true)
    }
  }

  fire(source) {
    if (this.game.time.time < this.nextFire) return

    const x = source.crosshair.x
    const y = source.crosshair.y
    const angle = -source.firingAngle

    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 600)
    this.nextFire = this.game.time.time + this.fireRate
  }
}

export class TripleBulletWeapon extends Phaser.Group {
  constructor(game) {
    super(game, game.world, 'Triple Bullet', false, true, Phaser.Physics.ARCADE)

    this.nextFire = 0
    this.bulletSpeed = 600
    this.fireRate = 1000

    for (let i = 0; i < 128; i++) {
      this.add(new Bullet(game, 'bullet-white'), true)
    }
  }

  fire(source) {
    if (this.game.time.time < this.nextFire) return

    const x = source.crosshair.x
    const y = source.crosshair.y
    const angle = -source.firingAngle

    this.getFirstExists(false).fire(x, y, angle + 10, this.bulletSpeed, 0, 600)
    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 600)
    this.getFirstExists(false).fire(x, y, angle - 10, this.bulletSpeed, 0, 600)

    this.nextFire = this.game.time.time + this.fireRate
  }
}

export class BeamWeapon extends Phaser.Group {
  constructor(game) {
    super(game, game.world, 'BeamWeapon', false, true, Phaser.Physics.ARCADE)

    this.nextFire = 0
    this.bulletSpeed = 2000
    this.fireRate = 1

    for (let i = 0; i < 64; i++) {
      this.add(new Bullet(game, 'bullet11'), true)
    }
  }

  fire(source) {
    if (this.game.time.time < this.nextFire) return

    const x = source.crosshair.x
    const y = source.crosshair.y
    const angle = -source.firingAngle

    this.getFirstExists(false).fire(x, y, angle, this.bulletSpeed, 0, 0)

    this.nextFire = this.game.time.time + this.fireRate
  }
}
