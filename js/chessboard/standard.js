import Cell from './cell'
import DataBus from '../databus'
import EventBus from '../event-bus'

const evenBus = new EventBus()
const dataBus = new DataBus()

const theme = dataBus.getTheme()

const screenWidth  = window.innerWidth

const MARGIN_TOP = 120
const MARGIN_TO_VERTICAL_SIDE = 5;
const THICK_LINE_WIDTH = 3
const THIN_LINE_WIDTH = 1
const BOARD_SIZE = screenWidth - 2 * MARGIN_TO_VERTICAL_SIDE
const CELL_SIZE = (BOARD_SIZE - 4 * THICK_LINE_WIDTH - 6 * THIN_LINE_WIDTH) / 9

export default class StandardChessBoard {
  constructor({ x, y } = {}) {
    this.cells = []
    this.x = x || MARGIN_TO_VERTICAL_SIDE
    this.y = y || MARGIN_TOP
    this.size = BOARD_SIZE
    this.mode = dataBus.mode

    for (let i = 0; i < 9; i++) {
      this.cells.push([]);
    }

    // selectedCell: { row, col }
    this.selectedCell = null
    // history: [{ type, data }]
    this.history = []

    this.initEvent()
  }

  isValidCell(cell) {
    const { rowIndex, colIndex, number } = cell

    const row = this.cells[rowIndex]

    const existInRow = row.filter((c, i) => i !== colIndex && c.number === number)

    if (existInRow.length) {
      return false
    }

    const existInCol = this.cells.map(row => row[colIndex])
      .filter((c, i) => i !== rowIndex && c.number === number)

    if (existInCol.length) {
      return false
    }

    const startRow = Math.floor(rowIndex / 3) * 3;
    const startCol = Math.floor(colIndex / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (!(i === rowIndex && j === colIndex) && this.cells[i][j].number == number) {
                return false
            }
        }
    }

