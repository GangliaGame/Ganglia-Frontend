import Weapon from './Weapon'
import HealthBar from './HealthBar'

const toRadians = angle => angle * (Math.PI / 180)

export default class PlayerShip extends Phaser.Sprite {
  constructor(game) {
    super(game, 50, game.height / 2, 'player')
    this.animations.add('move')
    this.animations.play('move', 20, true)

    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.4, 0.4)

    // Firing
    this.sightOffset = 100

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

    // Sight
    this.sight = this.game.add.graphics()
    this.sight.beginFill(0xffffff, 0.25)
    this.sight.drawRoundedRect(0, 0, this.game.width * 0.7, 5, 10)

    // HP bar
    this.healthBar = new HealthBar(this)

    // Weapons
    this.weapons = []
    this.weaponDamage = 10
    this.currentWeapon = 0
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

  setWeapons(colors) {
    const colorToWeaponType = color => color[0].toUpperCase()
    this.weapons = colors.map((color, i) => (
      new Weapon(this, this.weaponDamage, colorToWeaponType(color), 50 * i * (Math.exp(1, i)))
    ))
    // 0 => 50 * 0 => 0
    // 1 => 50 * 1 => 50
    // 2 => 50 * -1 => -50
  }


  fire() {
    this.weapons.forEach(weapon => weapon.fire(this))
  }

  moveDown() {
    this.body.velocity.y = this.movementSpeed
  }

  moveUp() {
    this.body.velocity.y = -this.movementSpeed
  }

  update() {
    if (this.health !== this.prevHealth) {
      this.game.onHullStrengthChanged(this.health)
      this.prevHealth = this.health
    }

    this.body.velocity.set(0)

    // Update crosshair location
    this.sight.x = this.x + this.sightOffset * Math.cos(toRadians(0))
    this.sight.y = this.y - this.sightOffset * Math.sin(toRadians(0))

    // Shield
    this.shield.x = this.x
    this.shield.y = this.y
    if (this.shield.health === 0) {
      this.isShieldActive = false
    }
  }
}
