import { auth } from '~/database'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, updatePassword, confirmPasswordReset } from "firebase/auth";

export const signUpUser = async(data) => {
    return await createUserWithEmailAndPassword(auth, data.email, data.password)
}

export const signInUser = async(data) => {
    return await signInWithEmailAndPassword(auth, data.email, data.password)
}

export const signOutUser = async() => {
    return await signOut(auth)
}

export const getCurrentUser = async() => {
    return onAuthStateChanged(auth, (user) => {
        return user ?? {}
    });
}

export const updateUserProfile = async(data) => {
    return updateProfile(auth.currentUser, data)
}

export const forgotPassword = async(email) => {
    return await sendPasswordResetEmail(auth, email)
}

export const resetPassword = async(password, oobCode) => {
    return await confirmPasswordReset(auth, oobCode, password)
}

export const changePassword = async(newPassword) => {
    return await updatePassword(auth.currentUser, newPassword)
}