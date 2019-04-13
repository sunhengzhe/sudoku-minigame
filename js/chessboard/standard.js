import Cell from './cell'
import DataBus from '../databus'
import EventBus from '../event-bus'

const evenBus = new EventBus()

const theme = new DataBus().getTheme()

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

    for (let i = 0; i < 9; i++) {
      this.cells.push([]);
    }

    this.selectedCell = null

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
    evenBus.on('on-eraser-click', () => {
      this.setNumberToSelectedCell(0)
    })
  }

  setNumberToSelectedCell(number) {
    if (!this.selectedCell) {
      return
    }

    const { row, col } = this.selectedCell
    const cell = this.cells[row][col]

    if (cell.isEditable) {
      const from = cell.number
      cell.number = number
      cell.isValid = this.isValidCell(cell)

      evenBus.emit('on-cell-set', {
        from,
        to: number,
        cells: this.cells
      })
    }
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

  drawCellBg(ctx, x, y, bgColor) {
    ctx.fillStyle = bgColor
    ctx.fillRect(x - CELL_SIZE / 2, y - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);
  }

  drawToCanvas(ctx) {
    ctx.fillStyle = theme.chessBoardBg;
    ctx.fillRect(this.x, this.y, BOARD_SIZE, BOARD_SIZE);

    this.cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const { x, y } = this.getCellCenterPos(rowIndex, colIndex)

        // 提示背景
        if (this.isInHitAreaAt(rowIndex, colIndex)) {
          this.drawCellBg(ctx, x, y, theme.hitCellBg)
        }

        // 选中块高亮
        if (this.isSelectedCellAt(rowIndex, colIndex)) {
          this.drawCellBg(ctx, x, y, theme.selectedCellBg)
        }

        if (cell.number === 0) {
          return
        }

        // 相同的数字高亮
        if (this.selectedCell) {
          const { number: selectedNumber } = this.cells[this.selectedCell.row][this.selectedCell.col]
          if (cell.number === selectedNumber) {
            this.drawCellBg(ctx, x, y, theme.selectedCellBg)
          }
        }

        // 渲染数字
        let cellColor
        if (cell.isEditable) {
          if (cell.isValid) {
            cellColor = theme.validCellColor
          } else {
            cellColor = theme.invalidCellColor
          }
        } else {
          cellColor = theme.chessBoardColor
        }

        ctx.fillStyle = cellColor

        ctx.fillText(
          cell.number,
          x,
          y
        )
      })
    })


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
}