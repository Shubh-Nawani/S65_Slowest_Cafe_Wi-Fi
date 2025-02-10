const User = require('../models/userModel')
const bcrypt = require('bcrypt')



const signup = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({email})
        if (user) {
            return res.status(400).send("User Already Exists")
        } 
        
        const hash = bcrypt.hashSync(password, 10)

        const newUser = new User ({
            email,
            password: hash
        })

        await newUser.save()
        return res.status(201).send("User Created Successfully")



    } catch (err) {
        return res.status(500).send("Server Error")
    }

}

const signin = async (req, res) => {
    try {
        const { email, password } = req.body
        const existingUser = await User.findOne({email})
        if (!existingUser) {
            return res.status(400).send("User Not Found!")
        }
        const isMatch = await bcrypt.compare(password, existingUser.password)

        if (!isMatch) {
            return res.status(400).send("Invalid Credentials")
        }

        return res.status(200).send("Login Successfull")

    } catch (err) {
        return res.status(500).send("Server Error")
    }

}


module.exports = {signup, signin} 