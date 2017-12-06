
export default class Asteroid extends Phaser.Sprite {
  constructor(game, x, y) {
    super(game, x, y, 'asteroid')

    this.collisionDamage = 50

    // Physics and movement
    this.game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
    this.movementSpeed = 75
    this.body.velocity.x = -this.movementSpeed + (this.movementSpeed * (Math.random() / 5))
  }

  // createExplosion() {
  //   this.exp = this.game.add.sprite(this.x, this.y, 'explosion')
  //   this.exp.anchor.setTo(0.5, 0.5)
  //   this.exp.animations.add('explosion')
  //   this.exp.play('explosion', 30, false, true)
  // }
}
