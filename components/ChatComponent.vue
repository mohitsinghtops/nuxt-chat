   <template>
    <div>
        <div class="loader min-h-screen flex items-center justify-center" v-if="!dataLoaded">
            <loading-component :loading-text="false"></loading-component>
        </div>
        <vue-advanced-chat
            v-if="rooms.length > 0"
            height="calc(100vh - 10px)"
            :theme="'dark'"
            :current-user-id="currentUserId"
            :rooms="rooms.length > 0 ? JSON.stringify(rooms) : []"
            :rooms-loaded="roomsLoaded"
            :menu-actions="JSON.stringify(roomActions)"
            :messages="messages.length > 0 ? JSON.stringify(messages) : []"
            :messages-loaded="messagesLoaded"
            :message-actions="JSON.stringify(messageActions)"
            :room-info-enabled="true"
            :single-room="false"
            :message-selection-actions="JSON.stringify(messageSelectionActions)"
            @send-message="sendMessage($event.detail[0])"
            @fetch-messages="fetchMessages($event.detail[0])"
            @room-info="roomInfo($event.detail[0])"
            @menu-action-handler="menuActionHandler($event.detail[0])"
            @message-selection-action-handler="
            messageSelectionActionHandler($event.detail[0])
            "
            @send-message-reaction="sendMessageReaction($event.detail[0])"
            @add-room="addNewRoom"
        />
    
        <create-room-modal
            v-if="modalType == 'room'"
            @create-room="handleRoomCreate"
            :total-rooms="rooms.length"
        />
    </div>
  </template>
  
  <script setup>
  import { register } from "vue-advanced-chat";
  import { getRooms, deleteRoom, deleteRoomWithAllMessages } from "~/services/roomService.js";
  import { listenUploadImageProgress } from "~/database/storageService";
  import {
    addMessage,
    getRoomMessages,
    updateMessage,
    deleteMessage,
    updateLastRoomMessage,
    getMessage,
    getMessageById
  } from "~/services/messageService.js";
  import { generateRandomId, generateRandomDigit } from '~/helpers/common.js'
  import { useUserStore } from "~/store/user";
  
  register();
  
  definePageMeta({
    middleware: ["auth"],
  });
  
  useHead({
    title: "Chat App",
  });
  
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
  const rooms = ref([
    //   {
    //     roomId: '1',
    //     roomName: 'My Room',
    //     avatar: 'https://img.icons8.com/bubbles/50/user.png',
    //     users: [
    //         {
    //             _id: localStorage.getItem('userId'),
    //             username: 'John Doe'
    //         }
    //     ],
    //     typingUsers: []
    //   }
  ]);
  const messages = ref([
    {
      _id: "7890",
      indexId: 12092,
      content: "Message 1",
      senderId: "1234",
      username: "John Doe",
      avatar: "https://i.pinimg.com/originals/00/b8/b4/00b8b4588145fedadf563d18e7909c50.jpg",
      date: "13 November",
      timestamp: "10:20",
      system: false,
      saved: true,
      distributed: true,
      seen: true,
      deleted: false,
      failure: true,
      disableActions: false,
      disableReactions: false,
      files: [
        {
          name: "My File",
          size: 67351,
          type: "jpg",
          audio: false,
        //   duration: 14.4,
          url: "https://i.pinimg.com/originals/00/b8/b4/00b8b4588145fedadf563d18e7909c50.jpg",
          preview:
            "https://i.pinimg.com/originals/00/b8/b4/00b8b4588145fedadf563d18e7909c50.jpg",
        //   progress: 100,
        },
      ],
      reactions: {},
      replyMessage: {},
    },
  ]);
  const roomActions = ref([
    {
      name: "addUser",
      title: "Add User",
    },
    {
      name: "removeUser",
      title: "Remove User",
    },
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
    {
      name: "addMessageToFavorite",
      title: "Add To Favorite",
    },
    {
      name: "shareMessage",
      title: "Share Message",
    },
  ]);
  
  onMounted(() => {
    currentUserId.value = localStorage.getItem("userId");
    fetchAllRooms('mount');
  });
  
  const screenHeight = computed(() => {
    return window.innerHeight + "px";
  });
  
  const fetchAllRooms = (type = '') => {
    dataLoaded.value = type != 'mount' ? true: false
    roomsLoaded.value = false;
    getRooms()
      .then((res) => {
        rooms.value = res;
        if(res.length < 1) {
            modalType.value = 'room'
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        roomsLoaded.value = true;
        dataLoaded.value = true
      });
  };
  
  const fetchMessages = async ({ room, options = {} }) => {
    messagesLoaded.value = false;
    messages.value = []
    const res = await getRoomMessages(room.roomId);
  
    setTimeout(() => {
      if(res) {
          messages.value = res
          messagesLoaded.value = true
      } else {
          messagesLoaded.value = true
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
    
    const messId = generateRandomDigit();
    const finalMessageObj = {
        _id: messId,
        content: content ?? "",
        avatar: 'https://img.icons8.com/bubbles/50/user.png',
        //   senderId        : '2',
        senderId: currentUserId.value,
        username: userStore.getUserData.name,
        roomId: roomId,
        timestamp: new Date().toString().substring(16, 21),
        date: new Date().toDateString(),
        usersTag: usersTag,
        system: false,
        seen: true,
        deleted: false,
        disableActions: false,
        disableReactions: false,
    };

      if (files) {
        finalMessageObj.files = formattedFiles(files)
    }

    if (replyMessage) {
        finalMessageObj.replyMessage = {
            _id: replyMessage._id,
            content: replyMessage.content,
            sender_id: replyMessage.senderId
        }

        if (replyMessage.files) {
            finalMessageObj.replyMessage.files = formattedFiles(replyMessage.files)
        }
    }
  
    // console.log('finalMessageObj', finalMessageObj);
    const { id } = await addMessage(finalMessageObj);
    messages.value = [...messages.value, finalMessageObj];

    if (files) {
        for (let index = 0; index < files.length; index++) {
            await uploadFile({ file: files[index], messageId: id, roomId })
        }
    }
    await updateLastRoomMessage(finalMessageObj);
    fetchAllRooms();

  };

  const uploadFile = async({ file, messageId, roomId }) => {
    return new Promise(resolve => {
        let type = file.extension || file.type
        if (type === 'svg' || type === 'pdf') {
            type = file.type
        }

        listenUploadImageProgress(
            currentUserId.value,
            messageId,
            file,
            type,
            progress => {
                updateFileProgress(messageId, file.localUrl, progress)
            },
            _error => {
                resolve(false)
            },
            async url => {
                const message = await getMessageById(messageId);

                message.files.forEach(f => {
                    f.url = url
                    f.preview = url
                })

                await updateMessage(messageId, message);
                await updateLastRoomMessage(message);

                // messages.value.push(message)
                // messages.value = res
                resolve(true)
            }
        )
    })
  }

  const updateFileProgress = (messageId, fileUrl, progress) => {
    const message = messages.value.find(message => message.id === messageId)

    if (!message || !message.files) return

    message.files.find(file => file.url === fileUrl).progress = progress
    messages.value = [...messages.value]
}
  
  const formattedFiles = (files) => {
    const formattedFiles = []

    files.forEach(file => {
        const messageFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            extension: file.extension || file.type,
            url: file.url || file.localUrl,
            preview: file.url || file.localUrl,
            // url: 'https://img.icons8.com/bubbles/50/user.png',
            // preview: 'https://img.icons8.com/bubbles/50/user.png'
            
        }

        if (file.audio) {
            messageFile.audio = true
            messageFile.duration = file.duration
        }

        formattedFiles.push(messageFile)
    })

    return formattedFiles
}

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
    roomsLoaded.value = false;
    const room = rooms.value.find((room) => room.roomId == roomId);
    await deleteRoomWithAllMessages(room.id, roomId);
    fetchAllRooms();
  };
  
  const messageSelectionActionHandler = (data) => {
    console.log("messageSelectionActionHandler", data);
  };
  
  const sendMessageReaction = (data) => {
    console.log("sendMessageReaction", data);
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
  </script>
  