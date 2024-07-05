import transport from '~/services/emailService'

// Configure the mailoptions object
const mailOptions = {
    from: 'Chat App<noreply@chat-app-e5772.firebaseapp.com>',
    to: 'test@example.com',
    subject: 'Invite User',
}

const text1 = `
    Hello,

    You are invited to join our room in our Chat App.
`

const text2 = `
    If you didn't want to join the room, you can ignore this email.

    
    Thanks,
    Chat App team
`

export default defineEventHandler(async (event) => {
    const options = await readBody(event)

    const url = ` 
    ${process.env.FRONTEND_URL}/sign-up`

    mailOptions.to = options.userEmail
    mailOptions.text = text1 + url + text2

    return await transport.sendMail(mailOptions);
})