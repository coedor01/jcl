// 1.Dependency
import { defineStore } from "pinia";

// 2.Create Store
export const useStore = defineStore({
    id: "store",
    state: () => ({
        client: location.pathname.includes("origin") ? "origin" : "std",
    }),
    getters: {},
    actions: {},
});
