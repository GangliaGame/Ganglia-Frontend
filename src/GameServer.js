import io from 'socket.io-client'

export default class GameServer {
  constructor() {
    this.baseURL = (function () {
      return window.location.search.includes('local') ?
        'http://localhost:9000' :
        'https://server.toomanycaptains.com'
    }())
    this.socket = io(this.baseURL)
  }

  notifyGameLost() {
    this.socket.emit('state', { victory: false })
  }
}
