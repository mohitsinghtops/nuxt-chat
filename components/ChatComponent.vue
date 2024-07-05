<template>
    <div>
        <div class="fixed top-0 left-0 w-full loader min-h-screen flex items-center justify-center z-50 bg-grayPrimary"
            v-if="!dataLoaded">
            <loading-component :loading-text="false"></loading-component>
        </div>
        <vue-advanced-chat 
            ref="chatRef" 
            height="calc(100vh - 10px)" 
            :theme="'dark'" 
            :current-user-id="currentUserId"
            :rooms="rooms.length > 0 ? JSON.stringify(rooms) : []" 
            :rooms-loaded="roomsLoaded"
            :menu-actions="JSON.stringify(roomActions)" 
            :messages="messages.length > 0 ? JSON.stringify(messages) : []"
            :messages-loaded="messagesLoaded" 
            :message-actions="JSON.stringify(messageActions)"
            :room-info-enabled="true" :single-room="false"
            :message-selection-actions="JSON.stringify(messageSelectionActions)"
            @send-message="sendMessage($event.detail[0])" 
            @fetch-messages="fetchMessages($event.detail[0])"
            @room-info="roomInfo($event.detail[0])" 
            @menu-action-handler="menuActionHandler($event.detail[0])"
            @message-selection-action-handler="messageSelectionActionHandler($event.detail[0])" 
            @send-message-reaction="sendMessageReaction($event.detail[0])"
            @edit-message="editMessage($event.detail[0])" 
            @delete-message="deleteMessage($event.detail[0])"
            @open-file="openFile($event.detail[0])" 
            @add-room="addNewRoom" 
        />

        <create-room-modal v-if="modalType == 'room'" @create-room="handleRoomCreate" :total-rooms="rooms.length" />

        <room-detail-modal v-if="showRoomModal" :room-id="selectedRoomId" @handleRoomDetail="handleRoomDetail"></room-detail-modal>

        <add-remove-room-user v-if="showAddUserModal" :type="addRemoveType" :room-id="selectedRoomId"
            @add-room-user="handleAddRemoveUser"></add-remove-room-user>

        <profile-detail-modal v-if="showProfileModal" :type="profileModalType"
            @handleProfileDetail="handleProfileDetail"></profile-detail-modal>

        <invite-modal v-if="showInviteModal" :all-invite-list="allInviteItems" @handleInvites="handleInvites"></invite-modal>
    </div>
</template>

<script setup>
import { register } from "vue-advanced-chat";
import {
    getRooms,
    getUserRooms,
    deleteRoom,
    deleteRoomWithAllMessages,
} from "~/services/roomService.js";
import { listenUploadImageProgress, deleteFile } from "~/database/storageService";
import {
    addMessage,
    getRoomMessages,
    updateMessage,
    updateLastRoomMessage,
    getMessage,
    getMessageById,
    updateMessageReactions
} from "~/services/messageService.js";
import { generateRandomId, generateRandomDigit, formattedFiles } from "~/helpers/common.js";
import { useUserStore } from "~/store/user";

import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '~/database'
import { getUsersPendingInvites } from "~/services/inviteService";

register();

const userStore = useUserStore();
const modalType = ref("");
const chatRef = ref(null);
const showRoomModal = ref(false);
const showRoomInfo = ref(false);
const roomDetails = ref({});
const addRemoveType = ref("")
const profileModalType = ref("profile")
const roomsLoaded = ref(false);
const selectedRoomId = ref("");
const messagesLoaded = ref(false);
const currentUserId = ref("");
const currentUserEmail = ref("");
const dataLoaded = ref(true);
const showAddUserModal = ref(false);
const showProfileModal = ref(false);
const messageSelectionActions = ref([
    {
        name: "deleteMessages",
        title: "Delete",
    },
]);
const rooms = ref([]);
const messages = ref([]);
const roomActions = ref([]);
const adminRoomActions = ref([
    {
        name: "myProfile",
        title: "My Profile",
    },
    {
        name: "addUser",
        title: "Invite User",
    },
    {
        name: "removeUser",
        title: "Remove Users",
    },
    {
        name: "deleteRoom",
        title: "Delete Room",
    },
    {
        name: "invitation",
        title: "Invitation List",
    },
    // {
    //     name: "changePassword",
    //     title: "Change Password",
    // },
    {
        name: "logOut",
        title: "Log Out",
    },
]);
const nonAdminRoomActions = ref([
    {
        name: "myProfile",
        title: "My Profile",
    },
    {
        name: "addUser",
        title: "Invite User",
    },
    {
        name: "invitation",
        title: "Invitation List",
    },
    // {
    //     name: "changePassword",
    //     title: "Change Password",
    // },
    {
        name: "logOut",
        title: "Log Out",
    },
]);
const messageActions = ref([
    {
        name: "replyMessage",
        title: "Reply",
    },
    {
        name: "editMessage",
        title: "Edit Message",
        onlyMe: true,
    },
    {
        name: "deleteMessage",
        title: "Delete Message",
        onlyMe: true,
    },
    {
        name: "selectMessages",
        title: "Select",
        onlyMe: true,
    },
]);
const showInviteModal = ref(false);
const allInviteItems = ref([]);

