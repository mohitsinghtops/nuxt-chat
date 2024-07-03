<template>
    <div>
        <slot />
    </div>
</template>

<script setup>
import { useUserStore } from "~/store/user";
import { getUserByField } from '~/services/userService.js'
import { auth } from "~/database";
import { getCurrentUser } from "~/services/authService";
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
    // const email = useCookie('email')
    // const user = await getUserByField('email', email.value);
   
};
</script>

<style></style>