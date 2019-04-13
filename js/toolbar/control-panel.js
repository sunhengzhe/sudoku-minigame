import DataBus from '../databus'

const theme = new DataBus().getTheme()

const screenWidth  = window.innerWidth

const MARGIN_TO_VERTICAL_SIDE = 5;

const BOARD_SIZE = screenWidth - 2 * MARGIN_TO_VERTICAL_SIDE

const rollbackBtn = {
  img: 'images/rollback.png',
  text: '撤销',
  onClick: () => {
    console.log('click rollback')
  }
}

const eraserBtn = {
  img: 'images/eraser.png',
  text: '擦除',
  onClick: () => {
    console.log('click eraser')
  }
}

const noteModeBtn = {
  img: 'images/note.png',
  text: '笔记模式',
  onClick: () => {
    console.log('click note')
  }
}

const replayBtn = {
  img: 'images/replay.png',
  text: '重新开始',
  onClick: () => {
    console.log('click replay')
  }
}

export default class ControlPanel {
  constructor({ x, y } = {}) {
    this.x = MARGIN_TO_VERTICAL_SIDE || x
    this.y = y
    this.height = 50

    this.buttons = [
      rollbackBtn,
      eraserBtn,
      noteModeBtn,
      replayBtn
    ]

    this.buttonWidth = BOARD_SIZE / this.buttons.length

    this.initEvent()
  }

  initEvent() {
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      const x = e.touches[0].clientX
      const y = e.touches[0].clientY

      for (let i = 0; i < this.buttons.length; i++) {
        const btn = this.buttons[i]
        const startX = this.x + i * this.buttonWidth
        const startY = this.y

        if (
          x >= startX &&
          x <= startX + this.buttonWidth &&
          y >= startY &&
          y <= startY + this.height
        ) {
          btn.onClick()
          break
        }
      }
    }).bind(this))
  }

  drawToCanvas(ctx) {
    this.buttons.forEach((button, i) => {
      this.renderBtn(ctx, i, button)
    })
  }

  renderBtn(ctx, i, button) {
    ctx.font = '14px Arial'
    ctx.fillStyle = theme.chessBoardColor

    let btnImg = new Image()
    btnImg.src = button.img
    const xCenter = this.x + (i + 1 / 2) * this.buttonWidth

    ctx.drawImage(btnImg, xCenter - 16, this.y, 32, 32)
    ctx.fillText(
      button.text,
      xCenter,
      this.y + 45
    )
  }
}