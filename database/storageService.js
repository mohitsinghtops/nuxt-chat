import { storage } from '~/database'

import {
	deleteObject,
	getDownloadURL,
	ref,
	uploadBytesResumable,
	uploadBytes
} from 'firebase/storage'

const MESSAGES_PATH = 'files/messages'
const ROOM_PATH = 'files/rooms'

const fileRef = (currentUserId, messageId, fileName) => {
	return ref(storage, `${MESSAGES_PATH}/${currentUserId}/${messageId}/${fileName}`)
}

const roomFileRef = (currentUserId, roomId, fileName) => {
	return ref(storage, `${ROOM_PATH}/${currentUserId}/${roomId}/${fileName}`)
}

export const deleteFile = (currentUserId, messageId, file) => {
	return deleteObject(
		fileRef(
			currentUserId,
			messageId,
			`${file.name}.${file.extension || file.type}`
		)
	)
}

export const getFileDownloadUrl = ref => {
	return getDownloadURL(ref)
}


export const uploadFileTask = (currentUserId, messageId, file, type) => {
	const uploadFileRef = fileRef(
		currentUserId,
		messageId,
		`${file.name}.${type}`
	)

	return uploadBytesResumable(uploadFileRef, file.blob, {
		contentType: type
	})
}

export const listenUploadImageProgress = (
	currentUserId,
	messageId,
	file,
	type,
	callback,
	error,
	success
) => {
	// check for already stored on firebase or not
	if(file?.localUrl?.includes('firebasestorage') || file?.url?.includes('firebasestorage')) {
		return file?.url || file?.localUrl;
	}

	const uploadTask = uploadFileTask(currentUserId, messageId, file, type)

	uploadTask.on(
		'state_changed',
		snap => {
			const progress = Math.round(
				(snap.bytesTransferred / snap.totalBytes) * 100
			)
			callback(progress)
		},
		_error => {
			error(_error)
		},
		async () => {
			const url = await getFileDownloadUrl(uploadTask.snapshot.ref)
			success(url)
		}
	)
}

export const uploadRoomFile = async(currentUserId, roomId, file) => {
	const storageRef = roomFileRef(currentUserId, roomId, file.name);
	
	// 'file' comes from the Blob or File API
	const result = await uploadBytes(storageRef, file)

	if(result){
		return await getFileDownloadUrl(result.ref);
	} else {
		return null;
	}

}
