import _ from 'lodash'
import Stats from 'stats.js'
/* eslint-disable */
import PIXI from 'pixi'
import 'p2'
import Phaser from 'phaser'
/* eslint-enable */
import PlayerShip from './PlayerShip'
import Enemy from './Enemy'
import GameServer from './GameServer'

class Main extends Phaser.State {
  init() {
    this.game.renderer.renderSession.roundPixels = true
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.maxDistance = 1000
    this.minutesToPlanet = 2
    this.isGameOver = false
    this.distanceRemaining = this.maxDistance
    this.msPerDistanceUnit = (this.minutesToPlanet * 60 * 1000) / this.maxDistance
    this.game.stage.disableVisibilityChange = true
  }

  preload() {
    this.load.image('background', 'assets/back2.png')
    this.load.image('shield', 'assets/shield.png')
    this.load.image('planet-moon', 'assets/planets/moon.png')
    this.load.image('player', 'assets/player-ship.png')
    this.load.image('crosshair', 'assets/crosshair.png')
    this.load.image('hpBar', 'assets/hpBar.png')
    this.load.image('hpBarOutline', 'assets/hpBarOutline.png')
    this.load.image('weaponLV0', 'assets/weaponLV0.png')
    this.load.image('weaponLV1', 'assets/weaponLV1.png')
    this.load.image('weaponLV2', 'assets/weaponLV2.png')
    this.load.image('weaponLV3', 'assets/weaponLV3.png')
    this.load.image('cursor', 'assets/cursor.png')

    this.load.image('bullet-white', 'assets/newBullet-white.png')
    this.load.image('enemy', 'assets/enemy.png')

    for (let i = 1; i <= 11; i++) {
      this.load.image(`bullet${i}`, `assets/bullet${i}.png`)
    }
  }

  create() {
    // Background
    this.background = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background')
    this.background.autoScroll(0, -50)

    // Planet
    const planetPeek = 150
    this.planet = this.add.sprite(this.game.world.centerX, this.game.height - planetPeek, 'planet-moon')
    this.planet.anchor.setTo(0.5, 0.5)
    this.planet.scale.set(1.25, 1.25)
    this.planet.y = this.game.height - planetPeek + (this.planet.height / 2)
    this.planet.update = () => { this.planet.angle += 0.01 }

    // Distance to planet text
    const rectWidth = 440
    const rectHeight = 40
    const rectOffset = 8
    const graphics = this.game.add.graphics(
      this.game.world.centerX - (rectWidth / 2),
      this.game.height - rectHeight - rectOffset,
    )
    graphics.lineStyle(2, 0xffffff, 1)
    graphics.beginFill(0x000000, 0.65)
    graphics.drawRoundedRect(0, 0, rectWidth, rectHeight, 10)
    this.distanceText = this.game.add.text(
      this.game.world.centerX - 205,
      this.game.height - 45, '',
      { font: '26px Orbitron', fill: 'white' },
    )

    // Calculate a maximum y-coordinate, which other sprites can
    // use to avoid creating themselves over the planet area
    this.game.maxY = this.game.height - planetPeek

    // Player ship
    this.player = this.game.add.existing(new PlayerShip(this.game))
    this.game.player = this.player

    // Add left and right enemies
    this.enemies = []
    _.times(10, () => this.addEnemy(true))
    _.times(10, () => this.addEnemy(false))

    // Server events
    this.game.server.onNewGameState = this.onNewGameState.bind(this)
    this.game.server.onMove = this.onMove.bind(this)

    // Input
    // Add enemy to left or right side (randomly)
    this.game.input.keyboard
      .addKey(Phaser.Keyboard.E)
      .onDown.add(() => this.addEnemy(Boolean(_.random(0, 1))), this)
  }

  addEnemy(isLeftSide) {
    let x = this.game.width - 100 * Math.random()
    let y = Math.min(this.game.maxY, (this.game.height - 150) * Math.random() + 150)
    if (isLeftSide) {
      x = 100 * Math.random()
      y = Math.min(this.game.maxY, (this.game.height - 150) * Math.random() + 150)
    }
    const enemy = this.game.add.existing(new Enemy(this.game, x, y, isLeftSide))
    this.enemies.push(enemy)
  }

  onMove(direction) {
    if (direction === 'up') this.player.moveUp()
    else if (direction === 'down') this.player.moveDown()
  }

  onNewGameState(gameState) {
    this.player.setActiveWeapon(gameState.weaponLevel)
    if (this.player.isShieldActive && !gameState.isShieldActive) {
      this.player.deactivateShield()
    } else if (!this.player.isShieldActive && gameState.isShieldActive) {
      this.player.activateShield()
    }
  }

  update() {
    // Update game play time
    this.game.playTimeMS = this.game.time.now - this.game.time.pauseDuration

    // Update distance travelled
    const distanceTravelled = this.game.playTimeMS / this.msPerDistanceUnit
    this.distanceRemaining = _.round(Math.max(0, this.maxDistance - distanceTravelled))
    this.distanceText.text = `DISTANCE TO PLANET: ${this.distanceRemaining}`

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

class Game extends Phaser.Game {
  constructor() {
    super(window.innerWidth, window.innerHeight, Phaser.CANVAS)
    this.state.add('Main', Main, false)
    this.state.start('Main')
    this.server = new GameServer()

    this.setupStats()
  }

  setupStats() {
    // Setup the new stats panel.
    const stats = new Stats()
    document.body.appendChild(stats.dom)

    // Monkey-patch the update loop so we can track the timing.
    const updateLoop = this.update
    this.update = (...args) => {
      stats.begin()
      updateLoop.apply(this, args)
      stats.end()
    }
  }
}

new Game()
