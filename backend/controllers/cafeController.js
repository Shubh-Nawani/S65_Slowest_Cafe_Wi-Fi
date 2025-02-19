const Cafe = require('../models/cafeModel')

const addCafe = async (req, res) => {
    try {
        const {name, address, contact} = req.body
        
        const newCafe = new Cafe({
            name,
            address,
            contact
        })

        await newCafe.save()
        return res.status(201).json({message: "Cafe added successfully"})

    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}


module.exports = {addCafe}