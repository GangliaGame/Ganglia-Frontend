const toDegrees = radians => radians * 180 /  Math.PI
const toRadians = angle => angle * (Math.PI / 180)

export class Enemy extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y, 'enemy')
    this.scaleFactor = 0.5
    this.anchor.setTo(0.5, 0.5)
    this.scale.y = this.scaleFactor
    this.scale.x = this.scaleFactor
    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
    this.movementSpeed = 10
  }

  update() {
    this.game.physics.arcade.moveToObject(this, this.game.player, this.movementSpeed)
    let degreesBetween = toDegrees(this.game.physics.arcade.angleBetween(this, this.game.player))
    if (degreesBetween < 0) {
      degreesBetween = 180 - Math.abs(degreesBetween)
    } else {
      degreesBetween = Math.abs(degreesBetween) - 180
    }
    this.body.angularVelocity = degreesBetween - this.body.rotation
  }
}


export class PatrolEnemy extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y, 'enemy')
    this.scaleFactor = 0.5
    this.anchor.setTo(0.5, 0.5)
    this.scale.y = this.scaleFactor
    this.scale.x = this.scaleFactor
    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
    this.movementSpeed = 5
  }

  update() {
    this.x -= this.movementSpeed
  }
}
