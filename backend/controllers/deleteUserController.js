const User = require('../models/userModel')

const Delete = async (req, res) => {
    try {
        const {email, password} = req.body

        const existingUser = await User.findOneAndDelete({email})

        if (!existingUser) {
            return res.status(400).send("User does not exist!")
        }

        return res.status(200).send(`User deleted ${email}`)

    } catch (err) {
        return res.status(500).send(err.message)
    }

}


module.exports = Delete