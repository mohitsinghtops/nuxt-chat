<template>
    <div>
        <div class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-grayPrimary/90">
            <!-- Modal content -->
            <div class="relative w-full max-w-3xl max-h-full rounded-lg shadow bg-grayPrimary border border-gray-50/10" v-click-outside="handleCloseModal">
                <!-- Modal header -->
                <div class="flex items-center justify-between px-4 py-3 border-b rounded-t border-gray-50/10">
                    <h3 class="text-xl font-semibold text-white">Invitation List</h3>
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
                <div class="p-4 md:p-5 max-h-[350px] overflow-auto">
                    <h3 class="text-white text-lg font-bold mb-4">{{ allInviteList.length }} invites available</h3>

                    <div class="invite-details">
                        <div class="invite mb-4 flex justify-between gap-4 items-center" v-for="invite in allInviteList" :key="invite.id">
                            <div class="left-details flex items-center gap-2">
                                <div class="avatar">
                                    <img :src="invite.avatar" alt="avatar" class="rounded-full w-[60px] h-[60px]">
                                </div>
                                <div class="details">
                                    <h4 class="text-gray-300"><span class="text-white font-semibold">Room Name:</span> {{ invite.roomName }}</h4>
                                    <p class="text-gray-300 text-sm"><span class="text-white font-semibold">Invited By:</span> {{ invite.invitedByUserEmail }}</p>
                                </div>
                            </div>

                            <div class="right-btn flex gap-3 items-center">
                                <button type="button" class="bg-lime-500 text-white text-sm px-3 py-2 rounded font-bold" @click="handleStatusChange(invite, 1)">
                                    <loading-component v-if="acceptLoading == invite.id"></loading-component>
                                    <span v-else>Approve</span>
                                </button>
                                <button type="button" class="bg-red-500 text-white text-sm px-3 py-2 rounded font-bold" @click="handleStatusChange(invite, 2)">
                                    <loading-component v-if="rejectLoading == invite.id"></loading-component>
                                    <span v-else>Reject</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { updateInvite } from '~/services/inviteService';
import { getRoomById, updateRoom } from '~/services/roomService';
import { useUserStore } from '~/store/user';


    const props = defineProps({
        allInviteList: {
            type: Array,
            default: []
        }
    })

    const emit = defineEmits(['handle-invites']);

    const userStore = useUserStore();
    const acceptLoading = ref('')
    const rejectLoading = ref('')

    const handleCloseModal = () => {
        emit('handle-invites')
    }

    const handleStatusChange = async(invite, status) => {

        acceptLoading.value = status == 1 ? invite.id : '';
        rejectLoading.value = status == 2 ? invite.id : '';

        const room = await getRoomById(invite.roomId);

        if(!room) {
            useToast('error', 'No room found or may be deleted')
            return true;
        }

        const allRoomUsers = room.users;

        allRoomUsers.push({
            _id: userStore.getUserData?.uid,
            email: userStore.getUserData?.email,
            username: userStore.getUserData?.displayName ?? '',
            avatar: userStore.getUserData?.photoURL ?? 'https://img.icons8.com/bubbles/50/user.png',
        })

        let data = {
            users: allRoomUsers
        }

        await updateRoom(invite.roomId, data)
            .then(async(res) => {
                // to update the status of invite
                const inviteData = {
                    status: status
                }
        
                await updateInvite(invite.id, inviteData);
        
                useToast('success', status == 1 ? 'Invitation accepted successfully' : 'Invitation rejected successfully')
        
                if(props.allInviteList.length < 1) {
                    handleCloseModal();
                }
            }).catch((err) => {
                useToast('error', 'Failed to update status');
            }).finally(() => {
                acceptLoading.value = '';
                rejectLoading.value = '';
            })

    }
</script>