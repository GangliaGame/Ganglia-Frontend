import io from 'socket.io-client'

export default class GameServer {
  constructor() {
    this.pollFrequency = 250 // ms
    this.pollTimeout = 1500 // ms
    this.baseURL = (function () {
      return window.location.search.includes('local') ?
        'http://localhost:9000' :
        'https://ganglia-server.herokuapp.com'
    }())
    this.socket = io(this.baseURL)
    setInterval(this.onPollTimer.bind(this), this.pollFrequency)
    this.socket.on('move:up', () => this.onMove('up'))
    this.socket.on('move:down', () => this.onMove('down'))
    this.socket.on('move:stop', () => this.onMove('stop'))
  }

  onPollTimer() {
    this.fetch('state')
      .then(serverState => (typeof this.onNewGameState === 'function') && this.onNewGameState(serverState))
  }

  notifyGameLost() {
    this.fetch('game/lost')
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
