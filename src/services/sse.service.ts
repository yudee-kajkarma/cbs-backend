import { Response } from 'express';

/**
 * SSE Client Interface
 */
interface SSEClient {
  id: string;
  response: Response;
  department?: string;
}

/**
 * SSE Service for Real-Time Attendance Updates
 * Manages Server-Sent Events connections for live attendance monitoring
 */
export class SSEService {
  private static clients: Map<string, SSEClient> = new Map();
  private static heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize SSE Service
   * Starts heartbeat mechanism to keep connections alive
   */
  static initialize(): void {
    if (!this.heartbeatInterval) {
      this.heartbeatInterval = setInterval(() => {
        this.sendHeartbeat();
      }, 30000); // Send heartbeat every 30 seconds
    }
  }

  /**
   * Add a new SSE client connection
   */
  static addClient(clientId: string, response: Response, department?: string): void {
    const client: SSEClient = {
      id: clientId,
      response,
      department,
    };

    this.clients.set(clientId, client);
    console.log(`SSE Client connected: ${clientId} (Total clients: ${this.clients.size})`);

    // Send initial connection confirmation
    this.sendToClient(clientId, 'connected', { 
      message: 'Connected to live attendance stream',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Remove SSE client connection
   */
  static removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      console.log(`SSE Client disconnected: ${clientId} (Total clients: ${this.clients.size})`);
    }
  }

  /**
   * Send event to a specific client
   */
  static sendToClient(clientId: string, event: string, data: any): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      return false;
    }

    try {
      client.response.write(`event: ${event}\n`);
      client.response.write(`data: ${JSON.stringify(data)}\n\n`);
      return true;
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
      this.removeClient(clientId);
      return false;
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  static broadcast(event: string, data: any, filterDepartment?: string): void {
    const clientsToNotify = Array.from(this.clients.values()).filter(client => {
      // If filterDepartment is specified, only send to clients interested in that department
      if (filterDepartment && client.department) {
        return client.department === filterDepartment;
      }
      return true;
    });

    clientsToNotify.forEach(client => {
      try {
        client.response.write(`event: ${event}\n`);
        client.response.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error(`Error broadcasting to client ${client.id}:`, error);
        this.removeClient(client.id);
      }
    });

    console.log(`Broadcast event '${event}' to ${clientsToNotify.length} clients`);
  }

  /**
   * Send heartbeat to all clients to keep connections alive
   */
  private static sendHeartbeat(): void {
    const timestamp = new Date().toISOString();
    this.clients.forEach((client, clientId) => {
      try {
        client.response.write(`: heartbeat ${timestamp}\n\n`);
      } catch (error) {
        console.error(`Heartbeat failed for client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    });
  }

  /**
   * Broadcast attendance check-in event
   */
  static broadcastCheckIn(data: {
    empId: string;
    name: string;
    department: string;
    checkInTime: string;
    timestamp: string;
  }): void {
    this.broadcast('check-in', data);
  }

  /**
   * Broadcast attendance check-out event
   */
  static broadcastCheckOut(data: {
    empId: string;
    name: string;
    department: string;
    checkOutTime: string;
    hoursWorked: number;
    timestamp: string;
  }): void {
    this.broadcast('check-out', data);
  }

  /**
   * Broadcast attendance summary update
   */
  static broadcastSummaryUpdate(data: {
    summary: {
      totalStaff: number;
      checkedIn: number;
      checkedOut: number;
      notMarked: number;
      onLeave: number;
      present: number;
      attendancePercent: number;
    };
    updatedRecord?: {
      empId: string;
      name: string;
      department?: string;
      position?: string;
      checkIn: string;
      checkOut: string;
      hoursWorked: number;
      status: string;
      salaryStatus: string;
      deductionAmount: number;
      salaryForDay: number;
    };
    timestamp: string;
  }): void {
    this.broadcast('summary-update', data);
  }

  /**
   * Get count of connected clients
   */
  static getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Cleanup all connections
   */
  static cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.clients.forEach((client, clientId) => {
      try {
        client.response.end();
      } catch (error) {
        console.error(`Error closing connection for client ${clientId}:`, error);
      }
    });

    this.clients.clear();
    console.log('SSE Service cleaned up');
  }
}
