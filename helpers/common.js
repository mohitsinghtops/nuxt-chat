import { v4 as uuidv4 } from 'uuid'

export const generateRandomId = () => {
  return uuidv4()
}

export const generateRandomDigit = () => {
  return Math.floor(10000 + Math.random() * 90000);
}