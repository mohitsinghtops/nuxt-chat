<template>
  <div>
    <slot />
  </div>
</template>

<script setup>
import { useUserStore } from "~/store/user";
import { getUserByField } from '~/services/userService.js'

const userStore = useUserStore();

onMounted(() => {
    getUserDetails();
})

const getUserDetails = async() => {
    const email = useCookie('email')
    const user = await getUserByField('email', email.value);
    if(user) {
        const userId = useCookie('userId')
        userId.value = user.userId

        const userEmail = useCookie('email')
        userEmail.value = user.email

        userStore.setIsLoggedIn(true)
        userStore.setUserData(user)
    }
};
</script>

<style>

</style>