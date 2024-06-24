import { defineStore } from 'pinia';

export const useUserStore = defineStore({
    id: 'user',
    state: () => ({
        user: null,
        isLoggedIn: false,
    }),
    getters: {
        getUserData: (state) => state.user,
        getIsLoggedIn: (state) => state.isLoggedIn,
    },
    actions: {
        setUserData(value: any){
            this.user = value;
        },
        setIsLoggedIn(value: any){
            this.isLoggedIn = value;
        },
    }
  })