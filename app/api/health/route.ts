import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'projects.json');

export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: {
        platform: process.platform,
        nodeVersion: process.version,
        cwd: process.cwd(),
        uptime: process.uptime()
      },
      database: {
        path: dbPath,
        exists: false,
        readable: false,
        writable: false,
        size: 0,
        projectCount: 0
      },
      checks: [] as Array<{ name: string; status: string; message?: string }>
    };

    // Check database file existence
    try {
      const stats = await fs.stat(dbPath);
      health.database.exists = true;
      health.database.size = stats.size;
      health.checks.push({ name: 'database_exists', status: 'pass' });
    } catch {
      health.checks.push({ name: 'database_exists', status: 'fail', message: 'Database file does not exist' });
    }

    // Check read permissions
    try {
      await fs.access(dbPath, fs.constants.R_OK);
      health.database.readable = true;
      health.checks.push({ name: 'database_readable', status: 'pass' });
    } catch {
      health.checks.push({ name: 'database_readable', status: 'fail', message: 'Cannot read database file' });
    }

    // Check write permissions
    try {
      await fs.access(dbPath, fs.constants.W_OK);
      health.database.writable = true;
      health.checks.push({ name: 'database_writable', status: 'pass' });
    } catch {
      health.checks.push({ name: 'database_writable', status: 'fail', message: 'Cannot write to database file' });
    }

    // Check database content if readable
    if (health.database.readable) {
      try {
        const data = await fs.readFile(dbPath, 'utf-8');
        const projects = JSON.parse(data);
        health.database.projectCount = projects.length;
        health.checks.push({ name: 'database_content', status: 'pass', message: `${projects.length} projects` });
      } catch (error) {
        health.checks.push({ name: 'database_content', status: 'fail', message: 'Invalid JSON or read error' });
      }
    }

    // Test write operation
    if (health.database.writable) {
      try {
        const testFile = `${dbPath}.health_test_${Date.now()}`;
        await fs.writeFile(testFile, 'test', 'utf-8');
        await fs.unlink(testFile);
        health.checks.push({ name: 'write_operation', status: 'pass' });
      } catch {
        health.checks.push({ name: 'write_operation', status: 'fail', message: 'Cannot perform write operation' });
      }
    }

    // Determine overall health
    const failedChecks = health.checks.filter(check => check.status === 'fail');
    if (failedChecks.length > 0) {
      health.status = 'degraded';
    }

    return NextResponse.json(health, { 
      status: health.status === 'healthy' ? 200 : 503 
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      server: {
        platform: process.platform,
        nodeVersion: process.version,
        cwd: process.cwd()
      }
    }, { status: 500 });
  }
} 