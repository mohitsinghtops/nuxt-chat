<template>
    <div class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 z-50 w-full h-full rounded-lg max-w-sm min-w-sm shadow bg-grayPrimary border border-gray-50/10 min-h-screen max-h-screen p-6"
        v-if="showModal" v-click-outside="handleCloseModal">
        <loading-component v-if="dataLoading" class="h-[calc(100%-1rem)]"></loading-component>
        <template v-else>
            <div class="header flex justify-between">
                <h3 class="text-xl font-semibold text-white">{{ type == 'profile' ? 'Profile Details' : 'Change Password' }}</h3>
                <button type="button"
                    class="end-2.5 text-gray-400 bg-transparent rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                    data-modal-hide="authentication-modal" @click.prevent="handleCloseModal">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                </button>
            </div>

            <!-- main -->
            <div class="main py-5">
                <div class="avatar text-center mt-3">
                    <div class="relative max-w-28 max-h-28 mx-auto rounded-full group">
                        <img :src="formData?.avatar" class="min-w-28 min-h-28 mx-auto rounded-full">

                        <input ref="roomInputRef" type="file" accept="image/*"
                            class="hidden opacity-0 group-hover:opacity-100 cursor-pointer absolute top-0 left-0 w-full h-full z-[100]"
                            @change="handleImageUpload">

                        <div class="absolute top-0 left-0 z-[100] bg-black/50 min-w-28 min-h-28 mx-auto rounded-full justify-center items-center cursor-pointer"
                            :class="{ 'hidden group-hover:flex': formData?.avatar, 'flex': !formData?.avatar }"
                            @click="handleCameraClick">
                            <img src="https://img.icons8.com/material-rounded/24/ffffff/camera--v2.png" alt="camera"
                                class="mx-auto">
                        </div>
                    </div>
                </div>

                <!-- profile form -->
                <form @submit.prevent="updateProfileDetails" v-if="type == 'profile'">
                    <div class="form-group my-5">
                        <label for="name" class="block mb-2 text-sm font-medium text-white">Your Name</label>
                        <input v-model.trim="formData.name" type="text" id="name"
                            class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                            placeholder="Enter Name" required />
                    </div>

                    <div class="mb-5">
                        <label for="email" class="block mb-2 text-sm font-medium text-white">Your Email</label>
                        <input disabled v-model.trim="formData.email" type="email" id="email"
                            class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-50/10 placeholder-gray-400 bg-black cursor-not-allowed"
                            placeholder="Enter Email" required />
                    </div>

                    <button type="submit"
                        class="bg-blueLight text-white rounded py-2 px-6 border border-blueLight hover:bg-blueDark hover:border-blueDark"
                        @click.prevent="updateProfileDetails">
                        <loading-component v-if="loading"></loading-component>
                        <span v-else>Update</span>
                    </button>
                </form>

                <!-- change password form -->
                <form @submit.prevent="changeUserPassword"  v-else>
                    <div class="my-5">
                        <label for="password" class="block mb-2 text-sm font-medium text-white">New password</label>
                        <input v-model.trim="formData.password" type="password" id="password"
                            class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                            placeholder="New password" required />
                    </div>

                    <div class="mb-5">
                        <label for="password_confirmation" class="block mb-2 text-sm font-medium text-white">Password  Confirmation</label>
                        <input v-model.trim="formData.password_confirmation" type="password" id="password_confirmation"
                            class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                            placeholder="Password Confirmation" required />
                    </div>

                    <button type="submit"
                        class="bg-blueLight text-white rounded py-2 px-6 border border-blueLight hover:bg-blueDark hover:border-blueDark"
                        @click.prevent="changeUserPassword">
                        <loading-component v-if="loading"></loading-component>
                        <span v-else>Change Password</span>
                    </button>
                </form>

            </div>
        </template>
    </div>
</template>

<script setup>

import { uploadUserProfile } from "~/database/storageService";
import { updateUserProfile, changePassword } from "~/services/authService";
import { getUserByField, updateUser } from "~/services/userService";
import { useUserStore } from "~/store/user";


const props = defineProps({
    isShowModal: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'profile'
    },
})

const emit = defineEmits(['handle-profile-detail'])

const showModal = ref(false);
const formData = ref({
    name: '',
    avatar: '',
    password: '',
    password_confirmation: '',
});
const dataLoading = ref(false);
const loading = ref(false);
const error = ref('');
const currentUserId = ref('');
const roomInputRef = ref(null);
const selectedFile = ref(null);
const userStore = useUserStore();

onMounted(() => {
    currentUserId.value = localStorage.getItem('userId');
    getUserDetail();
})

watch(
    () => props.isShowModal,
    (value) => {
        if (value) {
            showModal.value = true;
        } else {
            showModal.value = false;
        }
    },
    { deep: true, immediate: true }
)

const getUserDetail = async () => {
    dataLoading.value = true;
    setTimeout(() => {
        const user = userStore.getUserData
        formData.value.name = user?.displayName ?? ''
        formData.value.email = user?.email ?? ''
        formData.value.avatar = user?.photoURL ?? ''
        dataLoading.value = false;
    }, 1000)
}

const handleCloseModal = () => {
    emit('handle-profile-detail', false)
    showModal.value = false;
}

const updateProfileDetails = async () => {
    loading.value = true;

    let url = formData.value.avatar
    if (selectedFile.value) {
        url = await uploadUserProfile(currentUserId.value, selectedFile.value)
    }

    const userData = {
        displayName: formData.value.name,
        photoURL: url
    }

    const user = await getUserByField('email', formData.value.email);

    await updateUserProfile(userData)
    .then(async(res) => {
        await updateUser(user.id, userData)
        useToast('success', 'User details updated successfully')
    }).catch((err) => {
        console.log(err)
        useToast('error', 'Error on updating user details')
    }).finally(() => {
        formData.value.avatar = url
        selectedFile.value = null;
        loading.value = false;
    })

}

const handleCameraClick = () => {
    roomInputRef.value.click();
}

const handleImageUpload = (e) => {
    const file = e.target.files[0];
    formData.value.avatar = URL.createObjectURL(file);
    selectedFile.value = file;
}

const changeUserPassword = async () => {
    loading.value = true;
    error.value = '';

    if(formData.password != formData.password_confirmation) {
        useToast('error', 'Passwords do not match')
        error.value = 'Passwords do not match';
        loading.value = false;
        return;
    }

    await changePassword(formData.password)
        .then((res) => {
            useToast('success', 'Password has been changed successfully')
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