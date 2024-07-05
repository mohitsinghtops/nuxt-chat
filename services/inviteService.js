import { addData, getAllData, updateCollectionData, deleteCollectionData, getDataById, getAllDataByField, getDataByQuery } from '@/database/firebaseService';

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

// export const handleUserInvite = async (options) => {

//     const mailOptions = {
//         from: 'Chat App<noreply@chat-app-e5772.firebaseapp.com>',
//         to: 'test@example.com',
//         subject: 'Invite User',
//     }
    
//     const text1 = `
//         Hello,
    
//         You are invited to join our room in our Chat App.
//     `
    
//     const text2 = `
//         If you didn't want to join the room, you can ignore this email.
    
        
//         Thanks,
//         Chat App team
//     `

//     const url = ` 
//     ${process.env.FRONTEND_URL}/sign-up`

//     mailOptions.to = options.userEmail
//     mailOptions.text = text1 + url + text2

//     return await transport.sendMail(mailOptions);
// }