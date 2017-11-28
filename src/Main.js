import PlayerShip from './PlayerShip'
import { Enemy, PatrolEnemy } from './Enemy'
import _ from 'lodash'


export default class Main extends Phaser.State {
  init() {
    this.game.renderer.renderSession.roundPixels = true
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.maxDistance = 5000
    this.minutesToPlanet = 2
    this.isGameOver = false
    this.distanceRemaining = this.maxDistance
    this.msPerDistanceUnit = (this.minutesToPlanet * 60 * 1000) / this.maxDistance
    // this.game.stage.disableVisibilityChange = true
  }

  preload() {
    this.load.image('background', 'assets/background.png')
    this.load.image('shield', 'assets/shield.png')
    this.load.image('planet-moon', 'assets/planets/moon.png')
    this.load.image('player', 'assets/player-ship.png')
    this.load.image('bullet', 'assets/bullet.png')
    this.load.image('enemy', 'assets/enemy.png')
  }

  create() {
    // Background
    this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background')
    this.background.autoScroll(-25, 0)

    // Planet
    this.planet = this.add.sprite(this.game.world.centerX, this.game.height, 'planet-moon')
    this.planet.anchor.setTo(0.5, 0.5)
    this.planet.scale.set(0.16, 0.16)
    this.planet.x = this.game.width
    this.planet.y = this.game.height / 2
    this.planet.update = () => { this.planet.angle += 0.1 }

    // Distance to planet text
    const rectWidth = 150
    const rectHeight = 46
    const rectOffsetFromEdge = 40
    const offsetLeft = 14
    const offsetTop = 5
    const graphics = this.game.add.graphics(
      this.game.width - rectWidth - rectOffsetFromEdge,
      this.game.height / 2 - (rectHeight / 2),
    )
    graphics.lineStyle(2, 0x000000, 1)
    graphics.beginFill(0xffffff)
    graphics.drawRoundedRect(0, 0, rectWidth, rectHeight, 25)
    this.distanceText = this.game.add.text(
      this.game.width - rectWidth - rectOffsetFromEdge + offsetLeft,
      this.game.height / 2 - (rectHeight / 2) + offsetTop,
      '',
      { font: '31px DDC Hardware', fill: 'black' },
    )

    // Player ship
    this.player = this.game.add.existing(new PlayerShip(this.game))
    this.game.player = this.player

    // Add left and right enemies
    this.enemies = []
    // _.times(10, () => this.addPatrolEnemy(false))
    _.times(10, () => this.addEnemy(false))

    // Server events
    this.game.server.socket.on('move', data => this.onMove(data))
    this.game.server.socket.on('fire', () => this.player.fireWeapon())
    // this.server.socket.on('shield', data => this.onShield(data))
    // this.server.socket.on('weapon', data => this.onNewWeaponColors(data))

    // Input
    // Add enemy to left or right side (randomly)
    this.game.input.keyboard
      .addKey(Phaser.Keyboard.E)
      .onDown.add(() => this.addEnemy(Boolean(_.random(0, 1))), this)
  }

  addEnemy() {
    const x = this.game.width - this.planet.width / 2
    const y = this.game.height * Math.random()
    const enemy = this.game.add.existing(new Enemy(this.game, x, y))
    this.enemies.push(enemy)
  }

  // addPatrolEnemy() {
  //   const x = this.game.width - this.planet.width / 2
  //   const y = (this.game.height - 150) * Math.random() + 150
  //   const enemy = this.game.add.existing(new PatrolEnemy(this.game, x, y))
  //   this.enemies.push(enemy)
  // }

  onShield({ condition }) {
    if (condition === 'on') {
      this.player.activateShield()
    } else if (condition === 'off') {
      this.player.deactivateShield()
    }
  }

  onWeapon({ level }) {
    this.player.setActiveWeapon(level)
  }

  onMove({ direction }) {
    if (this.moveTimer) {
      window.clearTimeout(this.moveTimer)
    }
    if (direction === 'up') {
      this.moveTimer = window.setInterval(() => this.player.moveUp(), 10)
    } else if (direction === 'down') {
      this.moveTimer = window.setInterval(() => this.player.moveDown(), 10)
    }
  }

  update() {
    // Update game play time
    this.game.playTimeMS = this.game.time.now - this.game.time.pauseDuration

    // Update distance travelled
    const distanceTravelled = this.game.playTimeMS / this.msPerDistanceUnit
    this.distanceRemaining = _.round(Math.max(0, this.maxDistance - distanceTravelled))
    this.distanceText.text = `${this.distanceRemaining} KM`

    // Destroy sprites marked for killing
    this.game.world.children
      .filter(child => child.kill_in_next_tick)
      .map(child => child.kill())

    const enemyCollisionDamage = 10

    // Enemy <-> bullet collision
    this.enemies.map(enemy => this.physics.arcade.overlap(
      enemy,
      this.player.getCurrentWeapon(),
      (e, bullet) => {
        enemy.kill_in_next_tick = true
        bullet.kill()
      },
      null,
      this,
    ))

    // Enemy <-> player ship (no shield) collision
    this.enemies.map(enemy => this.physics.arcade.overlap(
      enemy,
      this.player,
      (e, player) => {
        enemy.kill_in_next_tick = true
        player.damage(enemyCollisionDamage)
        // store.dispatch({ type: 'DAMAGE', amount: enemyCollisionDamage })
      },
      null,
      this,
    ))

    // Enemy <-> player shield collision
    this.enemies.map(enemy => this.physics.arcade.overlap(
      enemy,
      this.player.shield,
      (e, shield) => {
        shield.damage(enemyCollisionDamage)
        e.kill_in_next_tick = true
      },
      null,
      this,
    ))

    // Check if game ended and notify server if needed
    this.checkAndNotifyIfGameEnded()
  }

  checkAndNotifyIfGameEnded() {
    let isGameEnding = false
    if (this.player.health === 0) {
      isGameEnding = true
    }
    if (this.distanceRemaining === 0) {
      isGameEnding = true
    }

    // Did the game just end now (i.e. it was previously not ended)?
    if (isGameEnding && this.isGameOver === false) {
      this.game.server.notifyGameLost()
      this.isGameOver = true
    }
  }
}
