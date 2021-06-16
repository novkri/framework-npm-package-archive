"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.egalStore = void 0;
const pinia_1 = require("pinia");
exports.egalStore = pinia_1.defineStore({
    id: 'counter',
    state() {
        return { count: 0 };
    },
});
