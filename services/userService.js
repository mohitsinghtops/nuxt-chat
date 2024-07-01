import { addData, getAllData, getDataByField, updateCollectionData, deleteCollectionData, getDataById } from '@/database/firebaseService';
import { collection, query, orderBy } from 'firebase/firestore'
import { db } from '~/database'
import { generateRandomDigit } from '~/helpers/common';
import { addRoom } from './roomService';

const collectionName = 'users'

export const addUser = async (item) => {

    const { id } = await addData(item, collectionName);
    const user = await getDataById(id, collectionName);

    const defaultRoom = {
        roomId: generateRandomDigit().toString(),
        roomName: user.name + "'s Demo Room",
        avatar: 'https://img.icons8.com/bubbles/50/group.png',
        users: [
            {
                _id: user.userId,
                username: user.name,
                email: user.email,
                avatar: 'https://img.icons8.com/bubbles/50/user.png',
                isAdmin: true,
            }
        ],
        lastMessage: {
            content: 'Room Created'
        },
        typingUsers: []
    }

    return await addRoom(defaultRoom);
}

export const getUsers = async () => {
    return await getAllData(collectionName)
}

// New function to get item by a specific field
export const getUserByField = async (field, value) => {
    return await getDataByField(field, value, collectionName)
}

export const updateUser = async (id, item) => {
    return await updateCollectionData(id, item, collectionName)
}

export const deleteUser = async (id) => {
    return await deleteCollectionData(id, collectionName)
}