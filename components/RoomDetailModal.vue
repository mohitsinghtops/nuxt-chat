<template>
    <div class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 z-50 w-full h-full rounded-lg max-w-sm min-w-sm shadow bg-grayPrimary border border-gray-50/10 min-h-screen max-h-screen p-6" v-click-outside="handleCloseModal">
        <loading-component v-if="dataLoading" class="h-[calc(100%-1rem)]"></loading-component>
        <template v-else>
            <div class="header flex justify-between">
                <h3 class="text-xl font-semibold text-white">Room Details</h3>
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
    
                <div class="form-group flex justify-between items-center my-5">
                    <input type="text" class="text-white border border-gray-600 py-2 px-3 w-full bg-transparent rounded rounded-tr-none rounded-br-none focus:ring-0 focus:border-gray-600" v-model="formData.roomName">
                    <button class="bg-blueLight text-white rounded py-2 px-3 border border-blueLight rounded-tl-none rounded-bl-none hover:bg-blueDark hover:border-blueDark" @click="updateRoomDetails">
                        <loading-component v-if="loading"></loading-component>
                        <span v-else>Update</span>
                    </button>
                </div>
    
                <div class="users mt-3">
                    <h4 class="text-white font-bold mb-2">Users: </h4>
                    <div class="user mb-4 flex items-start justify-between gap-4" v-for="user in formData.users" :key="formData.id">
                        <p class="text-gray-300 text-sm mb-1">{{ user.email }} <span>{{ user._id == currentUserId ? '(You)' : '' }}</span></p>
                        <button class="bg-red-500 text-xs px-3 py-1 rounded text-white" v-if="user._id != currentUserId && isRoomAdmin" @click="removeUser(user)">Remove</button>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>

    import { uploadRoomFile } from "~/database/storageService";
    import { updateRoom, getRoomWithRoomId } from "~/services/roomService";

    const props = defineProps({
        roomId: {
            type: String,
            default: ""
        }
    })

    const emit = defineEmits(['handle-room-detail'])

    const formData = ref(false);
    const dataLoading = ref(false);
    const loading = ref(false);
    const currentUserId = ref('');
    const roomInputRef = ref(null);
    const selectedFile = ref(null);

    onMounted(() => {
        currentUserId.value = localStorage.getItem('userId');
        getRoomDetail();
    })

    const isRoomAdmin = computed(() => {
        const user = formData.value.users.find((user) => user._id == currentUserId.value)
        return user.isAdmin;
    })

    const getRoomDetail = async() => {
        dataLoading.value = true;
        const room = await getRoomWithRoomId(props.roomId);
        formData.value = room;
        dataLoading.value = false;
    }

    const handleCloseModal = () => {
        emit('handle-room-detail', false)
    }

    const updateRoomDetails = async() => {
        loading.value = true

        let url = formData.value.avatar
        if(selectedFile.value) {
            url = await uploadRoomFile(currentUserId.value, formData.value.id, selectedFile.value)
        } 

        await updateRoom(formData.value.id, {
            roomName: formData.value.roomName,
            avatar: url
        });

        formData.value.avatar = url
        selectedFile.value = null;
        loading.value = false;
        useToast('success', 'Room details updated successfully')
        emit('handle-room-detail', true)
    }

    const handleCameraClick = () => {
        roomInputRef.value.click();
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        formData.value.avatar = URL.createObjectURL(file);
        selectedFile.value = file;
    }

    const removeUser = async(user) => {
        useConfirmationToast('warning', 'Do you want to remove the selected user?')
            .then(async(result) => {
                if(result.isConfirmed) {
                    const allFilteredRoomUsers = formData.value.users.filter((item) => item._id != user._id)
            
                    let data = {
                        users: allFilteredRoomUsers
                    }
            
                    await updateRoom(formData.value.id, data);
                    formData.value.users = allFilteredRoomUsers
                    useToast('success', 'Users removed Successfully')
                }
            })
    }

</script>

<style>

</style>