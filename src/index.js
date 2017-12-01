import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'

import Stats from 'stats.js'

import HUD from './HUD'
import Main from './Main'
import './index.css'
import GameServer from './GameServer'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      stats: {
        hullStrength: 100,
        weapons: [],
        shields: [],
        propulsion: 0,
        repairs: 0,
        communications: false,
      },
    }
    this.initializeGameOnSurface()
  }

  initializeGameOnSurface() {
    const UI_HEIGHT_PX = window.innerHeight * 0.5
    this.game = new Phaser.Game(
      window.innerWidth,
      window.innerHeight - UI_HEIGHT_PX,
      Phaser.CANVAS,
      'surface',
    )
    this.game.state.add('Main', Main, false)
    this.game.state.start('Main')
    this.game.server = new GameServer()

    const gameMainState = this.game.state.states.Main

    // Server events
    this.game.server.socket.on('move-up', data => gameMainState.onMoveUp(data))
    this.game.server.socket.on('move-down', data => gameMainState.onMoveDown(data))
    this.game.server.socket.on('fire', data => gameMainState.onFire(data))

    // Two callbacks for each server event.
    // The first is for react, and second for phaser.
    this.game.server.socket.on('weapons', data => {
      this.onWeaponsChanged(data)
      gameMainState.onWeaponsChanged(data)
    })
    this.game.server.socket.on('shields', data => {
      this.onShieldsChanged(data)
      gameMainState.onShieldsChanged(data)
    })
    this.game.server.socket.on('propulsion', data => {
      this.onPropulsionChanged(data)
      gameMainState.onPropulsionChanged(data)
    })
    this.game.server.socket.on('repairs', data => {
      this.onRepairsChanged(data)
      gameMainState.onRepairsChanged(data)
    })
    this.game.server.socket.on('communications', data => {
      this.onCommunicationsChanged(data)
      gameMainState.onCommunicationsChanged(data)
    })

    this.game.onHullStrengthChanged = this.onHullStrengthChanged.bind(this)

    this.setupPerformanceStatistics()
  }

  onHullStrengthChanged(hullStrength) {
    const stats = _.cloneDeep(this.state.stats)
    stats.hullStrength = hullStrength
    this.setState({ stats })
  }

  onWeaponsChanged(weapons) {
    const stats = _.cloneDeep(this.state.stats)
    stats.weapons = weapons
    this.setState({ stats })
  }

  onShieldsChanged(shields) {
    const stats = _.cloneDeep(this.state.stats)
    stats.shields = shields
    this.setState({ stats })
  }

  onPropulsionChanged(propulsion) {
    const stats = _.cloneDeep(this.state.stats)
    stats.propulsion = propulsion
    this.setState({ stats })
  }

  onRepairsChanged(repairs) {
    const stats = _.cloneDeep(this.state.stats)
    stats.repairs = repairs
    this.setState({ stats })
  }

  onCommunicationsChanged(communications) {
    const stats = _.cloneDeep(this.state.stats)
    stats.communications = communications
    this.setState({ stats })
  }

  setupPerformanceStatistics() {
    // Setup the new stats panel.
    const stats = new Stats()
    document.body.appendChild(stats.dom)

    // Monkey-patch the update loop so we can track the timing.
    const updateLoop = this.game.update
    this.game.update = (...args) => {
      stats.begin()
      updateLoop.apply(this.game, args)
      stats.end()
    }
  }

  render() {
    return (
      <div className="App">
        <HUD {...this.state.stats}/>
      </div>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('UI'))
