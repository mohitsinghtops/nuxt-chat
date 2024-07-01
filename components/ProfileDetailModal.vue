<template>
    <div class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 z-50 w-full h-full rounded-lg max-w-sm min-w-sm shadow bg-grayPrimary border border-gray-50/10 min-h-screen max-h-screen p-6" v-if="showModal" v-click-outside="handleCloseModal">
        <loading-component v-if="dataLoading" class="h-[calc(100%-1rem)]"></loading-component>
        <template v-else>
            <div class="header flex justify-between">
                <h3 class="text-xl font-semibold text-white">Profile Details</h3>
                <button type="button"
                    class="end-2.5 text-gray-400 bg-transparent rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                    data-modal-hide="authentication-modal"
                    @click.prevent="handleCloseModal"
                    >
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                    </svg>
                </button>
            </div>
    
            <!-- main -->
            <div class="main">
                <div class="avatar text-center p-5">
                    <div class="relative max-w-28 max-h-28 mx-auto rounded-full group">
                        <img :src="formData?.avatar" class="min-w-28 min-h-28 mx-auto rounded-full">
    
                        <input ref="roomInputRef" type="file" accept="image/*" class="hidden opacity-0 group-hover:opacity-100 cursor-pointer absolute top-0 left-0 w-full h-full z-[100]" @change="handleImageUpload">
    
                        <div class="absolute top-0 left-0 z-[100] bg-black/50 min-w-28 min-h-28 mx-auto rounded-full justify-center items-center cursor-pointer" :class="{'hidden group-hover:flex': formData?.avatar, 'flex': !formData?.avatar}" @click="handleCameraClick">
                            <img src="https://img.icons8.com/material-rounded/24/ffffff/camera--v2.png" alt="camera" class="mx-auto">
                        </div>
                    </div>
                </div>
                
                <form @submit.prevent="updateProfileDetails">
                    <div class="form-group my-5">
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
                            disabled
                            v-model.trim="formData.email"
                            type="email"
                            id="email"
                            class="text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-50/10 placeholder-gray-400 bg-black cursor-not-allowed"
                            placeholder="Enter Email"
                            required
                        />
                    </div>

                    <button type="submit" class="bg-blueLight text-white rounded py-2 px-6 border border-blueLight hover:bg-blueDark hover:border-blueDark" @click.prevent="updateProfileDetails">
                        <loading-component v-if="loading"></loading-component>
                        <span v-else>Update</span>
                    </button>
                </form>
    
            </div>
        </template>
    </div>
</template>

<script setup>

    import { uploadUserProfile } from "~/database/storageService";
    import { getUserByField, updateUser } from "~/services/userService";
    import { useUserStore } from "~/store/user";


    const props = defineProps({
        isShowModal: {
            type: Boolean,
            default: false
        },
    })

    const emit = defineEmits(['handle-profile-detail'])

    const showModal = ref(false);
    const formData = ref({});
    const dataLoading = ref(false);
    const loading = ref(false);
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
        {deep: true, immediate: true}
    )

    const getUserDetail = async() => {
        dataLoading.value = true;
        const email = useCookie('email')
        const user = await getUserByField('email', email.value);
        formData.value = user;
        dataLoading.value = false;
    }

    const handleCloseModal = () => {
        emit('handle-profile-detail', false)
        showModal.value = false;
    }

    const updateProfileDetails = async() => {
        loading.value = true
        if(selectedFile.value) {
            const url = await uploadUserProfile(currentUserId.value, selectedFile.value)
    
            await updateUser(formData.value.id, {
                name: formData.value.name,
                avatar: url
            });
    
            formData.value.avatar = url
            selectedFile.value = null;
            loading.value = false;
            useToast('success', 'User details updated successfully')
            // emit('handle-profile-detail', true)
        } else {
            await updateUser(formData.value.id, {
                name: formData.value.name,
            });
            
            selectedFile.value = null;
            loading.value = false
            useToast('success', 'User details updated successfully')
            // emit('handle-profile-detail', true)
        }

        setTimeout(async() => {
            const email = useCookie('email')
            const user = await getUserByField('email', email.value);
            formData.value = user;
            userStore.setUserData(user)
        }, 1000)
    }

    const handleCameraClick = () => {
        roomInputRef.value.click();
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        formData.value.avatar = URL.createObjectURL(file);
        selectedFile.value = file;
    }

</script>

<style>

</style>