<template>
    <div>
        <slot />
    </div>
</template>

<script setup>
import { useUserStore } from "~/store/user";
import { auth } from "~/database";
import { onAuthStateChanged } from "firebase/auth";

const userStore = useUserStore();

onMounted(() => {
    getUserDetails();
})

const getUserDetails = async () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            localStorage.setItem('userId', user.uid)
            localStorage.setItem('email', user.email)

            userStore.setIsLoggedIn(true);
            userStore.setUserData(user);
        }
    });
   
};
</script>

<style></style>