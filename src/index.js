import React from 'react'
import ReactDOM from 'react-dom'
import Stats from 'stats.js'
import _ from 'lodash'
/* eslint-disable */
import PIXI from 'pixi'
import 'p2'
import Phaser from 'phaser'
/* eslint-enable */
import { SingleBulletWeapon, TripleBulletWeapon, BeamWeapon } from './weapons'

function toDegrees(angle) {
  return angle * (180 / Math.PI)
}

function toRadians(angle) {
  return angle * (Math.PI / 180)
}

class GameServer {
  constructor() {
    this.pollFrequency = 250 // ms
    this.pollTimeout = 1500 // ms
    this.baseURL = (function () {
      return window.location.search.includes('local') ?
        'http://localhost:9000' :
        'https://ganglia-server.herokuapp.com'
    }())
    setInterval(this.onPollTimer.bind(this), this.pollFrequency)
  }

  onPollTimer() {
    this.fetch('state')
      .then(serverState => (typeof this.onNewGameState === 'function') && this.onNewGameState(serverState))
  }

  fetch(path) {
    function timeout(ms, promise) {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('timeout')), ms)
        promise.then(resolve, reject)
      })
    }
    return timeout(this.pollTimeout, fetch(`${this.baseURL}/${path}`))
      .then(response => response.json())
      .catch((error) => {
        console.error(error)
      })
  }
}

const server = new GameServer()

class Enemy extends Phaser.Sprite {
  constructor(game, x, y, isLeftSide = true) {
    super(game, x, y, 'enemy')
    this.isLeftSide = isLeftSide
    this.scaleFactor = 0.5
    this.scale.y = this.scaleFactor
    game.physics.enable(this, Phaser.Physics.ARCADE)
    this.body.collideWorldBounds = true
  }

  update() {
    const deltaX = 4
    // const deltaY = (Math.random() * 0.2) - 0.1

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
    // this.y += this.isLeftSide ? deltaY : -deltaY
  }
}

class PlayerShip extends Phaser.Sprite {
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
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.S])

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.ENTER)
      .onDown.add(this.nextWeapon, this)

    this.game.input.keyboard
      .addKey(Phaser.Keyboard.S)
      .onDown.add(this.toggleShield, this)
  }

  toggleShield() {
    this.isShieldEnabled = !this.isShieldEnabled
    this.shield.health = 100
  }

  setActiveWeapon(weaponNumber) {
    this.weaponLVactive = weaponNumber
    this.updateLV()
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

  updateLV() {
    if (this.weaponLVactive === 0) {
      this.weaponLV.loadTexture('weaponLV0', 0)
    } else if (this.weaponLVactive === 1) {
      this.weaponLV.loadTexture('weaponLV1', 0)
    } else if (this.weaponLVactive === 2) {
      this.weaponLV.loadTexture('weaponLV2', 0)
    } else if (this.weaponLVactive === 3) {
      this.weaponLV.loadTexture('weaponLV3', 0)
    }
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

    if (this.cursors.up.isDown) {
      this.body.velocity.y = -this.movementSpeed
    } else if (this.cursors.down.isDown) {
      this.body.velocity.y = this.movementSpeed
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

class Main extends Phaser.State {
  init() {
    this.game.renderer.renderSession.roundPixels = true
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.distanceToPlanet = 1000
    this.minutesToPlanet = 1
    this.distanceRemaining = this.distanceToPlanet
    this.msPerDistanceUnit = (this.minutesToPlanet * 60 * 1000) / this.distanceToPlanet
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
    // Enemies
    this.enemies = []

    // Add left-side enemies
    for (let i = 0; i < 10; i++) {
      const x = 250 * Math.random()
      const y = Math.min(this.game.maxY, (this.game.height - 150) * Math.random() + 150)
      const enemy = this.game.add.existing(new Enemy(this.game, x, y))
      this.enemies.push(enemy)
    }

    // Add right-side enemies
    for (let i = 0; i < 10; i++) {
      const x = this.game.width - 250 * Math.random()
      const y = Math.min(this.game.maxY, (this.game.height - 150) * Math.random() + 150)
      const enemy = this.game.add.existing(new Enemy(this.game, x, y, false))
      this.enemies.push(enemy)
    }

    // Playground
    this.player = this.game.add.existing(new PlayerShip(this.game))

    server.onNewGameState = this.onNewGameState.bind(this)
  }

  onNewGameState(gameState) {
    this.player.setActiveWeapon(3 || gameState.weaponLevel)
  }

  checkGameOver() {
    let isGameOver = false
    if (this.player.health === 0) {
      isGameOver = true
    }

    // If game is actually over, notify react
    if (isGameOver) {
      this.game.onGameOver()
    }
  }

  update() {
    this.game.playTimeMS = this.game.time.now - this.game.time.pauseDuration
    const distanceTravelled = this.game.playTimeMS / this.msPerDistanceUnit
    this.distanceRemaining = Math.max(0, this.distanceToPlanet - distanceTravelled).toFixed(0)
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
        bullet.destroy()
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
        console.log(shield.health)
        e.kill_in_next_tick = true
      },
      null,
      this,
    ))

    // Check game over
    this.checkGameOver()
  }

  render() {
    // this.game.debug.spriteInfo(this.player, 0, this.game.height - 75)
  }
}

class Game extends Phaser.Game {
  constructor({ onGameOver }) {
    super(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'game')
    this.onGameOver = onGameOver
    this.state.add('Main', Main, false)
    this.state.start('Main')
    window.game = this

    this.setupStats()
    // window.addEventListener('resize', _.throttle(this.resize.bind(this), 50), false)
  }

  resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    this.scale.setGameSize(width, height)
  }

  /**
   * Display the FPS and MS using Stats.js.
   */
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

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isGameOver: false,
    }
  }

  componentDidMount() {
    this.game = new Game({ onGameOver: this.onGameOver.bind(this) })
  }

  onGameOver() {
    this.setState({ isGameOver: true })
    console.log('ongo')
  }

  render() {
    return (
      <div className="App">
        {
          this.state.isGameOver
          ?
          <div className="GameOver">
            Game Over! You lose.
            <button onClick={() => window.game.state.reset()}>Again?</button>
            </div>
          :

          <div id="game"/>
        }
      </div>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('root'))
