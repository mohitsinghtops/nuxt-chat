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
    orderBy
} from 'firebase/firestore'
import { orderByValue } from 'firebase/database'

export const addData = async (item, collectionName) => {
    item.createdAt = new Date()
    const docRef = await addDoc(collection(db, collectionName), item)
    return docRef
}

export const getAllData = async (collectionName, order = 'asc') => {
    const q = query(collection(db, collectionName), orderBy('createdAt', order))
    const querySnapshot = await getDocs(q)
    const items = []
    querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() })
    })
    return items
}

export const getDataByField = async (field, value, collectionName, order = 'asc') => {
    const q = query(collection(db, collectionName), where(field, '==', value), orderBy('createdAt', order))
    const querySnapshot = await getDocs(q)
    const items = []
    querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() })
    })
    return items?.length ? items[0] : null
}

export const getDataArrByField = async (field, value, collectionName, order = 'asc') => {
    const q = query(collection(db, collectionName), where(field, '==', value), orderBy('createdAt', order))
    const querySnapshot = await getDocs(q)
    const items = []
    querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() })
    })
    return items 
}

export const updateCollectionData = async (id, item, collectionName) => {
    const docRef = doc(db, collectionName, id)
    item.updatedAt = new Date()
    return await updateDoc(docRef, item)
}

export const deleteCollectionData = async (id, collectionName) => {
    const docRef = doc(db, collectionName, id)
    item.deletedAt = new Date()
    return await deleteDoc(docRef)
}

export const getDataById = async (id, collectionName) => {
    const docSnap = await getDoc(doc(db, collectionName, id))
    return docSnap.data();
}