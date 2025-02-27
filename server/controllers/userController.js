const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
        return res.status(200).send(users)
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({error: "Please provide an email!"})
        }
        if (!password) {
            return res.status(400).json({error: "Please provide a password!"})
        }
        
        const user = await User.findOne({email});
        if (user) {
            return res.status(400).json({error: "User Already Exists!"});
        } 
        
        const hash = bcrypt.hashSync(password, 10);

        const newUser = new User ({
            email,
            password: hash
        });

        await newUser.save();
        return res.status(200).json({messsage: "User Created successfully!"});



    } catch (err) {
        return res.status(500).json({error: err.message})
    }

};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({error: "Please provide an email!"})
        }
        if (!password) {
            return res.status(400).json({error: "Please provide a password!"})
        }
        const existingUser = await User.findOne({email});

        if (!existingUser) {
            return res.status(400).json({error: "User Not Found!"});
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return res.status(400).json({error: "Invalid Credentials!"});
        }

        return res.status(200).json({message: "Login Successfull!"});

    } catch (err) {
        return res.status(500).json({error: err.message});
    }

};


module.exports = {getUsers, signup, login};