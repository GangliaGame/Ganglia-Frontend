import _ from 'lodash'
import PlayerShip from './PlayerShip'
import { Enemy } from './Enemy'

export default class Main extends Phaser.State {
  init() {
    this.game.renderer.renderSession.roundPixels = true
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.maxDistance = 5000
    this.minutesToPlanet = 5
    this.isGameOver = false
    this.distanceRemaining = this.maxDistance
    this.msPerDistanceUnit = (this.minutesToPlanet * 60 * 1000) / this.maxDistance
    this.game.stage.disableVisibilityChange = true
  }

  preload() {
    this.load.image('background', 'assets/background.png')
    this.load.image('shield', 'assets/shield.png')
    this.load.image('planet', 'assets/planet.png')
    this.load.image('player', 'assets/player-ship.png')
    this.load.image('bullet', 'assets/bullets/beam_Y.png')

    this.load.image('bullet_R', 'assets/bullets/beam_R.png')
    this.load.image('bullet_Y', 'assets/bullets/beam_Y.png')
    this.load.image('bullet_B', 'assets/bullets/beam_B.png')

    this.load.image('shield_R', 'assets/shields/beam_R.png')
    this.load.image('shield_Y', 'assets/shields/beam_Y.png')
    this.load.image('shield_B', 'assets/shields/beam_B.png')

    // Giada's Edition: Enemy's Color(R/Y/B) + Its Weapon's Color(R/Y/B)
    this.load.spritesheet('enemy_RR', 'assets/enemies/enemy_RR.png', 150, 65)
    this.load.spritesheet('enemy_RY', 'assets/enemies/enemy_RY.png', 150, 65)
    this.load.spritesheet('enemy_RB', 'assets/enemies/enemy_RB.png', 150, 65)
    this.load.spritesheet('enemy_YR', 'assets/enemies/enemy_YR.png', 150, 65)
    this.load.spritesheet('enemy_YY', 'assets/enemies/enemy_YY.png', 150, 65)
    this.load.spritesheet('enemy_YB', 'assets/enemies/enemy_YB.png', 150, 65)
    this.load.spritesheet('enemy_BR', 'assets/enemies/enemy_BR.png', 150, 65)
    this.load.spritesheet('enemy_BY', 'assets/enemies/enemy_BY.png', 150, 65)
    this.load.spritesheet('enemy_BB', 'assets/enemies/enemy_BB.png', 150, 65)
  }

  create() {
    // Background
    const bgHeightTweak = 7.1
    this.background = this.add.tileSprite(0, 0, this.game.height * bgHeightTweak, this.game.height, 'background')
    this.background.autoScroll(-10, 0)

    // Planet
    this.planet = this.add.sprite(this.game.world.centerX, this.game.height, 'planet')
    this.planet.anchor.setTo(0.5, 0.5)
    this.planet.scale.set(0.70, 0.70)
    this.planet.x = this.game.width
    this.planet.y = this.game.height / 2
    this.planet.update = () => { this.planet.angle -= 0.05 }

    // Distance to planet text
    const rectWidth = 160
    const rectHeight = 46
    const rectOffsetFromEdge = 30
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
    this.maxX = this.game.width - this.planet.width / 2 - rectOffsetFromEdge

    // Player ship
    this.player = this.game.add.existing(new PlayerShip(this.game))
    this.game.player = this.player

    // Add left and right enemies
    this.enemies = []
    // _.times(10, () => this.addPatrolEnemy(false))
    _.times(3, i => this.addEnemy(100 + 100 * i))

    // Server events
    this.game.server.socket.on('move-up', data => this.onMoveUp(data))
    this.game.server.socket.on('move-down', data => this.onMoveDown(data))
    this.game.server.socket.on('fire', () => this.player.fireWeapon())
    // this.server.socket.on('shield', data => this.onShield(data))
    // this.server.socket.on('weapon', data => this.onNewWeaponColors(data))

    // Input
    // Add enemy to left or right side (randomly)
    this.game.input.keyboard
      .addKey(Phaser.Keyboard.E)
      .onDown.add(() => this.addEnemy(Boolean(_.random(0, 1))), this)
  }

  addEnemy(y) {
    const x = this.maxX
    const enemy = this.game.add.existing(new Enemy(this.game, x, y))
    this.enemies.push(enemy)
  }

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

  onMoveUp(data) {
    if (data === 'stop') window.clearTimeout(this.moveTimer)
    else this.moveTimer = window.setInterval(() => this.player.moveUp(), 10)
  }

  onMoveDown(data) {
    if (data === 'stop') window.clearTimeout(this.moveTimer)
    else this.moveTimer = window.setInterval(() => this.player.moveDown(), 10)
  }

  update() {
    // Update game play time
    this.game.playTimeMS = this.game.time.now - this.game.time.pauseDuration

    // Update distance travelled
    const distanceTravelled = this.game.playTimeMS / this.msPerDistanceUnit
    this.distanceRemaining = _.round(Math.max(0, this.maxDistance - distanceTravelled))
    this.distanceText.text = `${this.distanceRemaining} KM`

    // Kill sprites marked for killing
    this.game.world.children
      .filter(child => child.kill_in_next_tick)
      .map(child => child.kill())

    const enemyCollisionDamage = 10

    // Player <-> enemy bullet collision
    this.enemies.map(enemy => this.physics.arcade.overlap(
      enemy.weapon,
      this.player,
      (player, bullet) => {
        player.damage(enemy.weapon.bulletDamage)
        bullet.kill()
      },
      null,
      this,
    ))

    // Enemy <-> player bullet collision
    this.enemies.map(enemy => this.physics.arcade.overlap(
      enemy,
      this.player.getCurrentWeapon(),
      (e, bullet) => {
        enemy.damage(this.player.getCurrentWeapon().bulletDamage)
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
