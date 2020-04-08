const sgm = require("@sendgrid/mail")

sgm.setApiKey(process.env.API_KEY_SENDGRID)

const sendWelcomeMail = (email, name) => {
    sgm.send({
        to: email,
        from:"shresthdewan@gmail.com",
        subject: "testing sendgrid",
        text: `Welcome to the app ${name}. Hope you have a great experience.`
    })
}

const sendGoodbyeMail = (email, name) => {
    sgm.send({
        to: email,
        from: "shresthdewan@gmail.com",
        subject: "Goodbye!",
        text: `We're sorry to see you go ${name}. Let us know what you didn't like about the service.`
    })
}

module.exports = {
    sendWelcomeMail,
    sendGoodbyeMail
}