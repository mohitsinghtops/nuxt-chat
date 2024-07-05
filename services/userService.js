import { addData, getAllData, getDataByField, updateCollectionData, deleteCollectionData, getDataById } from '@/database/firebaseService';
import { collection, query, orderBy } from 'firebase/firestore'
import { db } from '~/database'
import { generateRandomDigit } from '~/helpers/common';
import { addRoom } from './roomService';

const collectionName = 'users'

export const addUser = async (item) => {
    return await addData(item, collectionName);
}

export const getUsers = async () => {
    return await getAllData(collectionName)
}

// New function to get item by a specific field
export const getUserByField = async (field, value) => {
    const users = await getDataByField(field, value, collectionName)
    return users?.length ? users[0] : null
}

export const updateUser = async (id, item) => {
    return await updateCollectionData(id, item, collectionName)
}

export const deleteUser = async (id) => {
    return await deleteCollectionData(id, collectionName)
}