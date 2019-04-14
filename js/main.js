import BackGround from './runtime/background'
import Music      from './runtime/music'
import DataBus    from './databus'
import StandardChessBoard from './chessboard/standard'
import NumberPicker from './toolbar/number-picker'
import ControlPanel from './toolbar/control-panel'
import EventBus from './event-bus'

const eventBus = new EventBus()

let ctx = canvas.getContext('2d')
let databus = new DataBus()

ctx.textAlign = 'center'
ctx.textBaseline = 'middle'

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId    = 0
    this.touchStartHandler = this.touchStartEventHandler.bind(this)
    this.touchEndHandler = this.touchEndEventHandler.bind(this)

    this.restart()
  }

  restart() {
    databus.reset()
    eventBus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchStartHandler
    )

    canvas.removeEventListener(
      'touchend',
      this.touchEndHandler
    )

    this.bg       = new BackGround(ctx)
    this.music    = new Music()
    this.chessBoard    = new StandardChessBoard()

    const controlPanelTop = this.chessBoard.y + this.chessBoard.size + 10
    this.controlPanel = new ControlPanel({
      y: controlPanelTop
    })

    const numberPickerTop = this.controlPanel.y + this.controlPanel.height + 10
    this.numberPicker = new NumberPicker({
      y: numberPickerTop
    })

    eventBus.on('on-game-start', () => {
      this.restart()
    })

    eventBus.on('number-pick', number => {
      this.chessBoard.setNumberToSelectedCell(number)
      this.chessBoard.drawToCanvas(ctx)
    })

    wx.showLoading({ title: '正在努力获取新的题目...', mask: true })
    wx.request({
      url: 'http://122.128.107.115:1338/sudoku/api/generate',
      success: (res) => {
        this.chessBoard.setCells(res.data)
      },
      fail: () => {

      },
      complete: () => {
        wx.hideLoading()
      }
    })

    this.bindLoop     = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )

    canvas.addEventListener('touchstart', this.touchStartHandler)
    canvas.addEventListener('touchend', this.touchEndHandler)
  }

  // 统一触摸事件处理逻辑
  touchStartEventHandler(e) {
    this.chessBoard.touchStartHandler(e)
    this.numberPicker.touchStartHandler(e)
    this.controlPanel.touchStartHandler(e)
  }

  touchEndEventHandler(e) {
    this.numberPicker.touchEndHandler(e)
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    this.chessBoard.drawToCanvas(ctx)
    this.controlPanel.drawToCanvas(ctx)
    this.numberPicker.drawToCanvas(ctx)
  }

  // 游戏逻辑更新主函数
  update() {
    if ( databus.gameOver )
      return;

    this.bg.update()
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    // this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
