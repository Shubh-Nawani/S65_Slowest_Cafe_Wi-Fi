const User = require('../models/userModel')

const Dashboard = async (req, res) => {
    try {
        const {email, password} = req.body

        const existingUser = await User.findOne({email})

        if (!existingUser) {
            return res.status(400).send("User does not exist!")
        }

        return res.status(200).send(`Welcome ${email}`)

    } catch (err) {
        return res.status(500).send(err.message)
    }

}


module.exports = Dashboard