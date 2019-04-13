export default class Cell {
  constructor(rowIndex, colIndex, number, isEditable) {
    this.rowIndex = rowIndex
    this.colIndex = colIndex
    this.number = number
    this.isEditable = isEditable
    this.isValid = true
    this.drafts = []
  }

  clone() {
    const newCell = new Cell(this.rowIndex, this.colIndex, this.number, this.isEditable)
    newCell.isValid = this.isValid
    newCell.drafts = Object.assign([], this.drafts)
    return newCell
  }
}