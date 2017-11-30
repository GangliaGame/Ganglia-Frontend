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
      }
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

    this.game.onHullStrengthChanged = this.onHullStrengthChanged.bind(this)

    this.setupStats()
  }

  onHullStrengthChanged(hullStrength) {
    const stats = _.cloneDeep(this.state.stats)
    stats.hullStrength = hullStrength
    this.setState({ stats })
  }

  setupStats() {
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

// ReactDOM.render(
//   <Provider store={store}>
//     {React.createElement(connect(mapStateToProps)(App))}
//   </Provider>,
//   document.getElementById('root'),
// )
