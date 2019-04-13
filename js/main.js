import Player     from './player/index'
import Enemy      from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo   from './runtime/gameinfo'
import Music      from './runtime/music'
import DataBus    from './databus'
import StandardChessBoard from './chessboard/standard'
import NumberPicker from './toolbar/number-picker'
import ControlPanel from './toolbar/control-panel'
import EventBus from './event-bus'

const eventBus = new EventBus()

let ctx = canvas.getContext('2d')
let databus = new DataBus()

ctx.font = "20px Arial"
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId    = 0
    this.touchHandler = this.touchEventHandler.bind(this)

    this.restart()
  }

  restart() {
    databus.reset()
    eventBus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg       = new BackGround(ctx)
    this.player   = new Player(ctx)
    this.gameinfo = new GameInfo()
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

    eventBus.on('on-number-pick', number => {
      this.chessBoard.setNumberToSelectedCell(number)
      this.chessBoard.drawToCanvas(ctx)
    })

    wx.request({
      url: 'http://122.128.107.115:1338/sudoku/api/generate',
      success: (res) => {
        this.chessBoard.setCells(res.data)
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

    canvas.addEventListener('touchstart', this.touchHandler)
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if ( databus.frame % 30 === 0 ) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    let that = this

    databus.bullets.forEach((bullet) => {
      for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
        let enemy = databus.enemys[i]

        if ( !enemy.isPlaying && enemy.isCollideWith(bullet) ) {
          enemy.playAnimation()
          that.music.playExplosion()

          bullet.visible = false
          databus.score  += 1

          break
        }
      }
    })

    for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
      let enemy = databus.enemys[i]

      if ( this.player.isCollideWith(enemy) ) {
        databus.gameOver = true

        break
      }
    }
  }

  // 统一触摸事件处理逻辑
  touchEventHandler(e) {
    this.chessBoard.touchStartHandler(e)
    this.numberPicker.touchStartHandler(e)
    this.controlPanel.touchStartHandler(e)
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

    // databus.bullets
    //       .concat(databus.enemys)
    //       .forEach((item) => {
    //           item.drawToCanvas(ctx)
    //         })

    // this.player.drawToCanvas(ctx)

    // databus.animations.forEach((ani) => {
    //   if ( ani.isPlaying ) {
    //     ani.aniRender(ctx)
    //   }
    // })

    // this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    // if ( databus.gameOver ) {
    //   this.gameinfo.renderGameOver(ctx, databus.score)

    //   if ( !this.hasEventBind ) {
    //     this.hasEventBind = true
    //     this.touchHandler = this.touchEventHandler.bind(this)
    //     canvas.addEventListener('touchstart', this.touchHandler)
    //   }
    // }
  }

  // 游戏逻辑更新主函数
  update() {
    if ( databus.gameOver )
      return;

    this.bg.update()

    databus.bullets
           .concat(databus.enemys)
           .forEach((item) => {
              item.update()
            })

    this.enemyGenerate()

    this.collisionDetection()

    if ( databus.frame % 20 === 0 ) {
      this.player.shoot()
      this.music.playShoot()
    }
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
