import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import logger from './logger';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  userId?: string;
  operation?: string;
  [key: string]: unknown;
}

interface LogStats {
  total: number;
  byLevel: { [key: string]: number };
  recent: LogEntry[];
  errors: LogEntry[];
  topUsers?: Array<{ userId: string; count: number }>;
  topOperations?: Array<{ operation: string; count: number }>;
}

const logsDir = path.join(__dirname, '../../logs');

export const getLogsStats = async (): Promise<LogStats> => {
  try {
    const combinedLogPath = path.join(logsDir, 'combined.log');
    
    if (!fs.existsSync(combinedLogPath)) {
      return {
        total: 0,
        byLevel: {} as { [key: string]: number },
        recent: [] as LogEntry[],
        errors: [] as LogEntry[],
      };
    }

    const content = fs.readFileSync(combinedLogPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const logs: LogEntry[] = [];
    const byLevel: { [key: string]: number } = {};
    const errors: LogEntry[] = [];

    lines.forEach(line => {
      try {
        // Parse JSON logs
        const jsonMatch = line.match(/\{.*\}$/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          logs.push(parsed);
          byLevel[parsed.level] = (byLevel[parsed.level] || 0) + 1;
          
          if (parsed.level === 'error') {
            errors.push(parsed);
          }
        }
      } catch (e) {
        // Non-JSON logs, skip
      }
    });

    return {
      total: logs.length,
      byLevel,
      recent: logs.slice(-20).reverse(),
      errors: errors.slice(-10),
      topUsers: getTopUsers(logs),
      topOperations: getTopOperations(logs),
    };
  } catch (error) {
    logger.error('Error reading logs for dashboard', { error });
    return {
      total: 0,
      byLevel: {} as { [key: string]: number },
      recent: [] as LogEntry[],
      errors: [] as LogEntry[],
    };
  }
};

function getTopUsers(logs: LogEntry[]) {
  const users: { [key: string]: number } = {};
  logs.forEach(log => {
    const userId = log.userId;
    if (userId) {
      users[userId] = (users[userId] || 0) + 1;
    }
  });

  return Object.entries(users)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, count]) => ({ userId, count }));
}

function getTopOperations(logs: LogEntry[]) {
  const ops: { [key: string]: number } = {};
  logs.forEach(log => {
    const operation = log.operation || log.message;
    if (operation) {
      ops[operation] = (ops[operation] || 0) + 1;
    }
  });

  return Object.entries(ops)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([operation, count]) => ({ operation, count }));
}

export const dashboardHandler = async (req: Request, res: Response) => {
  const stats = await getLogsStats();
  
  // Generate HTML dashboard
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TaskPilot Monitoring Dashboard</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h2 { margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; }
        .card .value { font-size: 32px; font-weight: bold; color: #333; }
        .info-level { color: #4CAF50; }
        .warn-level { color: #FFC107; }
        .error-level { color: #f44336; }
        .debug-level { color: #2196F3; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 12px; }
        th { background: #f5f5f5; font-weight: 600; }
        .recent-logs { margin-top: 20px; }
        .log-entry { background: #f9f9f9; padding: 10px; margin: 5px 0; border-left: 4px solid #2196F3; border-radius: 4px; font-size: 12px; }
        .log-entry.error { border-left-color: #f44336; }
        .log-entry.warn { border-left-color: #FFC107; }
        .timestamp { color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📊 TaskPilot Monitoring Dashboard</h1>
        
        <div class="grid">
          <div class="card">
            <h2>Total Logs</h2>
            <div class="value">${stats.total}</div>
          </div>
          
          <div class="card">
            <h2>Info</h2>
            <div class="value info-level">${stats.byLevel.info || 0}</div>
          </div>
          
          <div class="card">
            <h2>Warnings</h2>
            <div class="value warn-level">${stats.byLevel.warn || 0}</div>
          </div>
          
          <div class="card">
            <h2>Errors</h2>
            <div class="value error-level">${stats.byLevel.error || 0}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h2>Top Users</h2>
            <table>
              <tr><th>User ID</th><th>Actions</th></tr>
              ${stats.topUsers?.map(u => `<tr><td>${u.userId.substring(0, 8)}...</td><td>${u.count}</td></tr>`).join('') || '<tr><td colspan="2">No data</td></tr>'}
            </table>
          </div>

          <div class="card">
            <h2>Top Operations</h2>
            <table>
              <tr><th>Operation</th><th>Count</th></tr>
              ${stats.topOperations?.map(o => `<tr><td>${o.operation}</td><td>${o.count}</td></tr>`).join('') || '<tr><td colspan="2">No data</td></tr>'}
            </table>
          </div>
        </div>

        <div class="card recent-logs">
          <h2>📋 Recent Activity</h2>
          ${stats.recent.map(log => `
            <div class="log-entry ${log.level}">
              <span class="timestamp">${log.timestamp}</span> 
              <strong>[${log.level.toUpperCase()}]</strong> 
              ${log.message}
              ${log.userId ? `(${log.userId.substring(0, 8)}...)` : ''}
            </div>
          `).join('') || '<p>No recent logs</p>'}
        </div>

        ${stats.errors.length > 0 ? `
          <div class="card">
            <h2>🚨 Recent Errors</h2>
            ${stats.errors.map(err => `
              <div class="log-entry error">
                <span class="timestamp">${err.timestamp}</span> 
                <strong>${err.message}</strong>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="text-align: center; color: #999; margin-top: 40px; font-size: 12px;">
          <p>Last updated: ${new Date().toLocaleString()}</p>
          <p>Refresh to see latest logs</p>
        </div>
      </div>
    </body>
    </html>
  `;

  res.type('text/html').send(html);
};
