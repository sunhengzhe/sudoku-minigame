export default class Cell {
  constructor(rowIndex, colIndex, number, isEditable) {
    this.rowIndex = rowIndex
    this.colIndex = colIndex
    this.number = number
    this.isEditable = isEditable
  }
}