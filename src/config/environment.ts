import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

/**
 * Environment Configuration Loader
 * Loads environment-specific configuration files based on NODE_ENV
 */
export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * Load environment configuration
   * Uses standard .env file pattern: .env.[environment]
   */
  public load(): void {
    if (this.isLoaded) {
      return;
    }

    const nodeEnv = process.env.NODE_ENV || 'development';

    // Load environment-specific .env file
    const envFile = `.env.${nodeEnv}`;
    const envPath = resolve(process.cwd(), envFile);

    if (existsSync(envPath)) {
      config({ path: envPath });
      console.log(`✅ Loaded environment config: ${envPath}`);
    } else {
      console.warn(`⚠️  Environment file not found: ${envPath}`);
      // Fallback to .env if exists
      const fallbackPath = resolve(process.cwd(), '.env');
      if (existsSync(fallbackPath)) {
        config({ path: fallbackPath });
        console.log(`✅ Loaded fallback config: ${fallbackPath}`);
      }
    }

    this.isLoaded = true;
    this.validateEnvironment();
  }

  /**
   * Validate required environment variables
   */
  private validateEnvironment(): void {
    const required = [
      'NODE_ENV',
      'PORT',
      'MONGODB_URI',
      'REDIS_URI',
      'JWT_SECRET',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing);
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`
      );
    }

    // Warn about default values in production
    if (process.env.NODE_ENV === 'production') {
      this.validateProductionSecrets();
    }

    console.log(
      `✅ Environment validation passed for: ${process.env.NODE_ENV}`
    );
  }

  /**
   * Validate production-specific configuration
   */
  private validateProductionSecrets(): void {
    const warnings: string[] = [];

    // Check for default/weak passwords
    const dangerousDefaults = [
      {
        key: 'JWT_SECRET',
        dangerous: ['CHANGE_ME', 'dev-jwt-secret', 'test-jwt-secret'],
      },
      {
        key: 'MONGO_PASSWORD',
        dangerous: ['CHANGE_ME', 'devpassword', 'testpassword', 'password'],
      },
      {
        key: 'REDIS_PASSWORD',
        dangerous: ['CHANGE_ME', 'devpassword', 'testpassword', 'password'],
      },
    ];

    dangerousDefaults.forEach(({ key, dangerous }) => {
      const value = process.env[key] || '';
      if (dangerous.some((d) => value.includes(d))) {
        warnings.push(`${key} appears to use a default/weak value`);
      }
    });

    // Check for development URLs in production
    const allowedOrigins = process.env.ALLOWED_ORIGINS || '';
    if (
      allowedOrigins.includes('localhost') ||
      allowedOrigins.includes('127.0.0.1')
    ) {
      warnings.push(
        'ALLOWED_ORIGINS contains localhost/127.0.0.1 in production'
      );
    }

    // Check if Swagger is enabled in production
    if (process.env.SWAGGER_UI_ENABLED === 'true') {
      warnings.push('SWAGGER_UI_ENABLED is true in production (security risk)');
    }

    if (warnings.length > 0) {
      console.warn('⚠️  Production Security Warnings:');
      warnings.forEach((warning) => console.warn(`   - ${warning}`));
      console.warn('   Please update these configurations for production!');
    }
  }

  /**
   * Get configuration for current environment
   */
  public getConfig() {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: parseInt(process.env.PORT || '5000', 10),
      mongodb: {
        uri: process.env.MONGODB_URI!,
        username: process.env.MONGO_USERNAME,
        password: process.env.MONGO_PASSWORD,
        database: process.env.MONGO_DB,
      },
      redis: {
        uri: process.env.REDIS_URI!,
        password: process.env.REDIS_PASSWORD,
      },
      jwt: {
        secret: process.env.JWT_SECRET!,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
      cors: {
        origins: process.env.ALLOWED_ORIGINS?.split(',') || [
          'http://localhost:3000',
        ],
      },
      swagger: {
        enabled: process.env.SWAGGER_UI_ENABLED === 'true',
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
      },
      rateLimiting: {
        submissionsPerMinute: parseInt(
          process.env.MAX_SUBMISSIONS_PER_MINUTE || '10',
          10
        ),
        submissionsPerHour: parseInt(
          process.env.MAX_SUBMISSIONS_PER_HOUR || '100',
          10
        ),
        submissionsPerDay: parseInt(
          process.env.MAX_SUBMISSIONS_PER_DAY || '500',
          10
        ),
      },
      executor: {
        timeoutMs: parseInt(process.env.EXECUTOR_TIMEOUT_MS || '30000', 10),
        memoryLimitMb: parseInt(
          process.env.EXECUTOR_MEMORY_LIMIT_MB || '128',
          10
        ),
        cpuLimit: parseFloat(process.env.EXECUTOR_CPU_LIMIT || '0.5'),
      },
    };
  }
}

// Export singleton instance
export const environmentConfig = EnvironmentConfig.getInstance();
