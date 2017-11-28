export default class HealthBar {
  constructor(ship, color = 0x30ee02) {
    this.ship = ship
    this.width = this.ship.width * 0.6
    this.height = 10

    this.outline = ship.game.add.graphics()
    this.outline.beginFill(0xffffff, 1)
    this.outline.drawRoundedRect(0, 0, this.width, this.height, 50)

    this.bar = ship.game.add.graphics()
    this.bar.beginFill(color, 1)
    this.bar.drawRoundedRect(0, 0, this.width, this.height, 50)
    this.bar.update = this.update.bind(this)
  }

  update() {
    const x = this.ship.centerX - this.width * 0.4
    const y = this.ship.y - this.ship.height * 0.65
    this.bar.x = x
    this.bar.y = y
    this.outline.x = x
    this.outline.y = y
    this.bar.scale.x = this.ship.health / this.ship.maxHealth
  }
}