onMounted(() => {
    currentUserId.value = localStorage.getItem("userId");
    currentUserEmail.value = localStorage.getItem("email");
    fetchAllRooms("mount");
    getInviteRoomDetails();
});

const screenHeight = computed(() => {
    return window.innerHeight + "px";
});

const getInviteRoomDetails = async() => {

    // Reference to Firestore collection
    const invitesCollection = collection(db, 'invites');
    const invitesQuery = query(invitesCollection, where('userEmail', '==', currentUserEmail.value), where('status', '==', 0))

    onSnapshot(invitesQuery, (snapshot) => {
        const allInvites = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        allInviteItems.value = allInvites

        if(allInvites.length) {
            showInviteModal.value = true;
        } else {
            showInviteModal.value = false;
        }

    });
}

const handleInvites = (data) => {
    showInviteModal.value = false;
}

const fetchAllRooms = async (type = "") => {
    dataLoaded.value = type != "mount" ? true : false;
    roomsLoaded.value = false;

    // Reference to Firestore collection
    const roomsCollection = collection(db, 'rooms');
    const roomsQuery = query(roomsCollection, orderBy('createdAt'));

    onSnapshot(roomsQuery, (snapshot) => {
        const allRooms = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        let userRooms = [];
        allRooms.forEach((room) => {
            const filteredRooms = room.users.filter((user) => user._id == currentUserId.value);
            if (filteredRooms?.length) {
                userRooms.push(room);
            }
        });

        rooms.value = userRooms;
        roomsLoaded.value = true;
        dataLoaded.value = true;
    });
};

const fetchMessages = async ({ room, options = {} }) => {
    messagesLoaded.value = false;
    messages.value = [];

    // handle room actions to remove options from room actions
    handleRoomAction(room);

    // Reference to Firestore collection
    const messagesCollection = collection(db, 'messages');
    const messagesQuery = query(messagesCollection, where('roomId', '==', room.roomId), orderBy('createdAt'));

    onSnapshot(messagesQuery, (snapshot) => {
        if (snapshot?.docs?.length > 0) {
            messages.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            messagesLoaded.value = true;
        } else {
            messages.value = [];
            messagesLoaded.value = true;
        }
    });
};

const handleRoomAction = (room) => {
    const loggedInUser = room.users.find((user) => user._id == currentUserId.value);

    if (loggedInUser?.isAdmin) {
        roomActions.value = adminRoomActions.value
    } else {
        roomActions.value = nonAdminRoomActions.value
    }
}

const sendMessage = async ({
    roomId,
    content,
    files,
    replyMessage,
    usersTag,
}) => {
    const messId = messages.value.length + 1;
    // const messId = generateRandomDigit();

    const finalMessageObj = {
        _id: messId,
        avatar: userStore?.getUserData?.photoURL || 'https://img.icons8.com/bubbles/50/user.png',
        content: content ?? "",
        senderId: currentUserId.value,
        username: userStore?.getUserData?.displayName ?? userStore?.getUserData?.email,
        roomId: roomId,
        timestamp: new Date().toString().substring(16, 21),
        date: new Date().toDateString(),
        system: false,
        seen: true,
        deleted: false,
        disableActions: false,
        disableReactions: false,
    };

    if (usersTag) {
        finalMessageObj.usersTag = usersTag;
    }

    if (files) {
        finalMessageObj.files = formattedFiles(files);
    }

    if (replyMessage) {
        finalMessageObj.replyMessage = {
            _id: replyMessage._id,
            content: replyMessage.content,
            sender_id: replyMessage.senderId,
        };

        if (replyMessage.files) {
            finalMessageObj.replyMessage.files = formattedFiles(replyMessage.files);
        }
    }

    if (files) {
        const finalFiles = formattedFiles(files);
        finalMessageObj.files = finalFiles;
        messages.value = [...messages.value, finalMessageObj];
        for (let index = 0; index < files.length; index++) {
            const url = await uploadFile({ file: files[index], messageId: roomId, index });
            finalFiles[index].url = url;
            finalFiles[index].preview = url;
        }
        await addMessage(finalMessageObj);
        await updateLastRoomMessage(finalMessageObj);
    }
    else
    {
        await addMessage(finalMessageObj);
        await updateLastRoomMessage(finalMessageObj);
    }
    
    // fetchAllRooms();
};

const editMessage = async ({ roomId, messageId, newContent, files, replyMessage, usersTag }) => {

    const message = await getMessage('_id', messageId);
    message.content = newContent

    await updateMessage(message.id, message);
    messages.value.forEach((item) => {
        if (item.id == message.id) {
            item.content = newContent
        }
    })

    if (files) {
        for (let index = 0; index < files.length; index++) {
            await uploadFile({ file: files[index], messageId: message.id, index });
        }
    }
}

