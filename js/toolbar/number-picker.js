import EventBus from '../event-bus'
import DataBus from '../databus'

const dataBus = new DataBus()
const eventBus = new EventBus()

const theme = dataBus.getTheme()

const screenWidth  = window.innerWidth

const MARGIN_TO_VERTICAL_SIDE = 5;

const BOARD_SIZE = screenWidth - 2 * MARGIN_TO_VERTICAL_SIDE
const CELL_SIZE = BOARD_SIZE / 9

export default class NumberPicker {
  constructor({ x, y } = {}) {
    this.x = x || MARGIN_TO_VERTICAL_SIDE
    this.y = y
    this.height = CELL_SIZE
    this.numberButtons = []
    this.color = theme.numberPickerColor
    this.mode = DataBus.MODE.SOLVE
    this.selectedIndex = -1

    this.initButtons()
    this.initEvent()
  }

  initButtons() {
    for (let i = 1; i < 10; i++) {
      const startX = this.x + this.x + (i - 1) * CELL_SIZE
      const startY = this.y

      const btn = {
        startX,
        startY,
        endX: startX + CELL_SIZE,
        endY: startY + CELL_SIZE,
        number: i,
        isShow: true
      }

      this.numberButtons.push(btn)
    }
  }

  countCellByNumber(cells, number) {
    return cells.reduce((prev, cur) => {
      return prev + cur.filter(cell => cell.isValid && cell.number === number).length
    }, 0)
  }

  touchStartHandler(e) {
    e.preventDefault()

    const x = e.touches[0].clientX
    const y = e.touches[0].clientY

    for (let i = 0; i < 9; i++) {
      const btn = this.numberButtons[i]

      if (
        !(this.mode === DataBus.MODE.SOLVE && !btn.isShow) &&
        x >= btn.startX &&
        x <= btn.endX &&
        y >= btn.startY &&
        y <= btn.endY
      ) {
        this.selectedIndex = i
        eventBus.emit('number-pick', btn.number)
        break;
      }
    }
  }

  touchEndHandler(e) {
    e.preventDefault()
    this.selectedIndex = -1
  }

  initEvent() {
    eventBus.on('cell-set', ({ from, to, cells }) => {
      [from.number, to.number].filter(number => number > 0).forEach(number => {
        const numberExistCount = this.countCellByNumber(cells, number)
        this.numberButtons[number - 1].isShow = numberExistCount < 9
      })
    })

    eventBus.on('change-mode', mode => {
      this.mode = mode
      this.color = mode === DataBus.MODE.DRAFT ? theme.draftColor : theme.numberPickerColor
    })
  }

  drawToCanvas(ctx) {
    ctx.font = '30px Arial'

    this.numberButtons.forEach(({ startX, startY, number, isShow }, index)=> {
      if (this.mode === DataBus.MODE.SOLVE && !isShow) {
        return
      }

      if (index === this.selectedIndex) {
        ctx.fillStyle = theme.selectedNumberPickerColor
        ctx.fillRect(startX, startY, CELL_SIZE, CELL_SIZE);
      }

      ctx.fillStyle = this.color
      ctx.fillText(
        number,
        startX + CELL_SIZE / 2,
        startY + CELL_SIZE / 2
      )
    })
  }
}