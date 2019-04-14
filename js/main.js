import DataBus    from './databus'
import Game from '../stage/game'
import EventBus from './event-bus';
import Home from '../stage/home'

const ctx = canvas.getContext('2d')
const dataBus = new DataBus()
const eventBus = new EventBus()

ctx.textAlign = 'center'
ctx.textBaseline = 'middle'

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId    = 0
    this.stage = new Home()

    const eventList = ['touchstart', 'touchend']
    eventList.forEach(event => {
      canvas.addEventListener(event, (e) => {
        if (this.stage.eventRegister) {
          const handler = this.stage.eventRegister() || {}
          if (handler[event]) {
            handler[event](e)
          }
        }
      })
    })

    this.onStageChange()

    eventBus.on('change-stage', stage => {
      this.stage = new Game()
      this.onStageChange()
    })
  }

  onStageChange() {
    this.stage.start()

    this.bindLoop     = this.loop.bind(this)

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.stage.render(ctx)
  }

  // 游戏逻辑更新主函数
  update() {
    if ( dataBus.gameOver )
      return;

    this.bg.update()
  }

  // 实现游戏帧循环
  loop() {
    dataBus.frame++

    // this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
