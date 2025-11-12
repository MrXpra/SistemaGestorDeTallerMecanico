/**
 * @file logOptimization.test.js
 * @description Tests para optimización y limpieza de logs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import LogService from '../../services/logService';

// Mock de mongoose
vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(true),
    connection: {
      db: {}
    }
  }
}));

describe('Log Optimization - Unit Tests', () => {
  describe('shouldLogInProduction', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production');
    });

    it('should not log info user actions in production', () => {
      const result = LogService.shouldLogInProduction('info', 'user_action');
      expect(result).toBe(false);
    });

    it('should log warnings in production', () => {
      const result = LogService.shouldLogInProduction('warning', 'user_action');
      expect(result).toBe(true);
    });

    it('should log errors in production', () => {
      const result = LogService.shouldLogInProduction('error', 'user_action');
      expect(result).toBe(true);
    });

    it('should log critical events in production', () => {
      const result = LogService.shouldLogInProduction('critical', 'user_action');
      expect(result).toBe(true);
    });

    it('should log security events in production', () => {
      const result = LogService.shouldLogInProduction('info', 'security');
      expect(result).toBe(true);
    });

    it('should log system actions in production', () => {
      const result = LogService.shouldLogInProduction('info', 'system_action');
      expect(result).toBe(true);
    });

    it('should log critical operations in production', () => {
      const result = LogService.shouldLogInProduction('info', 'critical_operation');
      expect(result).toBe(true);
    });
  });

  describe('shouldLogInProduction - Development', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
    });

    it('should log everything in development', () => {
      expect(LogService.shouldLogInProduction('info', 'user_action')).toBe(true);
      expect(LogService.shouldLogInProduction('debug', 'user_action')).toBe(true);
      expect(LogService.shouldLogInProduction('warning', 'user_action')).toBe(true);
    });
  });

  describe('LOG_RETENTION configuration', () => {
    it('should have production retention policy', () => {
      const retention = LogService.LOG_RETENTION.production;
      
      expect(retention.info).toBe(7);
      expect(retention.warning).toBe(30);
      expect(retention.error).toBe(90);
      expect(retention.critical).toBe(180);
    });

    it('should have development retention policy', () => {
      const retention = LogService.LOG_RETENTION.development;
      
      expect(retention.info).toBe(3);
      expect(retention.warning).toBe(7);
      expect(retention.error).toBe(30);
      expect(retention.critical).toBe(90);
    });
  });

  describe('Performance thresholds', () => {
    it('should have defined performance thresholds', () => {
      expect(LogService.PERFORMANCE_THRESHOLDS.database).toBe(100);
      expect(LogService.PERFORMANCE_THRESHOLDS.api).toBe(1000);
      expect(LogService.PERFORMANCE_THRESHOLDS.operation).toBe(500);
    });
  });
});
