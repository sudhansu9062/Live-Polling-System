// API endpoint for health check
export default function handler(req, res) {
  res.status(200).json({
    message: 'Live Polling System API is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
}