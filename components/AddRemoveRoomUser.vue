<template>
    <div>
        <div class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-grayPrimary/90">

            <!-- main -->
            <div class="relative p-4 w-full max-w-md max-h-full">
                <!-- Modal content -->
                <div class="relative rounded-lg shadow bg-grayPrimary border border-gray-50/10">
                    <!-- Modal header -->
                    <div class="flex items-center justify-between px-4 py-3 border-b rounded-t border-gray-50/10">
                        <h3 class="text-xl font-semibold text-white">{{ type == 'add' ? 'Add User' : 'Remove Users'}}</h3>
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
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    <!-- Modal body -->
                    <div class="p-4 md:p-5">
                        <templaye v-if="dataLoading">
                            <loading-component class="h-[calc(100%-1rem)]"></loading-component>
                        </templaye>

                        <template v-else>
                            <form class="space-y-4" v-if="type == 'add'" @submit.prevent="handleAddUser">
                                <div>
                                    <label for="user_email" class="block mb-2 text-sm font-medium text-white">User Email</label>
                                    <input type="email" name="user_email" id="user_email" v-model="formData.email"
                                        class="text-gray-200 text-sm rounded-lg block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                                        placeholder="Email" required />
                                </div>
    
                                <button type="submit"
                                    class="w-auto text-white bg-blueLight hover:bg-blueDark focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                    <loading-component v-if="loading"></loading-component>
                                    <span v-else>Submit</span>
                                </button>
    
                                <div 
                                    class="alert bg-red-400/10 text-red-600 border border-red-600 rounded my-5 py-3 px-4 text-sm"
                                    v-if="error"
                                >
                                    {{ error }}
                                </div>
                            </form>
    
                            <!-- remove form -->
                            <template v-else>
                                <template v-if="selectedRoom?.users?.length > 1">
                                    <form class="space-y-4" @submit.prevent="handleRemoveUser">
                                        <div class="flex gap-4 flex-wrap items-start mb-3">
        
                                            <template v-for="user in selectedRoom.users" :key="user._id">
                                                <div class="flex items-center gap-2" v-if="currentUserId != user._id">
                                                    <input
                                                        :id="'user_' + user._id"
                                                        type="checkbox"
                                                        v-model="formData.selectedUsers"
                                                        :value="user._id"
                                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label :for="'user_' + user._id" class="text-sm font-medium text-gray-300">
                                                        {{ user.username }}
                                                    </label>
                                                </div>
                                            </template>
                                        </div>
            
                                        <button type="submit"
                                            class="w-auto text-white bg-blueLight hover:bg-blueDark focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                            <loading-component v-if="loading"></loading-component>
                                            <span v-else>Submit</span>
                                        </button>
                                    </form>
                                </template>

                                <div 
                                    class="alert bg-blue-400/10 text-blue-600 border border-blue-600 rounded py-3 px-4 text-sm"
                                    v-else
                                >
                                    No users found to remove
                                </div>
                             </template>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { getUserByField } from "~/services/userService.js";
    import { getRoomWithRoomId, updateRoom } from "~/services/roomService.js";

    const props = defineProps({
        roomId: {
            type: Number,
            default: ""       
        },
        type: {
            type: String,
            default: "add"       
        }
    })

    const dataLoading = ref(false)
    const loading = ref(false)
    const error = ref(null);
    const currentUserId = ref('');
    const formData = reactive({
        email: '',
        selectedUsers: [],
    })

    const selectedRoom = ref({});

    onMounted(async() => {
        dataLoading.value = true;
        currentUserId.value = localStorage.getItem('userId');
        selectedRoom.value = await getRoomWithRoomId(props.roomId);
        dataLoading.value = false;
    })

    const emit = defineEmits(['add-room-user']);

    const handleCloseModal = () => {
        emit('add-room-user', false)
    }

    const handleAddUser = async() => {
        loading.value = true
        error.value = '';

        const user = await getUserByField('email', formData.email);

        if(!user) {
            error.value = 'User not found with selected email'
            loading.value = false
            useToast('error', 'User not found with selected email')
            return;
        }

        addUserData();
    };

    const addUserData = async() => {
        const userWithEmail = selectedRoom.value.users.find((roomUser) => roomUser._id == user.userId);

        if(userWithEmail) {
            error.value = 'User already added in room.'
            loading.value = false
            useToast('error', 'User already added in room')
            return;
        }

        const allRoomUsers = selectedRoom.value.users;

        allRoomUsers.push({
            _id: user.userId,
            username: user.name,
        })

        let data = {
            users: allRoomUsers
        }

        await updateRoom(selectedRoom.value.id, data);
        formData.email = ""

        loading.value = false
        error.value = '';
        useToast('success', 'User Added Successfully')
        emit('add-room-user', true)
    }

    const handleRemoveUser = async() => {
        if(formData.selectedUsers.length) {
            loading.value = true
            const allRoomUsers = selectedRoom.value.users.filter((user) => {
                return !formData.selectedUsers.includes(user._id)
            })
    
            let data = {
                users: allRoomUsers
            }
    
            await updateRoom(selectedRoom.value.id, data);
            formData.selectedUsers = []
    
            loading.value = false
            error.value = '';
            useToast('success', 'Users removed Successfully')
            emit('add-room-user', true)
        } else {
            useToast('error', 'No users found to remove')
        }
    }
</script>

<style>

</style>