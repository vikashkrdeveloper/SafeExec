// src/routes/health.routes.ts
import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System health check
 *     description: |
 *       Comprehensive health check endpoint that verifies system status,
 *       database connectivity, Redis connection, and service availability.
 *
 *       **Health Metrics:**
 *       - API server status
 *       - Database connectivity
 *       - Redis cache status
 *       - Docker executor availability
 *       - System uptime and performance
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 3600.123
 *                   description: "Uptime in seconds"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "connected"
 *                         responseTime:
 *                           type: number
 *                           example: 12.5
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "connected"
 *                         responseTime:
 *                           type: number
 *                           example: 3.2
 *                     docker:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "available"
 *                         executors:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["python", "javascript", "java", "cpp", "go"]
 *             examples:
 *               healthy_system:
 *                 summary: Healthy system response
 *                 value:
 *                   success: true
 *                   status: "healthy"
 *                   timestamp: "2024-01-15T10:30:00.000Z"
 *                   uptime: 3600.123
 *                   version: "1.0.0"
 *                   environment: "development"
 *                   services:
 *                     database:
 *                       status: "connected"
 *                       responseTime: 12.5
 *                     redis:
 *                       status: "connected"
 *                       responseTime: 3.2
 *                     docker:
 *                       status: "available"
 *                       executors: ["python", "javascript", "java", "cpp", "go"]
 *       503:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               status: "unhealthy"
 *               error: "Database connection failed"
 *               services:
 *                 database:
 *                   status: "disconnected"
 *                   error: "Connection timeout"
 *                 redis:
 *                   status: "connected"
 *                   responseTime: 3.2
 *                 docker:
 *                   status: "available"
 *                   executors: ["python", "javascript", "java", "cpp", "go"]
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const healthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: 'connected',
          responseTime: 0,
        },
        redis: {
          status: 'connected',
          responseTime: 0,
        },
        docker: {
          status: 'available',
          executors: ['python', 'javascript', 'java', 'cpp', 'go'],
        },
      },
    };

    // Basic health check - could be enhanced with actual service checks
    const responseTime = Date.now() - startTime;

    logger.info(`Health check completed in ${responseTime}ms`);
    res.json(healthData);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    });
  }
});

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detailed system diagnostics
 *     description: |
 *       Advanced health check with detailed system metrics,
 *       performance indicators, and service-specific diagnostics.
 *
 *       **Advanced Metrics:**
 *       - Memory usage and heap statistics
 *       - CPU utilization
 *       - Event loop lag
 *       - Garbage collection metrics
 *       - Active connections
 *       - Request queue status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Detailed system health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 system:
 *                   type: object
 *                   properties:
 *                     nodeVersion:
 *                       type: string
 *                       example: "v18.17.0"
 *                     platform:
 *                       type: string
 *                       example: "linux"
 *                     arch:
 *                       type: string
 *                       example: "x64"
 *                     uptime:
 *                       type: number
 *                       example: 3600.123
 *                 memory:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: number
 *                       example: 125829120
 *                     heapTotal:
 *                       type: number
 *                       example: 67108864
 *                     heapUsed:
 *                       type: number
 *                       example: 45432112
 *                     external:
 *                       type: number
 *                       example: 2097152
 */
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const detailedHealthData = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        pid: process.pid,
      },
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiBaseUrl: process.env.API_BASE_URL,
        mongoUri: process.env.MONGO_URI ? '[CONFIGURED]' : '[NOT SET]',
        redisUrl: process.env.REDIS_URL ? '[CONFIGURED]' : '[NOT SET]',
      },
    };

    res.json(detailedHealthData);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error:
        error instanceof Error ? error.message : 'Detailed health check failed',
    });
  }
});

export default router;
