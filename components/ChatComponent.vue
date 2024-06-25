<template>
    <div>
        <div class="loader min-h-screen flex items-center justify-center" v-if="!dataLoaded">
            <loading-component :loading-text="false"></loading-component>
        </div>
        <vue-advanced-chat v-if="rooms.length > 0" height="calc(100vh - 10px)" :theme="'dark'"
            :current-user-id="currentUserId" :rooms="rooms.length > 0 ? JSON.stringify(rooms) : []"
            :rooms-loaded="roomsLoaded" :menu-actions="JSON.stringify(roomActions)"
            :messages="messages.length > 0 ? JSON.stringify(messages) : []" :messages-loaded="messagesLoaded"
            :message-actions="JSON.stringify(messageActions)" :room-info-enabled="true" :single-room="false"
            :message-selection-actions="JSON.stringify(messageSelectionActions)"
            @send-message="sendMessage($event.detail[0])" @fetch-messages="fetchMessages($event.detail[0])"
            @room-info="roomInfo($event.detail[0])" @menu-action-handler="menuActionHandler($event.detail[0])"
            @message-selection-action-handler="
                messageSelectionActionHandler($event.detail[0])
                " @send-message-reaction="sendMessageReaction($event.detail[0])" @edit-message="editMessage($event.detail[0])" @delete-message="deleteMessage($event.detail[0])" @open-file="openFile($event.detail[0])" 
            @add-room="addNewRoom" />

        <create-room-modal v-if="modalType == 'room'" @create-room="handleRoomCreate" :total-rooms="rooms.length" />
    </div>
</template>

<script setup>
import { register } from "vue-advanced-chat";
import {
    getRooms,
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
import { generateRandomId, generateRandomDigit } from "~/helpers/common.js";
import { useUserStore } from "~/store/user";

register();

const userStore = useUserStore();
const modalType = ref("");
const showRoomInfo = ref(false);
const roomDetails = ref({});
const roomsLoaded = ref(false);
const roomId = ref("1");
const messagesLoaded = ref(false);
const currentUserId = ref("");
const dataLoaded = ref(true);
const messageSelectionActions = ref([
    {
        name: "deleteMessages",
        title: "Delete",
    },
]);
const rooms = ref([]);
const messages = ref([]);
const roomActions = ref([
    // {
    //     name: "addUser",
    //     title: "Add User",
    // },
    // {
    //     name: "removeUser",
    //     title: "Remove User",
    // },
    {
        name: "deleteRoom",
        title: "Delete Room",
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
    },
]);

onMounted(() => {
    currentUserId.value = localStorage.getItem("userId");
    fetchAllRooms("mount");
});

const screenHeight = computed(() => {
    return window.innerHeight + "px";
});

const fetchAllRooms = (type = "") => {
    dataLoaded.value = type != "mount" ? true : false;
    roomsLoaded.value = false;
    getRooms()
        .then((res) => {
            rooms.value = res;
            if (res.length < 1) {
                modalType.value = "room";
            }
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            roomsLoaded.value = true;
            dataLoaded.value = true;
        });
};

const fetchMessages = async ({ room, options = {} }) => {
    messagesLoaded.value = false;
    messages.value = [];
    const res = await getRoomMessages(room.roomId);

    setTimeout(() => {
        if (res) {
            messages.value = res;
            messagesLoaded.value = true;
        } else {
            messagesLoaded.value = true;
        }
        messagesLoaded.value = true;
    }, 1000);
};

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
        content: content ?? "",
        // senderId        : '2',
        senderId: currentUserId.value,
        username: userStore.getUserData.name,
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

    // console.log('finalMessageObj', finalMessageObj);
    const { id } = await addMessage(finalMessageObj);
    finalMessageObj.id = id;
    // if (!files) {
    //     messages.value = [...messages.value, finalMessageObj];
    // }
    messages.value = [...messages.value, finalMessageObj];

    if (files) {
        for (let index = 0; index < files.length; index++) {
            await uploadFile({ file: files[index], messageId: id, roomId });
        }
    }
    await updateLastRoomMessage(finalMessageObj);
    fetchAllRooms();
};

const editMessage = async ({ roomId, messageId, newContent, files, replyMessage, usersTag }) => {

    const message = await getMessage('_id', messageId);
    message.content = newContent

    await updateMessage(message.id, message);
    messages.value.forEach((item) => {
        if(item.id == message.id) {
            item.content = newContent
        }
    })

    if (files) {
        for (let index = 0; index < files.length; index++) {
            await uploadFile({ file: files[index], messageId: message.id, roomId });
        }
    }
}

const deleteMessage = async ({ roomId, message }) => {
    message.deleted = new Date()

    await updateMessage(message.id, message);
    messages.value.forEach((item) => {
        if(item.id == message.id) {
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

const uploadFile = async ({ file, messageId, roomId }) => {
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
                const message = messages.value.find((message) => message.id === messageId);

                message.files.forEach((f) => {
                    f.url = url;
                    f.preview = url;
                });

                await updateMessage(messageId, message);
                await updateLastRoomMessage(message);
                // const res = await getRoomMessages(roomId);

                // const progressFile = message.files.find((file) => file.url === url);
                // delete progressFile.progress;
                // messages.value = res;

                resolve(true);
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

const formattedFiles = (files) => {
    const formattedFiles = [];

    files.forEach((file) => {
        const messageFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            extension: file.extension || file.type,
            url: file.url || file.localUrl,
            preview: file.url || file.localUrl,
        };

        if (file.audio) {
            messageFile.audio = true;
            messageFile.duration = file.duration;
        }

        formattedFiles.push(messageFile);
    });

    return formattedFiles;
};

const roomInfo = (room) => {
    showRoomInfo.value = true;
    roomDetails.value = room;
    alert("Room Details: " + JSON.stringify(room));
};

const menuActionHandler = async (data) => {
    const actionName = data.action.name;
    const roomId = data.roomId;

    switch (actionName) {
        case "deleteRoom":
            deleteCurrentRoom(roomId);
            break;
        case "addUser":
            break;
        case "removeUser":
            break;
        default:
            break;
    }
};

const deleteCurrentRoom = async (roomId) => {
    if(rooms.value.length > 0) { 
        roomsLoaded.value = false;
        const room = rooms.value.find((room) => room.roomId == roomId);
        await deleteRoomWithAllMessages(room.id, roomId);
        fetchAllRooms();
    }
};

const messageSelectionActionHandler = ({ roomId, action, messages }) => {
    if(action.name == "deleteMessages") {
        messages.forEach(message => {
            deleteMessage({ roomId, message })
        })
    }
};

const sendMessageReaction = async({ roomId, messageId, reaction, remove }) => {
    const message = await getMessage('_id', messageId);
    await updateMessageReactions(message, currentUserId.value, reaction.unicode, remove ? 'remove' : 'add');

    const allMessages = await getRoomMessages(roomId);
    messages.value = allMessages
};

const addNewRoom = () => {
    modalType.value = "room";
};

const handleRoomCreate = (data) => {
    modalType.value = "";
    if (data) {
        fetchAllRooms();
    }
};

const openFile = async({ message, file }) => {
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


</script>
