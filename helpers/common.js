import { v4 as uuidv4 } from 'uuid'

export const generateRandomId = () => {
  return uuidv4()
}

export const generateRandomDigit = () => {
  return Math.floor(10000 + Math.random() * 90000);
}

export const formattedFiles = (files) => {
  const formattedFiles = [];
  files.forEach((file) => {
      const messageFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          extension: file.extension || file.type,
          url: file.url || file.localUrl,
          preview: file.url || file.localUrl,
      };

      if (file.audio) {
          messageFile.audio = true;
          messageFile.duration = file.duration;
      }

      formattedFiles.push(messageFile);
  });

  return formattedFiles;
};