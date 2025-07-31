const express = require('express');
const connectDB = require('./config/db');
const userRoute = require('./routes/userRoute');
const cafeRoute = require('./routes/cafeRoute');
const speedTestRoute = require('./routes/speedTestRoute');
// Enhanced routes
const userRouteEnhanced = require('./routes/userRouteEnhanced');
const cafeRouteEnhanced = require('./routes/cafeRouteEnhanced');
const { securityHeaders } = require('./middleware/authEnhanced');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: [process.env.CORS_ORIGIN, "http://localhost:5173", "http://localhost:3000"].filter(Boolean),
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Security and middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP detection
app.set('trust proxy', 1);

// Error handling middleware for JSON parsing
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    next();
});

// Request logging middleware with more details
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${ip} - Agent: ${userAgent.substring(0, 50)}`);
    next();
});

// API Routes
app.use("/api", cafeRoute);
app.use("/api/users", userRoute);
app.use("/api/speedtest", speedTestRoute);

// Enhanced API Routes (v2)
app.use("/api/v2", cafeRouteEnhanced);
app.use("/api/v2/users", userRouteEnhanced);

// Root endpoint with comprehensive API documentation
app.get("/", (req, res) => {
  try {
    return res.status(200).json({
      message: "🚀 Slowest Café WiFi API is running...",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      features: [
        "Advanced café search with geolocation",
        "User rating and review system", 
        "WiFi speed testing",
        "User favorites and activity tracking",
        "Enhanced security and authentication",
        "Comprehensive analytics"
      ],
      endpoints: {
        v1: {
          cafes: "/api/cafes",
          users: "/api/users",
          speedtest: "/api/speedtest",
          health: "/health"
        },
        v2: {
          cafes: "/api/v2/cafes",
          advancedSearch: "/api/v2/cafes/advanced",
          users: "/api/v2/users",
          ratings: "/api/v2/cafes/rate",
          favorites: "/api/v2/users/favorites"
        }
      },
      documentation: "Visit /docs for detailed API documentation"
    });
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
});

// API Documentation endpoint
app.get("/docs", (req, res) => {
  res.status(200).json({
    title: "Slowest Café WiFi API Documentation",
    version: "2.0.0",
    description: "A comprehensive API for managing café locations with intentionally slow WiFi",
    baseUrl: `http://localhost:${PORT}`,
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer <token>",
      note: "Required for protected endpoints"
    },
    endpoints: {
      cafes: {
        "GET /api/cafes": "Get all cafes with basic filtering",
        "GET /api/v2/cafes/advanced": "Advanced search with geolocation and filters",
        "GET /api/cafes/:id": "Get specific cafe details",
        "POST /api/cafes": "Add new cafe (authenticated)",
        "PUT /api/cafes": "Update cafe (authenticated)",
        "DELETE /api/cafes": "Delete cafe (authenticated)"
      },
      users: {
        "POST /api/users/signup": "Create new user account",
        "POST /api/users/login": "User authentication",
        "GET /api/v2/users/profile": "Get user profile (authenticated)",
        "PUT /api/v2/users/profile": "Update profile (authenticated)",
        "GET /api/v2/users/favorites": "Get user favorites (authenticated)"
      },
      features: {
        "POST /api/v2/cafes/rate": "Rate and review a cafe",
        "POST /api/v2/cafes/speed-test": "Submit WiFi speed test results",
        "GET /api/cafes/stats": "Get comprehensive statistics"
      }
    },
    examples: {
      searchNearby: `/api/v2/cafes/advanced?latitude=40.7128&longitude=-74.0060&radius=5`,
      filterBySpeed: `/api/v2/cafes/advanced?wifiSpeedMax=5&sortBy=wifiSpeed.download`,
      rateLimit: "100 requests per 15 minutes per IP"
    }
  });
});

// Enhanced health check
app.get("/health", async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Basic performance metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      database: {
        status: dbStatus,
        host: mongoose.connection.host
      },
      performance: {
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
        }
      },
      features: {
        geolocation: true,
        ratings: true,
        speedTesting: true,
        favorites: true,
        analytics: true
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

const FastSpeedtest = require("fast-speedtest-api");

// Speed test functionality - moved to endpoint to avoid blocking server startup
const performSpeedTest = async () => {
    try {
        if (!process.env.SPEEDTEST_TOKEN) {
            // Return simulated results if no token configured
            return {
                download: Math.round((Math.random() * 10 + 1) * 100) / 100,
                upload: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
                ping: Math.round(Math.random() * 50 + 10),
                jitter: Math.round(Math.random() * 10 + 1),
                timestamp: new Date().toISOString(),
                simulated: true
            };
        }
        
        const speedtest = new FastSpeedtest({
            token: process.env.SPEEDTEST_TOKEN,
            verbose: false,
            timeout: 10000,
            https: true,
            urlCount: 3,
            bufferSize: 8,
            unit: FastSpeedtest.UNITS.Mbps
        });
        
        const speed = await speedtest.getSpeed();
        return {
            download: speed,
            upload: Math.round((speed * 0.3 + Math.random() * 2) * 100) / 100, // Estimate upload
            ping: Math.round(Math.random() * 50 + 10), // Simulate ping
            jitter: Math.round(Math.random() * 10 + 1), // Simulate jitter
            timestamp: new Date().toISOString(),
            simulated: false
        };
    } catch (error) {
        console.error('Speed test error:', error.message);
        // Fallback to simulated results
        return {
            download: Math.round((Math.random() * 10 + 1) * 100) / 100,
            upload: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
            ping: Math.round(Math.random() * 50 + 10),
            jitter: Math.round(Math.random() * 10 + 1),
            timestamp: new Date().toISOString(),
            simulated: true
        };
    }
};

// Add enhanced speed test endpoint
app.get("/api/speedtest/quick", async (req, res) => {
    try {
        const speed = await performSpeedTest();
        return res.status(200).json({ 
            message: "Speed test completed", 
            results: {
                download: speed.download,
                upload: speed.upload || Math.round((speed.download * 0.3 + Math.random() * 2) * 100) / 100,
                ping: speed.ping || Math.round(Math.random() * 50 + 10),
                jitter: speed.jitter || Math.round(Math.random() * 10 + 1),
                timestamp: speed.timestamp,
                simulated: speed.simulated
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            error: "Speed test failed", 
            details: error.message 
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
        timestamp: new Date().toISOString()
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

const startServer = async () => {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server is listening on http://localhost:${PORT}`);
            console.log(`📚 API Documentation available at http://localhost:${PORT}`);
            console.log(`🔍 Health check: http://localhost:${PORT}/health`);
        });
    } catch (err) {
        console.error("❌ Server failed to start!", err.message);
        process.exit(1);
    }
};

startServer();
