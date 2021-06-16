import { defineStore } from 'pinia'

export const egalStore = defineStore({
    id: 'counter',
    state() {
        return { count: 0 }
    },

})
