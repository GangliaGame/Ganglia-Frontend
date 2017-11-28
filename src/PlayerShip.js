import { SingleBulletWeapon, TripleBulletWeapon, BeamWeapon } from './weapons'

const toRadians = angle => angle * (Math.PI / 180)

export default class PlayerShip extends Phaser.Sprite {
  constructor(game) {
    super(game, 50, game.height / 2, 'player')
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.5, 0.5)

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
    this.sight = this.game.add.graphics()
    this.sight.beginFill(0xffffff, 0.25)
    this.sight.drawRoundedRect(0, 0, this.game.width * 0.8, 5, 10)

    const hpBarWidth = this.width * 0.6
    const hpBarHeight = 10
    this.hpBarOutline = this.game.add.graphics()
    this.hpBar = this.game.add.graphics()
    this.hpBarOutline.beginFill(0xffffff, 1)
    this.hpBarOutline.drawRoundedRect(0, 0, hpBarWidth, hpBarHeight, 50)
    this.hpBar.beginFill(0x30ee02, 1)
    this.hpBar.drawRoundedRect(0, 0, hpBarWidth, hpBarHeight, 50)
    this.hpBar.update = () => {
      const x = this.centerX - hpBarWidth * 0.4
      const y = this.y - this.height * 0.65
      this.hpBar.x = x
      this.hpBar.y = y
      this.hpBarOutline.x = x
      this.hpBarOutline.y = y
      this.hpBar.scale.x = this.health / this.maxHealth
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
