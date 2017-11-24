export default class Enemy extends Phaser.Sprite {
  constructor(game, x, y, isLeftSide = true) {
    super(game, x, y, 'enemy')
    this.isLeftSide = isLeftSide
    this.scaleFactor = 0.5
    this.scale.y = this.scaleFactor
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
  }

  update() {
    const deltaX = 1

    if (this.isLeftSide) {
      this.x += deltaX
      this.scale.x = -this.scaleFactor
    } else {
      this.x -= deltaX
      this.scale.x = this.scaleFactor
    }
    if (this.x < 0 || this.x > this.game.width) {
      this.isLeftSide = !this.isLeftSide
    }
  }
}
