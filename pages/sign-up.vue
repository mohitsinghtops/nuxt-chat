<template>
  <div>
    <div class="min-h-screen flex justify-center items-center">
      <form
        @submit.prevent="handleSubmit"
        class="min-w-[450px] mx-auto border border-gray-50/10 rounded-lg p-8"
      >
        <h1 class="text-center mb-12 text-white text-3xl font-bold">
          Add a New User
        </h1>
        <div class="mb-5">
          <label for="name" class="block mb-2 text-sm font-medium text-white"
            >Your Name</label
          >
          <input
            v-model.trim="formData.name"
            type="text"
            id="name"
            class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
            placeholder="Enter Name"
            required
          />
        </div>

        <div class="mb-5">
          <label for="email" class="block mb-2 text-sm font-medium text-white"
            >Your Email</label
          >
          <input
            v-model.trim="formData.email"
            type="email"
            id="email"
            class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
            placeholder="Enter Email"
            required
          />
        </div>

        <div class="text-center mt-5">
          <button
            type="submit"
            class="block text-white bg-blueLight hover:bg-blueDark focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
          >
            <loading-component v-if="loading"></loading-component>
            <span v-else>Sign Up</span>
          </button>
        </div>

        <div
          class="alert bg-red-400/10 text-red-600 border border-red-600 rounded my-5 py-3 px-4 text-sm"
          v-if="error"
        >
          {{ error }}
        </div>

        <div class="my-5 text-center">
          <nuxt-link to="/" class="text-blueLight">Back to Login</nuxt-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="js" setup>
    import { generateRandomId } from '~/helpers/common.js'
    import { addUser, getUsers, getUserByField } from '~/services/userService.js'

    definePageMeta({
        middleware: ['guest']
    })

    useHead({
        title: 'Sign Up',
    })

    const error = ref(null);
    const loading = ref(false)
    const formData = reactive({
        name: '',
        email: '',
        userId: '',
    })

    const handleSubmit = async() => {
        loading.value = true;
        error.value = '';

        try {
            const user = await getUserByField('email', formData.email);
    
            if(user) {
                formData.email = ''
                formData.name = ''
                error.value = 'Email already exists.';
                return;
            }
            
            const users = await getUsers();
            formData.userId = users.length + 1;
    
            const res = await addUser(formData)
            if(res) {
                navigateTo('/sign-in')
            }

        } catch (err) {
            console.log('err: ', err)
        } finally {
            loading.value = false;
        }
    }
</script>

