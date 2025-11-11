/**
 * @TEST:MCP-001
 * Test MCP Proxy Layer Architecture
 *
 * Given the MCP proxy layer is needed
 * When the proxy is initialized
 * Then it should handle MCP server connections and routing
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MCPProxy } from '../mcp/MCPProxy.js';

describe('@CODE:MCP-001 MCP Proxy Layer', () => {
  let mcpProxy;

  beforeEach(() => {
    // Reset environment and create fresh proxy instance
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
    mcpProxy = new MCPProxy();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      // Given MCP proxy is created
      // When proxy is initialized
      const proxy = new MCPProxy();

      // Then it should have proper configuration
      expect(proxy).toBeDefined();
      expect(proxy.config).toBeDefined();
      expect(proxy.config.timeout).toBe(30000); // 30 second timeout
      expect(proxy.config.maxRetries).toBe(3);
      expect(proxy.servers).toBeDefined();
      expect(proxy.servers.size).toBe(0);
    });

    it('should load MCP server configurations', () => {
      // Given MCP server configurations exist
      // When proxy loads configurations
      const serverConfigs = [
        {
          name: 'context7',
          endpoint: 'http://localhost:3001',
          capabilities: ['documentation', 'lookup']
        },
        {
          name: 'magic',
          endpoint: 'http://localhost:3002',
          capabilities: ['ui_generation', 'components']
        }
      ];

      const proxy = new MCPProxy({ servers: serverConfigs });

      // Then configurations should be loaded
      expect(proxy.servers.size).toBe(2);
      expect(proxy.servers.has('context7')).toBe(true);
      expect(proxy.servers.has('magic')).toBe(true);
    });
  });

  describe('Server Registration', () => {
    it('should register MCP servers successfully', async () => {
      // Given a new MCP server needs to be registered
      const serverConfig = {
        name: 'test-server',
        endpoint: 'http://localhost:3003',
        capabilities: ['test_capability']
      };

      // When server is registered
      const result = await mcpProxy.registerServer(serverConfig);

      // Then server should be registered successfully
      expect(result.success).toBe(true);
      expect(mcpProxy.servers.has('test-server')).toBe(true);
      expect(mcpProxy.servers.get('test-server').config).toEqual(serverConfig);
    });

    it('should handle duplicate server registration gracefully', async () => {
      // Given a server is already registered
      const serverConfig = {
        name: 'duplicate-server',
        endpoint: 'http://localhost:3004'
      };

      await mcpProxy.registerServer(serverConfig);

      // When the same server is registered again
      const result = await mcpProxy.registerServer(serverConfig);

      // Then it should handle gracefully
      expect(result.success).toBe(false);
      expect(result.error).toContain('already registered');
    });
  });

  describe('Request Routing', () => {
    beforeEach(async () => {
      // Setup test servers
      await mcpProxy.registerServer({
        name: 'context7',
        endpoint: 'http://localhost:3001',
        capabilities: ['documentation', 'lookup']
      });
    });

    it('should route requests to appropriate MCP server', async () => {
      // Given a request needs to be routed
      const request = {
        type: 'documentation_lookup',
        server: 'context7',
        payload: { query: 'React useEffect' }
      };

      // Mock the server communication
      const mockResponse = {
        result: 'useEffect documentation content',
        source: 'context7'
      };

      jest.spyOn(mcpProxy, 'sendToServer').mockResolvedValue(mockResponse);

      // When request is routed
      const response = await mcpProxy.routeRequest(request);

      // Then it should route correctly
      expect(response.success).toBe(true);
      expect(response.result).toEqual(mockResponse);
      expect(mcpProxy.sendToServer).toHaveBeenCalledWith('context7', request);
    });

    it('should handle server not found errors', async () => {
      // Given a request to non-existent server
      const request = {
        type: 'documentation_lookup',
        server: 'non-existent-server',
        payload: { query: 'React useEffect' }
      };

      // When request is routed
      const response = await mcpProxy.routeRequest(request);

      // Then it should handle error gracefully
      expect(response.success).toBe(false);
      expect(response.error).toContain('Server not found');
    });

    it('should implement timeout for requests', async () => {
      // Given a request that will timeout
      const request = {
        type: 'slow_operation',
        server: 'context7',
        payload: { timeout_test: true }
      };

      // Mock slow response
      jest.spyOn(mcpProxy, 'sendToServer').mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({}), 35000)) // 35 seconds
      );

      // When request is made
      const startTime = Date.now();
      const response = await mcpProxy.routeRequest(request);
      const endTime = Date.now();

      // Then it should timeout before completion
      expect(endTime - startTime).toBeLessThan(32000); // Allow some margin
      expect(response.success).toBe(false);
      expect(response.error).toContain('timeout');
    });
  });

  describe('Health Check', () => {
    it('should perform health check on all registered servers', async () => {
      // Given multiple servers are registered
      await mcpProxy.registerServer({
        name: 'server1',
        endpoint: 'http://localhost:3001'
      });
      await mcpProxy.registerServer({
        name: 'server2',
        endpoint: 'http://localhost:3002'
      });

      // Mock health check responses
      jest.spyOn(mcpProxy, 'checkServerHealth')
        .mockResolvedValueOnce({ status: 'healthy', responseTime: 50 })
        .mockResolvedValueOnce({ status: 'healthy', responseTime: 75 });

      // When health check is performed
      const healthReport = await mcpProxy.performHealthCheck();

      // Then all servers should be checked
      expect(healthReport.overall_status).toBe('healthy');
      expect(healthReport.servers).toHaveLength(2);
      expect(healthReport.servers[0].status).toBe('healthy');
      expect(healthReport.servers[1].status).toBe('healthy');
      expect(mcpProxy.checkServerHealth).toHaveBeenCalledTimes(2);
    });

    it('should handle unhealthy servers in health check', async () => {
      // Given a server is unhealthy
      await mcpProxy.registerServer({
        name: 'unhealthy-server',
        endpoint: 'http://localhost:3003'
      });

      // Mock unhealthy response
      jest.spyOn(mcpProxy, 'checkServerHealth')
        .mockResolvedValue({ status: 'unhealthy', error: 'Connection refused' });

      // When health check is performed
      const healthReport = await mcpProxy.performHealthCheck();

      // Then it should reflect unhealthy status
      expect(healthReport.overall_status).toBe('degraded');
      expect(healthReport.servers[0].status).toBe('unhealthy');
      expect(healthReport.servers[0].error).toBe('Connection refused');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Given network error occurs
      await mcpProxy.registerServer({
        name: 'network-error-server',
        endpoint: 'http://localhost:3004'
      });

      // Mock network error
      jest.spyOn(mcpProxy, 'sendToServer').mockRejectedValue(
        new Error('Network connection failed')
      );

      // When request is made
      const response = await mcpProxy.routeRequest({
        type: 'test_request',
        server: 'network-error-server',
        payload: {}
      });

      // Then error should be handled gracefully
      expect(response.success).toBe(false);
      expect(response.error).toContain('Network connection failed');
    });

    it('should implement retry logic for failed requests', async () => {
      // Given request fails initially
      await mcpProxy.registerServer({
        name: 'retry-server',
        endpoint: 'http://localhost:3005'
      });

      let callCount = 0;
      jest.spyOn(mcpProxy, 'sendToServer').mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ result: 'success after retries' });
      });

      // When request is made with retry logic
      const response = await mcpProxy.routeRequestWithRetry({
        type: 'test_request',
        server: 'retry-server',
        payload: {}
      }, { maxRetries: 3 });

      // Then it should retry and eventually succeed
      expect(response.success).toBe(true);
      expect(callCount).toBe(3);
    });
  });
});