import { SingleBulletWeapon, TripleBulletWeapon, BeamWeapon } from './weapons'

function toRadians(angle) {
  return angle * (Math.PI / 180)
}

export default class PlayerShip extends Phaser.Sprite {
  constructor(game) {
    super(game, game.width / 2, game.height / 2, 'player')
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.anchor.setTo(0.5, 0.5)

    // Firing
    this.firingAngleDelta = 5
    this.crosshairRadius = 100
    this.firingAngle = 0

    // Movement
    this.movementSpeed = 100
    this.body.collideWorldBounds = true

    // Shields
    this.isShieldEnabled = false
    this.shield = game.add.sprite(this.x, this.y, 'shield')
    this.shield.anchor.setTo(0.5, 0.5)
    game.physics.enable(this.shield, Phaser.Physics.ARCADE)
    this.shield.maxHealth = 50

    // Health
    this.maxHealth = 100
    this.health = 100
    this.hitPointsBarOutline = game.add.sprite(this.x + 3, this.y - 119, 'hpBarOutline')
    this.hitPointsBarOutline.anchor.setTo(0.5, 0.5)
    this.hitPointsBar = game.add.sprite(this.x - 125, this.y - 132, 'hpBar')
    this.hitPointsBar.anchor.setTo(0, 0)
    this.hitPointsBar.update = () => {
      this.hitPointsBarOutline.x = this.x + 3
      this.hitPointsBarOutline.y = this.y - 119
      this.hitPointsBar.x = this.x - 125
      this.hitPointsBar.y = this.y - 132
      this.hitPointsBar.scale.x = this.health / this.maxHealth
    }

    // Weapons
    this.weapons = []
    this.currentWeapon = 0

    this.weaponLVactive = 3
    this.weaponLV = this.game.add.sprite(0, 20, 'weaponLV3')
    this.weaponLV.scale.x = 0.5
    this.weaponLV.scale.y = 0.5

    this.weaponCursor = this.game.add.sprite(400, 20, 'cursor')
    this.weaponCursor.scale.x = 0.5
    this.weaponCursor.scale.y = 0.5

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

    // Input (controls)
    this.cursors = game.input.keyboard.createCursorKeys()

    // Bind hotkeys (kinda hacky)
    const hotkeys = {
      ENTER: this.nextWeapon.bind(this),
      S: this.toggleShield.bind(this),
      UP: this.moveDown.bind(this),
      DOWN: this.moveUp.bind(this),
    }
    Object.entries(hotkeys).forEach(([key, handler]) => {
      this.game.input.keyboard
        .addKey(Phaser.Keyboard[key])
        .onDown.add(handler)
    })
  }

  toggleShield() {
    this.isShieldEnabled = !this.isShieldEnabled
    this.shield.health = 100
  }

  setActiveWeapon(weaponNumber) {
    this.weaponLVactive = weaponNumber
    this.weaponLV.loadTexture(`weaponLV${this.weaponLVactive}`, 0)
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeapon]
  }

  nextWeapon() {
    //  Tidy-up the current weapon
    if (this.currentWeapon > 2) {
      this.weapons[this.currentWeapon].reset()
    } else {
      this.weapons[this.currentWeapon].visible = false
      this.weapons[this.currentWeapon].callAll('reset', null, 0, 0)
      this.weapons[this.currentWeapon].setAll('exists', false)
    }

    //  Activate the new one
    this.currentWeapon += 1
    if (this.currentWeapon > 2) { this.currentWeapon = 0 }

    // XXX: This is a hack to only use one cursor.
    // Couldn't find a reliable way to calculate this without
    // magic numbers.
    this.weaponCursor.y = 20 + 37 * this.currentWeapon

    this.weapons[this.currentWeapon].visible = true
  }

  moveDown() {
    this.body.velocity.y = this.movementSpeed
  }

  moveUp() {
    this.body.velocity.y = -this.movementSpeed
  }

  update() {
    this.body.velocity.set(0)

    this.crosshair.x = this.x + this.crosshairRadius * Math.cos(toRadians(this.firingAngle))
    this.crosshair.y = this.y - this.crosshairRadius * Math.sin(toRadians(this.firingAngle))

    if (this.cursors.left.isDown) {
      this.firingAngle += this.firingAngleDelta
    } else if (this.cursors.right.isDown) {
      this.firingAngle -= this.firingAngleDelta
    }

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      if (this.weaponLVactive > this.currentWeapon) {
        this.weapons[this.currentWeapon].fire(this)
      }
    }

    // Shield
    this.shield.exists = this.isShieldEnabled
    this.shield.x = this.x
    this.shield.y = this.y
    if (this.shield.health === 0) {
      this.isShieldEnabled = false
    }

    // Prevent moving down over planet
    this.body.y = Math.min(this.body.y, this.game.maxY - (this.body.height / 2))
  }
}