const deleteMessage = async ({ roomId, message }) => {

    await useConfirmationToast('warning', 'You won\'t be able to revert this!')
        .then(async (result) => {
            if (result.isConfirmed) {
                const data = {
                    deleted: new Date()
                }

                await updateMessage(message.id, data);
                messages.value.forEach((item) => {
                    if (item.id == message.id) {
                        item.deleted = new Date()
                    }
                })

                const { files } = message

                if (files) {
                    files.forEach(file => {
                        deleteFile(currentUserId.value, message.id, file)
                    })
                }
            }
        })
}

const uploadFile = async ({ file, messageId, index }) => {
    return new Promise((resolve) => {
        let type = file.extension || file.type;
        if (type === "svg" || type === "pdf") {
            type = file.type;
        }

        listenUploadImageProgress(
            currentUserId.value,
            messageId,
            file,
            type,
            (progress) => {
                // updateFileProgress(messageId, file.localUrl, progress);
            },
            (_error) => {
                resolve(false);
            },
            async (url) => {
                // const message = messages.value.find((message) => message.id === messageId);
                // message.files[index].url = url;
                // message.files[index].preview = url;
                
                // const data = {
                //     files: message.files
                // }

                // await updateMessage(messageId, data);
                // await updateLastRoomMessage(message);
                resolve(url);
            }
        );
    });
};

const updateFileProgress = (messageId, fileUrl, progress) => {
    const message = messages.value.find((message) => message.id === messageId);

    if (!message || !message.files) return;

    message.files.find((file) => file.url === fileUrl).progress = progress;
    messages.value = [...messages.value];
};

const roomInfo = (room) => {
    selectedRoomId.value = room.roomId
    showRoomModal.value = true;
    modalType.value = ''
};

const menuActionHandler = async (data) => {
    const actionName = data.action.name;
    const roomId = data.roomId;
    selectedRoomId.value = roomId

    switch (actionName) {
        case "myProfile":
            profileModalType.value = 'profile';
            showProfileModal.value = true
            break;
        case "addUser":
            addRemoveType.value = "add"
            showAddUserModal.value = true
            break;
        case "removeUser":
            handleRemoveUserFromRoom(roomId);
            break;
        case "deleteRoom":
            await useConfirmationToast('warning', 'You won\'t be able to revert this!')
                .then((result) => {
                    if (result.isConfirmed) {
                        deleteCurrentRoom(roomId);
                    }
                })
            break;
        case "changePassword":
            profileModalType.value = 'changePassword';
            showProfileModal.value = true
            break;
        case 'invitation':
            showInviteModal.value = true;
            break;
        case "logOut":
            userLogout();
            break;
        default:
            break;
    }
};

const handleRemoveUserFromRoom = (roomId) => {
    const room = rooms.value.find((item) => item.roomId == roomId)
    const user = room.users.find((data) => data._id == currentUserId.value)

    if (user?.isAdmin) {
        addRemoveType.value = "remove"
        showAddUserModal.value = true
    } else {
        selectedRoomId.value = ''
        useToast('error', 'Only room admin can remove users')
    }
}

const deleteCurrentRoom = async (roomId) => {
    if (rooms.value.length > 0) {
        const room = rooms.value.find((item) => item.roomId == roomId)
        const user = room.users.find((data) => data._id == currentUserId.value)


        if (user?.isAdmin) {
            await deleteRoomWithAllMessages(room.id, roomId);
            roomsLoaded.value = false;
        } else {
            useToast('error', 'Only room admin can delete room')
            roomsLoaded.value = false;
        }
        // await fetchAllRooms();
    }
};

const userLogout = () => {
    const accessToken = useCookie('accessToken')
    accessToken.value = null

    localStorage.removeItem('userId')
    localStorage.removeItem('email')

    userStore.setIsLoggedIn(false);
    userStore.setUserData(null);

    navigateTo('/sign-in')
};

const handleAddRemoveUser = async (value) => {
    showAddUserModal.value = false
    selectedRoomId.value = ''
    // if (value) {
    //     await fetchAllRooms();
    // }
};

const messageSelectionActionHandler = ({ roomId, action, messages }) => {
    if (action.name == "deleteMessages") {
        messages.forEach(message => {
            deleteMessage({ roomId, message })
        })
    }
};

const sendMessageReaction = async ({ roomId, messageId, reaction, remove }) => {
    const message = await getMessage('_id', messageId);
    await updateMessageReactions(message, currentUserId.value, reaction.unicode, remove ? 'remove' : 'add');

    const allMessages = await getRoomMessages(roomId);
    messages.value = allMessages
};

const addNewRoom = () => {
    modalType.value = "room";
    showRoomModal.value = false;
};

const handleRoomCreate = (data) => {
    modalType.value = "";
    // if (data) {
    //     fetchAllRooms();
    // }
};

const openFile = async ({ message, file }) => {
    // const response = await fetch(file.file.url);
    // const blob = await response.blob();
    const link = document.createElement('a');
    link.href = file.file.url;
    link.target = '_blank';
    link.download = file.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const handleRoomDetail = (value) => {
    showRoomModal.value = false;
    selectedRoomId.value = ""
    modalType.value = ''
    // if (value) {
    //     fetchAllRooms();
    // }
}

const handleProfileDetail = (value) => {
    showProfileModal.value = false;
}


</script>
