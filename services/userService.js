import {addData, getAllData, getDataByField, updateCollectionData, deleteCollectionData} from '@/database/firebaseService';

const collectionName = 'users'

export const addUser = async (item) => {
  return await addData(item, collectionName);
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
