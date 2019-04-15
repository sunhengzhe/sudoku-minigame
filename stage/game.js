import BackGround from '../js/runtime/background'
import Music      from '../js/runtime/music'
import DataBus    from '../js/databus'
import StandardChessBoard from '../js/chessboard/standard'
import NumberPicker from '../js/toolbar/number-picker'
import ControlPanel from '../js/toolbar/control-panel'
import EventBus from '../js/event-bus'

const eventBus = new EventBus()

let ctx = canvas.getContext('2d')
let dataBus = new DataBus()

ctx.textAlign = 'center'
ctx.textBaseline = 'middle'

/**
 * 游戏页
 */
export default class Game {
  onStart() {
    eventBus.on('on-game-start', () => {
      this.restart()
    })

    eventBus.on('number-pick', number => {
      this.chessBoard.setNumberToSelectedCell(number)
      this.chessBoard.drawToCanvas(ctx)
    })

    this.restart()
  }

  restart() {
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

    wx.showLoading({ title: '正在努力获取新的题目...', mask: true })
    wx.request({
      url: 'http://122.128.107.115:1338/sudoku/api/generate',
      success: (res) => {
        this.chessBoard.setCells(res.data)
        this.numberPicker.initNumbers(this.chessBoard.cells)
      },
      fail: () => {

      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }

  eventRegister() {
    return {
      'touchstart': (e) => {
        this.chessBoard.touchStartHandler(e)
        this.numberPicker.touchStartHandler(e)
        this.controlPanel.touchStartHandler(e)
      },
      'touchend': (e) => {
        this.numberPicker.touchEndHandler(e)
      }
    }
  }

  render(ctx) {
    this.bg.render(ctx)

    this.chessBoard.drawToCanvas(ctx)
    this.controlPanel.drawToCanvas(ctx)
    this.numberPicker.drawToCanvas(ctx)
  }
}