export default class Cell {
  constructor(rowIndex, colIndex, number) {
    this.rowIndex = rowIndex
    this.colIndex = colIndex
    this.number = number
    this.isEditable = number === 0
  }
}