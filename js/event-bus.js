
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

  emit(type, ...args) {
    let handlers = this.listenerMap[type] || []

    for (const handler of handlers) {
      handler(...args)
    }
  }
}