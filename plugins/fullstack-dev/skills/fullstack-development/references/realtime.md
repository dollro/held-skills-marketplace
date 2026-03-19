# Real-Time Implementation

## WebSocket Server Configuration
```typescript
import { WebSocketServer } from 'ws';
import { verifyToken } from './auth';

const wss = new WebSocketServer({
  server: httpServer,
  verifyClient: async (info, callback) => {
    const token = info.req.headers['sec-websocket-protocol'];
    const user = await verifyToken(token);
    if (user) {
      info.req.user = user;
      callback(true);
    } else {
      callback(false, 401, 'Unauthorized');
    }
  }
});

// Connection handling with heartbeat
wss.on('connection', (ws, req) => {
  ws.isAlive = true;
  ws.userId = req.user.id;

  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', (data) => handleMessage(ws, data));
});

// Heartbeat interval
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
```

## Event-Driven Architecture
```typescript
// Event bus pattern
class EventBus {
  private handlers = new Map<string, Set<Function>>();

  subscribe(event: string, handler: Function) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);
    return () => this.handlers.get(event).delete(handler);
  }

  publish(event: string, payload: any) {
    this.handlers.get(event)?.forEach(handler => handler(payload));
  }
}
```

## Presence System
```typescript
interface PresenceState {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  activeRoom?: string;
}

// Track presence with Redis
const updatePresence = async (userId: string, status: string) => {
  await redis.hset(`presence:${userId}`, {
    status,
    lastSeen: Date.now()
  });
  await redis.expire(`presence:${userId}`, 300); // 5 min TTL

  // Broadcast to subscribers
  pubsub.publish('presence-update', { userId, status });
};
```

## Conflict Resolution Strategies
- **Last-Write-Wins (LWW)**: Simple, good for low-conflict scenarios
- **Operational Transformation (OT)**: For collaborative editing
- **CRDTs**: For distributed systems needing eventual consistency
- **Application-Level Merge**: Custom logic based on domain rules
