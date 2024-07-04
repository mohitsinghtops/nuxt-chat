<template>
    <div>
        <div class="min-h-screen flex justify-center items-center">
            <form @submit.prevent="handleSubmit" class="min-w-[450px] mx-auto border border-gray-50/10 rounded-lg p-8">
                <h1 class="text-center mb-12 text-white text-3xl font-bold">
                    Add a New User
                </h1>
                <!-- <div class="mb-5">
                    <label for="name" class="block mb-2 text-sm font-medium text-white">Name</label>
                    <input v-model.trim="formData.name" type="text" id="name"
                        class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                        placeholder="Name" required />
                </div> -->

                <div class="mb-5">
                    <label for="email" class="block mb-2 text-sm font-medium text-white">Email</label>
                    <input v-model.trim="formData.email" type="email" id="email"
                        class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                        placeholder="Email" required />
                </div>

                <div class="mb-5">
                    <label for="password" class="block mb-2 text-sm font-medium text-white">Password</label>
                    <input v-model.trim="formData.password" type="password" id="password"
                        class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                        placeholder="Password" required />
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
                        <span v-else>Sign Up</span>
                    </button>
                </div>

                <div class="alert bg-red-400/10 text-red-600 border border-red-600 rounded my-5 py-3 px-4 text-sm"
                    v-if="error">
                    {{ error }}
                </div>

                <div class="mt-5 text-center">
                    <span class="cursor-pointer text-blueLight" @click="redirectTo">Back to Login</span>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="js" setup>
import { generateRandomDigit } from '~/helpers/common.js'
import { signUpUser } from '~/services/authService';
import { addRoom } from '~/services/roomService';
import { addUser, getUsers, getUserByField } from '~/services/userService.js'
import { useRoute } from 'vue-router'

definePageMeta({
    middleware: ['guest']
})

useHead({
    title: 'Sign Up',
})

const route = useRoute()
const error = ref(null);
const loading = ref(false)
const formData = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    userId: '',
})

const handleAddDefaultRoom = async(user) => {
    const username = user?.email.split('@')[0]
    const defaultRoom = {
        roomId: generateRandomDigit().toString(),
        roomName: user?.displayName ?? username + "'s Room",
        avatar: 'https://img.icons8.com/bubbles/50/group.png',
        users: [
            {
                _id: user?.uid,
                username: user?.displayName ?? username,
                email: user?.email,
                avatar: 'https://img.icons8.com/bubbles/50/user.png',
                isAdmin: true,
            }
        ],
        lastMessage: {
            content: 'Room Created'
        },
        typingUsers: []
    }

    return await addRoom(defaultRoom);
}

const handleSubmit = async () => {
    loading.value = true;
    error.value = '';

    if(formData.password != formData.password_confirmation) {
        useToast('error', 'Passwords do not match')
        error.value = 'Passwords do not match';
        loading.value = false;
        return;
    }

    await signUpUser(formData)
        .then(async (res) => {
            await handleAddDefaultRoom(res.user)
  
            await addUser({
                userId: res.user.uid,
                email: res.user.email,
                displayName: res.user.displayName ?? res.user.email.split('@')[0],
                photoURL: res.user.photoURL ?? '',
            });

            useToast('success', 'Sign up successsfully')
            redirectTo()
        })
        .catch((error) => {
            useToast('error', error.message)
        })
        .finally(() => {
            loading.value = false;
        })

}

const redirectTo = () => {
    navigateTo({
        path: '/sign-in',
        query: route.query
    })
}

</script>
