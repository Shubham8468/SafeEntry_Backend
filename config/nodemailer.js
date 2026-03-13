import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,          // STARTTLS on port 587
    pool: true,             // reuse SMTP connections instead of opening a new one per email
    maxConnections: 5,
    rateDelta: 1000,
    rateLimit: 5,
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

export default transport;