    return true
  }

  touchStartHandler(e) {
    e.preventDefault()

    const { clientX, clientY } = e.touches[0]

    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
      for (let colIndex = 0; colIndex < 9; colIndex++) {
        const { x, y } = this.getCellCenterPos(rowIndex, colIndex)

        if (
          clientX >= x - CELL_SIZE / 2 &&
          clientX <= x + CELL_SIZE / 2 &&
          clientY >= y - CELL_SIZE / 2 &&
          clientY <= y + CELL_SIZE / 2
        ) {
          this.selectedCell = {
            row: rowIndex,
            col: colIndex
          }
          return
        }
      }
    }
  }

  initEvent() {
    evenBus.on('erase', () => {
      this.setNumberToSelectedCell(0)
    })

    evenBus.on('change-mode', mode => {
      this.mode = mode
    })

    evenBus.on('rollback', () => {
      const history = this.history

      if (history.length) {
        const action = history.pop()
        const { type, data } = action

        if (type === 'set-number') {
          this.selectedCell = {
            row: data.rowIndex,
            col: data.colIndex
          }
          // this.setNumberToSelectedCell(data.from, true)
          this.cells[data.rowIndex][data.colIndex] = data.from
        }
      }
    })
  }

  isFinish() {
    const invalidRow = this.cells.filter(row => {
      return row.filter(cell => cell.number === 0 || !cell.isValid).length > 0
    })

    return invalidRow.length === 0
  }

  setNumberToSelectedCell(number) {
    if (!this.selectedCell) {
      return
    }

    const { row, col } = this.selectedCell
    const cell = this.cells[row][col]

    if (!cell.isEditable) {
      return
    }

    const from = cell.clone()

    if (this.mode === DataBus.MODE.DRAFT) {
      cell.number = 0
      const indexOfExist = cell.drafts.indexOf(number)
      if (indexOfExist > -1) {
        cell.drafts.splice(indexOfExist, 1)
      } else {
        cell.drafts.push(number)
      }
    } else {
      cell.drafts = []

      if (cell.number === number) {
        return
      }

      cell.number = number

      this.cells.forEach(row => {
        row.forEach(item => {
          item.isValid = this.isValidCell(item)
        })
      })

      wx.vibrateShort()

      if (this.isFinish()) {
        dataBus.gameOver = true
      }
    }

    const to = cell.clone()

    cell.frame = 0

    evenBus.emit('cell-set', {
      from,
      to,
      cells: this.cells
    })

    this.history.push({
      type: 'set-number',
      data: {
        rowIndex: this.selectedCell.row,
        colIndex: this.selectedCell.col,
        from,
        to
      }
    })
  }

  setCells(newCells) {
    newCells.forEach((row, rowIndex) => {
      row.forEach((number, colIndex) => {
        this.cells[rowIndex][colIndex] = new Cell(rowIndex, colIndex, number, number === 0)
      })
    })
  }

  getMargin(pos) {
    const thickLineCount = pos === 0 ? 0 : (Math.floor((pos - 1) / 3) + 1)
    const thinLineCount = pos - thickLineCount
    const cellCount = pos

    return thickLineCount * THICK_LINE_WIDTH +
      cellCount * CELL_SIZE +
      thinLineCount * THIN_LINE_WIDTH
  }

  getCellCenterPos(rowIndex, colIndex) {
    const nextTopMargin = this.getMargin(rowIndex + 1)
    const nextLeftMargin = this.getMargin(colIndex + 1)

    return {
      x: this.x + nextLeftMargin - CELL_SIZE / 2,
      y: this.y + nextTopMargin - CELL_SIZE / 2
    }
  }

  isSelectedCellAt(rowIndex, colIndex) {
    return this.selectedCell &&
      this.selectedCell.row === rowIndex &&
      this.selectedCell.col === colIndex
  }

  isInHitAreaAt(rowIndex, colIndex) {
    if (!this.selectedCell) {
      return false
    }

    const {
      row: selectedRowIndex,
      col: selectedColIndex
    } = this.selectedCell

    // 同一行列
    if (rowIndex === selectedRowIndex || colIndex === selectedColIndex) {
      return true
    }

    // 同一九宫格
    if (
      Math.floor(rowIndex / 3) === Math.floor(selectedRowIndex / 3) &&
      Math.floor(colIndex / 3) === Math.floor(selectedColIndex / 3)
    ) {
      return true
    }

    return false
  }

  drawGrid(ctx) {
    ctx.strokeStyle = theme.chessBoardBorderColor

    for (let i = 0; i < 10; i++) {
      const isThickLine = i % 3 === 0
      const existMargin = this.getMargin(i)

      ctx.lineWidth = isThickLine ? THICK_LINE_WIDTH : THIN_LINE_WIDTH
      const startLeft = this.x + existMargin + ctx.lineWidth / 2
      const startTop = this.y + existMargin + ctx.lineWidth / 2

      ctx.beginPath()
      ctx.moveTo(startLeft, this.y)
      ctx.lineTo(startLeft, this.y + BOARD_SIZE)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(this.x, startTop)
      ctx.lineTo(this.x + BOARD_SIZE, startTop)
      ctx.closePath()
      ctx.stroke()
    }
  }

  drawCellBg(ctx, cell) {
    ctx.fillStyle = theme.chessBoardBg;

    const { rowIndex, colIndex } = cell
    const { x, y } = this.getCellCenterPos(rowIndex, colIndex)

    // 提示背景
    if (this.isInHitAreaAt(rowIndex, colIndex)) {
      ctx.fillStyle = theme.hitCellBg
    }

    // 相同数字背景
    if (cell.number > 0 && this.selectedCell) {
      const { number: selectedNumber } = this.cells[this.selectedCell.row][this.selectedCell.col]

      if (cell.number === selectedNumber) {
        ctx.fillStyle = theme.sameCellBg
      }
    }

    // 选中块背景
    if (this.isSelectedCellAt(rowIndex, colIndex)) {
      ctx.fillStyle = theme.selectedCellBg
    }

    ctx.fillRect(x - CELL_SIZE / 2, y - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE)
  }

  drawCellText(ctx, cell) {
    if (
      !cell.isEditable ||
      cell.number > 0
    ) {
      this.drawNormalCellText(ctx, cell)
    } else {
      this.drawDraftCellText(ctx, cell)
    }
  }

  drawNormalCellText(ctx, cell) {
    const { rowIndex, colIndex, number } = cell
    let { x, y } = this.getCellCenterPos(rowIndex, colIndex)

    if (number === 0) {
      return
    }

    // 数字
    let cellColor
    if (cell.isEditable) {
      cellColor = cell.isValid ? theme.validCellColor : theme.invalidCellColor

      // 不合法动画
      if (!cell.isValid && cell.frame < 10) {
        x = x + Math.sin(dataBus.frame) * 5
        cell.frame++
      }
    } else {
      cellColor = theme.chessBoardColor
    }

    ctx.font = '28px Arial'
    ctx.fillStyle = cellColor
    ctx.fillText(number, x, y)
  }

  drawDraftCellText(ctx, cell) {
    const { rowIndex, colIndex, drafts } = cell
    const { x, y } = this.getCellCenterPos(rowIndex, colIndex)

    drafts.forEach(number => {
      const draftRowIndex = Math.floor((number - 1) / 3)
      const draftColIndex = Math.floor((number - 1) % 3)

      ctx.font = '11px Arial'
      ctx.fillStyle = theme.draftColor
      ctx.fillText(
        number,
        x + (draftColIndex - 1) * CELL_SIZE / 3,
        y + (draftRowIndex - 1) * CELL_SIZE / 3,
      )
    })
  }

  drawToCanvas(ctx) {
    ctx.fillStyle = theme.chessBoardBg;
    ctx.fillRect(this.x, this.y, BOARD_SIZE, BOARD_SIZE);

    this.cells.forEach(row => {
      row.forEach(cell=> {
        this.drawCellBg(ctx, cell)
        this.drawCellText(ctx, cell)
      })
    })

    this.drawGrid(ctx)
  }
}