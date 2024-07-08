<template>
    <div>
        <div class="min-h-screen flex justify-center items-center">
            <form @submit.prevent="handleSubmit" class="min-w-[450px] bg-white/10 mx-auto border border-white/30 backdrop-blur-2xl rounded-lg p-8">
                <h1 class="text-center mb-12 text-white text-3xl font-bold">
                    Reset Password
                </h1>

                <div class="mb-5">
                    <label for="password" class="block mb-2 text-sm font-medium text-white">New password</label>
                    <input v-model.trim="formData.password" type="password" id="password"
                        class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                        placeholder="New password" required />
                </div>

                <div class="mb-5">
                    <label for="password_confirmation" class="block mb-2 text-sm font-medium text-white">Password
                        Confirmation</label>
                    <input v-model.trim="formData.password_confirmation" type="password" id="password_confirmation"
                        class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                        placeholder="Password Confirmation" required />
                </div>

                <div class="text-center mt-5">
                    <button type="submit"
                        class="block text-white bg-blueLight hover:bg-blueDark focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">
                        <loading-component v-if="loading"></loading-component>
                        <span v-else>Submit</span>
                    </button>
                </div>
                
                <div class="alert bg-red-400/10 text-red-600 border border-red-600 rounded my-5 py-3 px-4 text-sm"
                    v-if="error">
                    {{ error }}
                </div>

                <div class="mt-5 text-center">
                    <nuxt-link to="/" class="text-blueLight">Back to Login</nuxt-link>
                </div>

            </form>

        </div>
    </div>
</template>

<script lang="js" setup>
import { resetPassword } from '~/services/authService';
import { useRoute } from 'vue-router';

definePageMeta({
    middleware: ['guest']
})

useHead({
    title: 'Reset Password',
})

const formData = reactive({
    password: '',
    password_confirmation: '',
})
const route = useRoute();
const error = ref(null);
const loading = ref(false);

const handleSubmit = async () => {
    loading.value = true;
    error.value = '';

    if(formData.password != formData.password_confirmation) {
        useToast('error', 'Passwords do not match')
        error.value = 'Passwords do not match';
        loading.value = false;
        return;
    }

    const oobCode = route.query.oobCode;

    await resetPassword(formData.password, oobCode)
        .then((res) => {
            useToast('success', 'Password has been reset!')
            navigateTo('/sign-in')
        })
        .catch((error) => {
            error.value = error.message;
            useToast('error', error.message)
        })
        .finally(() => {
            loading.value = false;
        })
}
</script>

<style></style>
