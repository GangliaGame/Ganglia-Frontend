import Weapon from './Weapon'
import HealthBar from './HealthBar'

export default class PlayerShip extends Phaser.Sprite {
  constructor(game) {
    super(game, 50, game.height / 2, 'player')
    this.animations.add('move')
    this.animations.play('move', 20, true)

    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.5, 0.5)

    this.scale.set(this.game.scaleFactor, this.game.scaleFactor)

    // Movement
    this.movementSpeed = 0
    this.body.collideWorldBounds = true

    // this.tint = 0xff0000
    // setInterval(() => this.tint = 0xffffff * Math.random(), 250)

    // Shields
    this.shieldColors = []
    this.shield = game.add.sprite(this.x, this.y, 'shield_RYB')
    this.shield.anchor.setTo(0.5, 0.5)
    game.physics.enable(this.shield, Phaser.Physics.ARCADE)

    // Health
    this.maxHealth = 100
    this.health = 100

    // Sight
    this.sight = game.add.sprite(this.x, this.y, 'weapon-sight')

    // HP bar
    this.healthBar = new HealthBar(this)

    // Weapons
    this.weapons = []
    this.weaponDamage = 10
    this.currentWeapon = 0

    // Repairs
    this.repairPercentagePerSecond = 0
    this.repairIntervalMsec = 60
    setInterval(this.onRepair.bind(this), this.repairIntervalMsec)
  }

  onRepair() {
    this.heal((this.repairPercentagePerSecond * this.maxHealth) * (this.repairIntervalMsec / 1000))
  }

  setShieldColors(colors) {
    const colorToWeaponType = color => color[0].toUpperCase()
    if (this.isShieldActive) this.deactivateShield()
    else this.activateShield()
  }

  setWeapons(colors) {
    const colorToWeaponType = color => color[0].toUpperCase()
    const bulletSpread = 10 * this.game.scaleFactor
    const bulletAngle = 0
    const spreadRange = [
      [0],
      [bulletSpread / 2, -bulletSpread / 2],
      [0, bulletSpread, -bulletSpread],
    ]
    const angleRange = [
      [0],
      [bulletAngle / 2, -bulletAngle / 2],
      [0, bulletAngle, -bulletAngle],
    ]
    colors.sort()
    this.weapons = colors.map((color, i) => (
      new Weapon(
        this,
        this.weaponDamage / colors.length,
        colorToWeaponType(color),
        spreadRange[colors.length - 1][i],
        angleRange[colors.length - 1][i],
      )
    ))
  }

  setShields(colors) {
    console.log(colors)
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

  setPropulsionLevel(level) {
    const levelSpeedMap = [0, 25, 100]
    this.movementSpeed = levelSpeedMap[level]
  }

  setRepairLevel(level) {
    const repairSpeedMap = [0, 0.005, 0.01, 0.025]
    this.repairPercentagePerSecond = repairSpeedMap[level]
  }

  update() {
    if (this.health !== this.prevHealth) {
      this.game.onHullStrengthChanged(this.health)
      this.prevHealth = this.health
    }

    this.body.velocity.set(0)

    // Shield
    this.shield.x = this.x
    this.shield.y = this.y
    if (this.shield.health === 0) {
      this.isShieldActive = false
    }
  }
}
