import {addData, getAllData, getDataByField, getDataArrByField, updateCollectionData, deleteCollectionData} from '@/database/firebaseService';
import { collection,  query,  orderBy } from 'firebase/firestore'
import { db } from '~/database'

const collectionName = 'rooms'

export const addRoom = async (item) => {
  return await addData(item, collectionName);
}

export const getRooms = async () => {
  return await getAllData(collectionName)
}

export const updateRoom = async (id, item) => {
  return await updateCollectionData(id, item, collectionName)
}

export const deleteRoom = async (id) => {
  return await deleteCollectionData(id, collectionName)
}

export const deleteRoomWithAllMessages = async (id, roomId) => {
  await deleteCollectionData(id, collectionName)
  const messages = await getDataArrByField('roomId', roomId, 'messages');
  console.log(messages)
  messages.forEach((message) => {
    deleteCollectionData(message.id, 'messages')
  })
  
}