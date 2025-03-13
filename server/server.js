const express = require('express');
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoute');
const cafeRoute = require('./routes/cafeRoute');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  process.env.CORS_ORIGIN1,
  process.env.CORS_ORIGIN2,
  "http://localhost:5173"
];

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    // Check if the origin is in the allowed origins list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", cafeRoute);
app.use("/api/users", userRoute);

app.get("/", (req, res) => {
  try {
    return res.status(200).json({message: "Backend is running..."});
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
})

const FastSpeedtest = require("fast-speedtest-api");
 
app.get("/api/speedtest", async (req, res) => {
  try {
    let speedtest = new FastSpeedtest({
      token: process.env.SPEEDTEST_TOKEN, // required
      verbose: true,
      timeout: 5000,
      https: true,
      urlCount: 5,
      bufferSize: 8,
      unit: FastSpeedtest.UNITS.Mbps
    });

    const speed = await speedtest.getSpeed();
    return res.json({ speed: speed.toFixed(2) }); // Return speed in Mbps
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async() => {
  try {
    await connectDB();
    console.log(`Server is listening on http://localhost:${PORT}`);
  } catch (err) {
    console.error("Server failed to start!", err.message);
  }
  
});
