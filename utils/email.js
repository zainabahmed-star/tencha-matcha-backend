const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

// never throws: a failed email must not break an order
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        })
    } catch (err) {
        console.error('Email failed:', err.message)
    }
}

const itemsList = (order) =>
    order.items
        .map((i) => `<li>${i.name} (${i.size}) x ${i.quantity}</li>`)
        .join('')

const orderReceivedEmail = (to, order) =>
    sendEmail(
        to,
        `We received your order ${order.reference}`,
        `<h2>Thank you for your order!</h2>
        <p>We received your order <b>${order.reference}</b> and your receipt.
        We're now checking the payment. We'll email you as soon as it's confirmed.</p>
        <ul>${itemsList(order)}</ul>
        <p><b>Total: ${order.total.toFixed(3)} BD</b></p>
        <p>Tencha Matcha</p>`
    )

const orderConfirmedEmail = (to, order) =>
    sendEmail(
        to,
        `Your order ${order.reference} is confirmed`,
        `<h2>Payment received!</h2>
        <p>Your order <b>${order.reference}</b> is confirmed and we're preparing it now.</p>
        <ul>${itemsList(order)}</ul>
        <p><b>Total: ${order.total.toFixed(3)} BD</b></p>
        <p>Tencha Matcha</p>`
    )

const orderRejectedEmail = (to, order) =>
    sendEmail(
        to,
        `Problem with your payment for order ${order.reference}`,
        `<h2>We couldn't verify your payment</h2>
        <p>Order <b>${order.reference}</b>: ${order.rejectionReason || 'we could not confirm the payment from your receipt.'}</p>
        <p>Please contact us or place the order again with a valid receipt.</p>
        <p>Tencha Matcha</p>`
    )

module.exports = { orderReceivedEmail, orderConfirmedEmail, orderRejectedEmail }