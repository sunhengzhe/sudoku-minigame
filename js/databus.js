import Pool from './base/pool'
import getTheme from './theme/index'
import EventBus from './event-bus';

const eventBus = new EventBus

let instance

const MODE = {
  // 解题模式
  SOLVE: true,
  // 草稿模式
  DRAFT: false
}

/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if ( instance )
      return instance

    instance = this

    this.pool = new Pool()
    this.theme = getTheme()
    this.mode = MODE.SOLVE

    this.reset()
  }

  reset() {
    this.frame      = 0
    this.score      = 0
    this.animations = []
    this.gameOver   = false
  }

  changeMode() {
    this.mode = !this.mode
    eventBus.emit('change-mode', this.mode)
  }

  getTheme() {
    return this.theme
  }
}

DataBus.MODE = MODE