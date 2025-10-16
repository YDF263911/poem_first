// Pinia 示例：计数器 store（含类型）
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref<number>(0)

  // actions
  function increment() {
    count.value++
  }
  function decrement() {
    count.value--
  }
  function reset() {
    count.value = 0
  }

  return { count, increment, decrement, reset }
})