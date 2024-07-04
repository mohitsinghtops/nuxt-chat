<template>
    <div>
        <div class="min-h-screen flex justify-center items-center">
            <form @submit.prevent="handleSubmit" class="min-w-[450px] mx-auto border border-gray-50/10 rounded-lg p-8">
                <h1 class="text-center mb-12 text-white text-3xl font-bold">
                    Start Chat
                </h1>

                <div class="mb-5">
                    <label for="email" class="block mb-2 text-sm font-medium text-white">Your Email</label>
                    <input v-model.trim="formData.email" type="email" id="email"
                        class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                        placeholder="Enter Email" required />
                </div>

                <div class="mb-5">
                    <label for="password" class="block mb-2 text-sm font-medium text-white">Password</label>
                    <input v-model.trim="formData.password" type="password" id="password"
                        class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                        placeholder="Password" required />
                </div>

                <div class="mb-5 text-right">
                    <nuxt-link to="/forgot-password" class="text-blueLight">Forgot Password?</nuxt-link>
                </div>

                <div class="text-center mt-5">
                    <button type="submit"
                        class="block text-white bg-blueLight hover:bg-blueDark focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">
                        <loading-component v-if="loading"></loading-component>
                        <span v-else>Login to your account</span>
                    </button>
                </div>

                <div class="alert bg-red-400/10 text-red-600 border border-red-600 rounded my-5 py-3 px-4 text-sm"
                    v-if="error">
                    {{ error }}
                </div>

                <div class="mt-5 text-center">
                    <span class="cursor-pointer text-blueLight" @click="redirectTo">Don't have an account? Sign Up</span>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="js" setup>
import { signInUser } from '~/services/authService';
import { getUserByField } from '~/services/userService.js'
import { useUserStore } from "~/store/user";
import { useRoute } from 'vue-router'
import { getRoomById, updateRoom } from '~/services/roomService';

definePageMeta({
    middleware: ['guest']
})

useHead({
    title: 'Sign In',
})

const formData = reactive({
    email: '',
    password: ''
})
const error = ref(null);
const loading = ref(false);
const userStore = useUserStore();
const route = useRoute()

const handleSubmit = async () => {
    loading.value = true;
    error.value = '';

    await signInUser(formData)
        .then(async(res) => {
            const user = res.user;

            const accessToken = useCookie('accessToken')
            accessToken.value = user.accessToken

            localStorage.setItem('userId', user.uid)
            localStorage.setItem('email', user.email)

            user.displayName = user?.displayName ?? user.email.split('@')[0]

            userStore.setIsLoggedIn(true);
            userStore.setUserData(user);

            error.value = null
            loading.value = false
            useToast('success', 'Sign in successsfully')
            navigateTo({
                path: '/',
                query: route.query
            })
        })
        .catch((error) => {
            error.value = error.message;
            useToast('error', error.message)
        })
        .finally(() => {
            loading.value = false;
        })

}

const redirectTo = () => {
    navigateTo({
        path: '/sign-up',
        query: route.query
    })
}
</script>

<style></style>
