import Cell from './cell'

const screenWidth  = window.innerWidth

const MARGIN_TO_VERTICAL_SIDE = 5;
const THICK_LINE_WIDTH = 3
const THIN_LINE_WIDTH = 1
const BOARD_SIZE = screenWidth - 2 * MARGIN_TO_VERTICAL_SIDE
const CELL_SIZE = (BOARD_SIZE - 4 * THICK_LINE_WIDTH - 6 * THIN_LINE_WIDTH) / 9

export default class StandardChessBoard {
  constructor() {
    this.cells = []
    this.x = MARGIN_TO_VERTICAL_SIDE
    this.y = 50
    this.size = BOARD_SIZE

    for (let i = 0; i < 9; i++) {
      this.cells.push([]);
    }

    this.selectedCell = {
      row: 0,
      col: 1
    }
  }

  setNumberToSelectedCell(number) {
    const { row, col } = this.selectedCell
    this.cells[row][col] = new Cell(row, col, number)
  }

  setCells(newCells) {
    newCells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        this.cells[rowIndex][colIndex] = new Cell(rowIndex, colIndex, cell)
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

  drawToCanvas(ctx) {
    ctx.fillStyle="#fff";
    ctx.fillRect(this.x, this.y, BOARD_SIZE, BOARD_SIZE);

    ctx.fillStyle = "#000"
    for (let i = 0; i < 10; i++) {
      const thickLineCount = i === 0 ? 0 : (Math.floor((i - 1) / 3) + 1)
      const thinLineCount = i - thickLineCount
      const cellCount = i

      const isThickLine = i % 3 === 0

      const existMargin = thickLineCount * THICK_LINE_WIDTH +
        cellCount * CELL_SIZE +
        thinLineCount * THIN_LINE_WIDTH

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

    this.cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const { x, y } = this.getCellCenterPos(rowIndex, colIndex)

        if (cell.isEditable) {
          ctx.fillStyle = '#000'
        } else {
          ctx.fillStyle = '#007fff'
        }

        ctx.fillText(
          cell.number,
          x,
          y
        )
      })
    })
  }
}