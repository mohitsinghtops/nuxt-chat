import { addData, getAllData, getDataByField, getAllDataByField, updateCollectionData, deleteCollectionData, getDataById } from '@/database/firebaseService';

const collectionName = 'rooms'

export const addRoom = async (item) => {
    return await addData(item, collectionName);
}

export const getRooms = async () => {
    return await getAllData(collectionName)
}

export const getRoomWithRoomId = async (roomId) => {
    const rooms =  await getDataByField('roomId', roomId, collectionName)
    return rooms?.length ? rooms[0] : null
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
    const messages = await getAllDataByField('roomId', roomId, 'messages');
    messages.forEach((message) => {
        deleteCollectionData(message.id, 'messages')
    })
}

export const getRoomById = async (id) => {
    return await getDataById(id, collectionName)
}