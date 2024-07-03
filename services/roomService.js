import { addData, getAllData, getDataByField, getDataArrByField, updateCollectionData, deleteCollectionData, getDataById } from '@/database/firebaseService';
import { collection, query, orderBy } from 'firebase/firestore'
import { db } from '~/database'

const collectionName = 'rooms'

export const addRoom = async (item) => {
    return await addData(item, collectionName);
}

export const getRooms = async () => {
    return await getAllData(collectionName)
}

export const getRoomWithRoomId = async (roomId) => {
    return await getDataByField('roomId', roomId, collectionName)
}

export const getUserRooms = async (key = 'id', userId) => {
    let userRooms = [];
    const allRooms = await getAllData(collectionName);

    allRooms.forEach((room) => {
        const filteredRooms = room.users.filter((user) => user[key] == userId);
        if (filteredRooms?.length) {
            userRooms.push(room);
        }
    });
    
    return userRooms;
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
    messages.forEach((message) => {
        deleteCollectionData(message.id, 'messages')
    })
}

export const getRoomById = async (id) => {
    return await getDataById(id, collectionName)
}