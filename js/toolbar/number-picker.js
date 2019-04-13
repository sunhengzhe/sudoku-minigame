import EventBus from '../event-bus'
import DataBus from '../databus'

const theme = new DataBus().getTheme()
const eventBus = new EventBus()

const screenWidth  = window.innerWidth

const MARGIN_TO_VERTICAL_SIDE = 5;

const BOARD_SIZE = screenWidth - 2 * MARGIN_TO_VERTICAL_SIDE
const CELL_SIZE = BOARD_SIZE / 9

export default class NumberPicker {
  constructor({ x, y }) {
    this.x = x
    this.y = y
    this.numberButtons = []

    this.initEvent()
  }

  initEvent() {
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()

      const x = e.touches[0].clientX
      const y = e.touches[0].clientY

      for (let i = 0; i < 9; i++) {
        const btn = this.numberButtons[i]

        if (
          x >= btn.startX &&
          x <= btn.endX &&
          y >= btn.startY &&
          y <= btn.endY
        ) {
          eventBus.emit('on-number-pick', btn.number)
          break;
        }
      }
    }).bind(this))
  }

  drawToCanvas(ctx) {
    ctx.font = '24px Arial'
    ctx.fillStyle = theme.numberPickerColor

    for (let i = 1; i < 10; i++) {
      const startX = this.x + this.x + (i - 1) * CELL_SIZE
      const startY = this.y

      const btn = {
        startX,
        startY,
        endX: startX + CELL_SIZE,
        endY: startY + CELL_SIZE,
        number: i
      }

      this.numberButtons.push(btn)

      ctx.fillText(
        i,
        startX + CELL_SIZE / 2,
        startY + CELL_SIZE / 2
      )
    }
  }
}