import EventBus from '../js/event-bus'

const screenWidth  = window.innerWidth
const screenHeight  = window.innerHeight

const eventBus = new EventBus()

export default class Home {
  onStart() {

  }

  eventRegister() {
    return {
      'touchstart': () => {
        eventBus.emit('change-stage', 'game')
      }
    }
  }

  render(ctx) {
    ctx.fillStyle = '#fff'
    ctx.font = '30px Arial'
    ctx.fillText('开始游戏', screenWidth / 2, screenHeight / 2)
  }
}