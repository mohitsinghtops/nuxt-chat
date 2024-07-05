import {addData, getAllData, getDataByField, getAllDataByField, updateCollectionData, deleteCollectionData, getDataById} from '@/database/firebaseService';
import  {updateRoom} from '@/services/roomService';
import { collection,  query,  orderBy, arrayRemove, arrayUnion } from 'firebase/firestore'
import { db } from '~/database'

const collectionName = 'messages'
const roomCollectionName = 'rooms'
const MESSAGE_REACTIONS_FIELD = 'reactions'

export const addMessage = async (item) => {
  return await addData(item, collectionName);
}

export const getAllMessages = async () => {
  return await getAllData(collectionName)
}

export const getMessage = async (field, value) => {
  const messages = await getDataByField(field, value, collectionName);
  return messages?.length ? messages[0] : null
}

export const getMessageById = async (id) => {
  return await getDataById(id, collectionName);
}

export const getRoomMessages = async (roomId) => {
  return await getAllDataByField('roomId', roomId, collectionName)
}

export const getUserMessages = async (senderId) => {
  return await getAllDataByField('senderId', senderId, collectionName)
}

export const updateMessage = async (id, item) => {
  return await updateCollectionData(id, item, collectionName)
}

export const deleteMessage = async (id) => {
  return await deleteCollectionData(id, collectionName)
}

export const updateLastRoomMessage = async(message) => {
  const rooms = await getDataByField('roomId', message.roomId, roomCollectionName);
  const room = rooms?.length ? rooms[0] : {}

  room.lastMessage = {
    _id: message._id,
    content: message.content,
    senderId: message.senderId,
    timestamp: message.timestamp
  }
  return await updateRoom(room.id, room);
}

export const updateMessageReactions = async(
	message,
	currentUserId,
	reactionUnicode,
	action
) => {
	const arrayUpdate =
  action === 'add' ? arrayUnion(currentUserId) : arrayRemove(currentUserId)

  const data = {
    [`${MESSAGE_REACTIONS_FIELD}.${reactionUnicode}`]: arrayUpdate
	}
  
  return await updateCollectionData(message.id, data, collectionName)

}
