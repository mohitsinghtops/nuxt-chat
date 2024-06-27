<template>
    <div>
        <div class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-grayPrimary/90">
            <div class="relative p-4 w-full max-w-md max-h-full">
                <!-- Modal content -->
                <div class="relative rounded-lg shadow bg-grayPrimary border border-gray-50/10">
                    <!-- Modal header -->
                    <div class="flex items-center justify-between px-4 py-3 border-b rounded-t border-gray-50/10">
                        <h3 class="text-xl font-semibold text-white">Create Room</h3>
                        <button type="button"
                            class="end-2.5 text-gray-400 bg-transparent rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                            data-modal-hide="authentication-modal"
                            @click.prevent="handleCloseModal(false)"
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
                        <form class="space-y-4" @submit.prevent="createRoom">
                            <div>
                                <label for="room_name" class="block mb-2 text-sm font-medium text-white">Room
                                    Name</label>
                                <input type="text" name="room_name" id="room_name" v-model="formData.roomName"
                                    class="text-gray-200 text-sm rounded-lg block w-full p-2.5 bg-grayPrimary border-gray-50/10 placeholder-gray-400"
                                    placeholder="Name" required />
                            </div>

                            <button type="submit"
                                class="w-auto text-white bg-blueLight hover:bg-blueDark focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                <loading-component v-if="loading"></loading-component>
                                <span v-else>Submit</span>
                            </button>

                            <button type="button"
                                class="w-auto text-white bg-blueDark hover:bg-blueLight focus:ring-0 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-4" @click.prevent="userLogout" v-if="totalRooms == 0">
                                <span>Logout</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { addRoom } from '~/services/roomService.js'
import { generateRandomId, generateRandomDigit } from '~/helpers/common.js'
import { useUserStore } from "~/store/user";

const userStore = useUserStore();
const loading = ref(false)
const formData = reactive({
    roomName: '',
})

const defaultRoomObject = ref(
    {
        roomId: '1',
        roomName: 'My Room 1',
        avatar: 'https://img.icons8.com/bubbles/50/group.png',
        users: [
            {
                _id: '1',
                username: 'XYZ',
                email: 'test@example.com'
            }
        ],
        lastMessage: {
            content: 'Rooms Created'
        },
        typingUsers: []
    }
)

const emit = defineEmits(['create-room']);

const props = defineProps({
    totalRooms: {
        type: Number,
        required: true
    }
})

const createRoom = () => {
    loading.value = true;
    
    defaultRoomObject.value.roomId              = generateRandomDigit().toString();
    defaultRoomObject.value.roomName            = formData.roomName;
    defaultRoomObject.value.users[0]._id        = userStore.getUserData.userId;
    defaultRoomObject.value.users[0].username   = userStore.getUserData.name;
    defaultRoomObject.value.users[0].email      = userStore.getUserData.email;

    addRoom(defaultRoomObject.value)
    .then((res) => {
        handleCloseModal(true);
        useToast('success', 'Room created successfully')
    }).catch((err) => {
        console.log('err: ', err)
        useToast('error', err)
    }).finally(() => {
        loading.value = true;
    })
}

const handleCloseModal = (value) => {
    emit('create-room', value)
}


const userLogout = () => {
    const userId = useCookie('userId')
    userId.value = null
    const userEmail = useCookie('email')
    userEmail.value = null;

    localStorage.removeItem('userId')

    userStore.setIsLoggedIn(false);
    userStore.setUserData(null);

    navigateTo('/sign-in')
};
</script>
