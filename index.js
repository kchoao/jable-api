const express = require('express');
const axios = require('axios');
const config = require('./config');
const { extractVideoInfo } = require('./lib/extractor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jable.tv Video Info API',
    version: '1.0.0',
    endpoints: {
      'GET /': 'API information',
      'GET /api/health': 'Health check',
      'GET /api/test-browserless': 'Test Browserless API key',
      'GET /api/video/:videoCode': 'Get video information'
    },
    examples: {
      video: '/api/video/pppe-356',
      test: '/api/test-browserless'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test Browserless API key endpoint
app.get('/api/test-browserless', async (req, res) => {
  try {
    const BROWSERLESS_API_KEY = config.browserless.apiKey;
    const BROWSERLESS_ENDPOINT = config.browserless.endpoint;
    
    if (!BROWSERLESS_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Browserless API key not configured',
        message: 'Please set BROWSERLESS_API_KEY environment variable'
      });
    }

    console.log('Testing Browserless API key...');
    
    // Try both authentication methods to see which one works
    console.log('API Key being used:', BROWSERLESS_API_KEY.substring(0, 8) + '...');
    
    const response = await axios.post(
      `${BROWSERLESS_ENDPOINT}/chromium/bql?token=${BROWSERLESS_API_KEY}`,
      {
        query: `
          mutation TestConnection {
            goto(url: "https://httpbin.org/json") {
              status
            }
            html(timeout: 10000) {
              html
            }
          }
        `
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.status === 200 && response.data.data) {
      const result = response.data.data;
      res.status(200).json({
        success: true,
        message: 'Browserless API key is valid',
        data: {
          status: result.goto?.status,
          htmlLength: result.html?.html?.length || 0
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Unexpected response from Browserless',
        data: response.data
      });
    }

  } catch (error) {
    console.error('Browserless test error:', error.message);
    
    if (error.response) {
      // API responded with error status
      const statusCode = error.response.status;
      const errorMessage = error.response.data;
      
      if (statusCode === 401) {
        return res.status(401).json({
          success: false,
          error: 'Invalid Browserless API key',
          message: 'Please check your BROWSERLESS_API_KEY environment variable',
          details: errorMessage
        });
      } else if (statusCode === 402) {
        return res.status(402).json({
          success: false,
          error: 'Browserless account limit exceeded',
          message: 'Your Browserless account has exceeded its usage limits',
          details: errorMessage
        });
      } else {
        return res.status(statusCode).json({
          success: false,
          error: `Browserless API error (${statusCode})`,
          details: errorMessage
        });
      }
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        success: false,
        error: 'Cannot connect to Browserless service',
        message: 'Network connectivity issue'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Get video information endpoint
app.get('/api/video/:videoCode', async (req, res) => {
  try {
    const { videoCode } = req.params;
    
    // Validate video code parameter
    if (!videoCode || typeof videoCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid video code',
        message: 'Video code must be a non-empty string'
      });
    }

    // Validate video code format (basic pattern matching)
    const videoCodePattern = /^[a-zA-Z]+-\d+$/;
    if (!videoCodePattern.test(videoCode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid video code format',
        message: 'Video code should match pattern: LETTERS-NUMBERS (e.g., pppe-356)',
        provided: videoCode
      });
    }

    console.log(`Processing video info request for: ${videoCode}`);
    
    const videoInfo = await extractVideoInfo(videoCode);
    
    if (!videoInfo) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
        message: `No information found for video code: ${videoCode}`
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      data: videoInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error processing video ${req.params.videoCode}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    });
  }
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /api/health', 
      'GET /api/test-browserless',
      'GET /api/video/:videoCode'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Jable API Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test Browserless: http://localhost:${PORT}/api/test-browserless`);
});