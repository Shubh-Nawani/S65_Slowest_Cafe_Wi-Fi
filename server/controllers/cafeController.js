const Cafe = require('../models/cafeModel');

const getCafe = async (req, res) => {
    try {
        const cafes = await Cafe.find();
        return res.status(200).send(cafes);

    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const addCafe = async (req, res) => {
    try {
        const {name, address, contact} = req.body;
        
        const newCafe = new Cafe({
            name,
            address,
            contact
        })

        await newCafe.save()
        return res.status(201).json({message: "Cafe added successfully"});

    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

const updateCafe = async (req, res) => {
    try {
        const {_id, name, address, contact} = req.body;
        
        const updatedCafe = await Cafe.findByIdAndUpdate(_id, req.body, {new: true});

        if (!updatedCafe) {
            return res.status(400).json({error: "Please check constraints!"});
        }

        return res.status(200).json({message: "Cafe Updated successfully!"});

    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}

const deleteCafe = async (req, res) => {
    try {
        const {_id} = req.body;

        const deletedCafe = await Cafe.findByIdAndDelete({_id});

        if (!deletedCafe) {
            return res.status(400).json({error: "Cafe ID Not Found!"})
        }

        return res.status(200).json({message: "Cafe Deleted Successfully!"})

    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

module.exports = {getCafe, addCafe, updateCafe, deleteCafe};