const express = require('express');
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoute')
const app = express();
require('dotenv').config()

app.use(express.json())



app.use("/api/users", userRoute)

app.get('/', (req, res) => {
  try {
    return res.status(200).send("Backend is running...")
  } catch (err) {
    return res.status(500).send("Internal Server Error")
  }
})



// app.use((req, res, next) => {
//   res.status(404).send('Sorry, we could not find that!');
// });

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  try {
    connectDB()
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("Server failed to start!", err.message)
  }
  
});
