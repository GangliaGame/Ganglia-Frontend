const toDegrees = radians => radians * 180 /  Math.PI
const toRadians = angle => angle * (Math.PI / 180)

export default class Enemy extends Phaser.Sprite {
  constructor(game, x, y, isLeftSide = true) {
    super(game, x, y, 'enemy')
    this.isLeftSide = isLeftSide
    this.scaleFactor = 0.5
    this.anchor.setTo(0.5, 0.5)
    this.scale.y = this.scaleFactor
    this.scale.x = isLeftSide ? -this.scaleFactor : this.scaleFactor
    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
    this.movementSpeed = 10
    this.setAngle = true
    this.body.angularDrag = 100
    this.shouldUpdateHeading = false
    setInterval(this.updateHeading.bind(this), 250)
  }

  updateHeading() {
    this.shouldUpdateHeading = true
  }

  update() {
    this.game.physics.arcade.moveToObject(this, this.game.player, this.movementSpeed)
    let degreesBetween = toDegrees(this.game.physics.arcade.angleBetween(this, this.game.player))
    if (!this.isLeftSide) {
      if (degreesBetween < 0) {
        degreesBetween = 180 - Math.abs(degreesBetween)
      } else {
        degreesBetween = Math.abs(degreesBetween) - 180
      }
    }
    this.body.angularVelocity = degreesBetween - this.body.rotation
  }
}
