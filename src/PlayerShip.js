import { SingleBulletWeapon, TripleBulletWeapon, BeamWeapon } from './weapons'

const toRadians = angle => angle * (Math.PI / 180)

export default class PlayerShip extends Phaser.Sprite {
  constructor(game) {
    super(game, 50, game.height / 2, 'player')
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.5, 0.5)

    // Firing
    this.crosshairRadius = 100

    // Movement
    this.movementSpeed = 100
    this.body.collideWorldBounds = true

    // Shields
    this.isShieldActive = false
    this.shield = game.add.sprite(this.x, this.y, 'shield')
    this.shield.anchor.setTo(0.5, 0.5)
    game.physics.enable(this.shield, Phaser.Physics.ARCADE)
    this.deactivateShield()

    // Health
    this.maxHealth = 100
    this.health = 100
    this.hitPointsBarOutline = game.add.sprite(this.x, this.y - 119, 'hpBarOutline')
    this.hitPointsBarOutline.anchor.setTo(0.5, 0.5)
    this.hitPointsBar = game.add.sprite(this.x, this.y - 132, 'hpBar')
    this.hitPointsBar.anchor.setTo(0, 0)
    this.hitPointsBar.update = () => {
      this.hitPointsBarOutline.x = this.x
      this.hitPointsBarOutline.y = this.y - 119
      this.hitPointsBar.x = this.x - 125
      this.hitPointsBar.y = this.y - 132
      this.hitPointsBar.scale.x = this.health / this.maxHealth
    }

    // Weapons
    this.weapons = []
    this.currentWeapon = 0

    this.weapons.push(
      new SingleBulletWeapon(this.game),
      new TripleBulletWeapon(this.game),
      new BeamWeapon(this.game),
    )
    for (let i = 1; i < this.weapons.length; i++) {
      this.weapons[i].visible = false
    }

    // Weapon crosshair
    this.crosshair = this.game.add.sprite(this.x, this.y, 'crosshair')
    this.crosshair.anchor.set(0.5)
  }

  toggleShield() {
    if (this.isShieldActive) this.deactivateShield()
    else this.activateShield()
  }

  activateShield() {
    this.isShieldActive = true
    this.shield.exists = true
    this.shield.health = 100
  }

  deactivateShield() {
    this.isShieldActive = false
    this.shield.exists = false
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeapon]
  }

  fireWeapon() {
    this.weapons[0].fire(this)
  }

  moveDown() {
    this.body.velocity.y = this.movementSpeed
  }

  moveUp() {
    this.body.velocity.y = -this.movementSpeed
  }

  update() {
    this.body.velocity.set(0)

    // Update crosshair location
    this.crosshair.x = this.x + this.crosshairRadius * Math.cos(toRadians(0))
    this.crosshair.y = this.y - this.crosshairRadius * Math.sin(toRadians(0))

    // Shield
    this.shield.x = this.x
    this.shield.y = this.y
    if (this.shield.health === 0) {
      this.isShieldActive = false
    }

    // Prevent moving down over planet
    this.body.y = Math.min(this.body.y, this.game.maxY - (this.body.height / 2))
  }
}
