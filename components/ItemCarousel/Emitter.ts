export default class Emitter {
  listeners: { type: string, callback: () => void, id: string }[]

  constructor() {
    this.listeners = []
  }
  on(type: string, callback: () => void, id: string) {
    this.listeners.push({
      type,
      callback,
      id
    })
  }
  emit(type: string) {
    this.listeners.filter(l => l.type === type)
      .forEach(l => l.callback())
  }
  off(id: string) {
    this.listeners = this.listeners.filter(l => l.id !== id)
  }
}
