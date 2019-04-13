
let instance

export default class EventBus {
  constructor() {
    if (instance) {
      return instance
    }

    this.listenerMap = {}

    instance = this
  }

  on(type, handler) {
    let handlers = this.listenerMap[type] || (this.listenerMap[type] = [])
    handlers.push(handler)
  }

  /**
   * emit 必须是异步的，否则 restart 时，不会 remove listener
   * @param {*} type
   * @param  {...any} args
   */
  emit(type, ...args) {
    setTimeout(() => {
      let handlers = this.listenerMap[type] || []

      for (const handler of handlers) {
        handler(...args)
      }
    })
  }

  reset() {
    this.listenerMap = {}
  }
}