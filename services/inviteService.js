import { addData, getAllData, getDataByField, updateCollectionData, deleteCollectionData, getDataById, getAllDataByField, getDataByQuery } from '@/database/firebaseService';

import { db } from '~/database'

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    orderBy,
    onSnapshot,
} from 'firebase/firestore'

const collectionName = 'invites'

export const addInvite = async (item) => {
    return await addData(item, collectionName);
}

export const getInvites = async () => {
    return await getAllData(collectionName)
}

export const getInviteById = async (id) => {
    return await getDataById(id, collectionName)
}

// New function to get item by a specific field
export const getInviteByField = async (field, value) => {
    return await getAllDataByField(field, value, collectionName)
}

// New function to get item by a specific query
export const getInviteByRoomAndEmail = async (roomId, userEmail) => {
    const q = query(collection(db, collectionName), where('roomId', '==', roomId), where('userEmail', '==', userEmail), where('status', '==', 0))
    const items =  await getDataByQuery(q)
    return items?.length ? items[0] : null 
}

// New function to get item by a specific query
export const getUsersPendingInvites = async (field, value) => {
    const q = query(collection(db, collectionName), where(field, '==', value), where('status', '==', 0))
    const items =  await getDataByQuery(q)
    return items
}

export const updateInvite = async (id, item) => {
    return await updateCollectionData(id, item, collectionName)
}

export const deleteInvite = async (id) => {
    return await deleteCollectionData(id, collectionName)
}