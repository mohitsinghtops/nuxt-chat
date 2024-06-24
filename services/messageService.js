import {addData, getAllData, getDataByField, getDataArrByField, updateCollectionData, deleteCollectionData, getDataById} from '@/database/firebaseService';
import  {updateRoom} from '@/services/roomService';

const collectionName = 'messages'
const roomCollectionName = 'rooms'

export const addMessage = async (item) => {
  return await addData(item, collectionName);
}

export const getAllMessages = async () => {
  return await getAllData(collectionName)
}

export const getMessage = async (field, value) => {
  return await getDataByField(field, value, collectionName);
}

export const getMessageById = async (id) => {
  return await getDataById(id, collectionName);
}

export const getRoomMessages = async (roomId) => {
  return await getDataArrByField('roomId', roomId, collectionName, )
}

export const updateMessage = async (id, item) => {
  return await updateCollectionData(id, item, collectionName)
}

export const deleteMessage = async (id) => {
  return await deleteCollectionData(id, collectionName)
}

export const updateLastRoomMessage = async(message) => {
  const room = await getDataByField('roomId', message.roomId, roomCollectionName);
  
  room.lastMessage = {
    _id: message._id,
    content: message.content,
    senderId: message.senderId,
    timestamp: message.timestamp
  }
  return await updateRoom(room.id, room);
}