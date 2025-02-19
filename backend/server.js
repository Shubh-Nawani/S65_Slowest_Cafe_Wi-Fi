const express = require('express');
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoute')
const shopRoute = require('./routes/shopRoute')
const app = express();
const cors = require('cors')
require('dotenv').config()

app.use(cors())

app.use(express.json())

app.use("/api", shopRoute)

app.use("/api/users", userRoute)

app.get('/', (req, res) => {
  try {
    return res.status(200).send("Backend is running...")
  } catch (err) {
    return res.status(500).send(err.message)
  }
})



const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  try {
    connectDB()
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("Server failed to start!", err.message)
  }
  
});
