import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'
import { createStore } from 'redux'

import Stats from 'stats.js'

import HUD from './HUD'
import Main from './Main'
import './index.css'
import GameServer from './GameServer'

// Reducer
function hullHealth(state = 100, action) {
  switch (action.type) {
    case 'HEAL':
      return state + action.amount
    case 'DAMAGE':
      return state - action.amount
    default:
      return state
  }
}

// Store
let store = createStore(hullHealth)

// Map Redux state to component props
function mapStateToProps(state) {
  return {
    hull: {
      health: state,
      regen: 0,
    },
  }
}

class App extends React.Component {
  initializeGame(element) {
    const UI_HEIGHT_PX = window.innerHeight * 0.5
    this.game = new Phaser.Game(
      window.innerWidth,
      window.innerHeight - UI_HEIGHT_PX,
      Phaser.CANVAS,
      element,
    )
    this.game.state.add('Main', Main, false)
    this.game.state.start('Main')
    this.game.server = new GameServer()

    this.setupStats()
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
        <div ref={this.initializeGame.bind(this)}/>
        <HUD {...this.props}/>
      </div>
    )
  }
}

ReactDOM.render(
  <Provider store={store}>
    {React.createElement(connect(mapStateToProps)(App))}
  </Provider>,
  document.getElementById('root'),
)
