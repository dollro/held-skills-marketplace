# Deployment Pipeline

## Infrastructure as Code
```yaml
# Terraform example
resource "aws_ecs_service" "api" {
  name            = "api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 3

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }
}
```

## CI/CD Pipeline Configuration
```yaml
# GitHub Actions example
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-def.json
          service: api-service
          cluster: production
```

## Database Migration Automation
```typescript
// Prisma migration workflow
// 1. Create migration: npx prisma migrate dev --name add_user_roles
// 2. Apply in CI: npx prisma migrate deploy

// Migration safety checks
// - Always make additive changes first
// - Never drop columns in production without deprecation period
// - Use transactions for data migrations
```

## Feature Flag Implementation
```typescript
interface FeatureFlags {
  newCheckoutFlow: boolean;
  experimentalSearch: boolean;
  darkMode: boolean;
}

const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const { flags } = useContext(FeatureFlagContext);
  return flags[flag] ?? false;
};

// Usage
const CheckoutButton = () => {
  const useNewFlow = useFeatureFlag('newCheckoutFlow');
  return useNewFlow ? <NewCheckout /> : <LegacyCheckout />;
};
```

## Blue-Green Deployment
```
[Load Balancer]
      |
      v
[Blue (Current)] ← Active traffic
[Green (New)]    ← Staged, tested
      |
      v
[Switch traffic to Green]
[Keep Blue as rollback]
```

## Rollback Procedures
1. **Automated rollback**: If health checks fail, revert automatically
2. **Database rollback**: Keep migrations reversible
3. **Feature flag rollback**: Disable flags remotely
4. **Version rollback**: Deploy previous container image

## Monitoring Integration
```typescript
// OpenTelemetry setup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'api-service',
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

// Custom metrics
import { metrics } from '@opentelemetry/api';
const meter = metrics.getMeter('api');
const requestCounter = meter.createCounter('http_requests_total');

app.use((req, res, next) => {
  requestCounter.add(1, { method: req.method, path: req.path });
  next();
});
```

## Performance Optimization

### Database Query Optimization
```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;

-- Add appropriate indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

### API Response Time
- Use database connection pooling
- Implement response caching (Redis)
- Enable gzip compression
- Use pagination for large datasets
- Return only needed fields (sparse fieldsets)

### Frontend Bundle Optimization
```javascript
// Dynamic imports for code splitting
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

// Tree shaking - import only what you need
import { debounce } from 'lodash-es'; // Not: import _ from 'lodash'

// Analyze bundle
// npx webpack-bundle-analyzer stats.json
```

### Image and Asset Optimization
- Use modern formats (WebP, AVIF)
- Implement responsive images with srcset
- Lazy load below-the-fold images
- Use CDN for static assets
- Enable browser caching with proper headers

### Lazy Loading Implementation
```typescript
// React lazy loading
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Intersection Observer for data fetching
const useIntersectionObserver = (ref, callback) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, callback]);
};
```

### SSR Decisions
| Scenario | Recommendation |
|-|-|
| SEO-critical pages | SSR or Static |
| User dashboards | Client-side |
| Marketing pages | Static generation |
| Real-time data | Client-side + hydration |
| Auth-protected | Client-side |

### Cache Invalidation Patterns
```typescript
// Cache-aside pattern
const getUser = async (userId: string) => {
  const cached = await cache.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);

  const user = await db.users.findById(userId);
  await cache.setex(`user:${userId}`, 3600, JSON.stringify(user));
  return user;
};

// Write-through invalidation
const updateUser = async (userId: string, data: UserData) => {
  const user = await db.users.update(userId, data);
  await cache.del(`user:${userId}`);
  return user;
};
```

## Integration Patterns

### API Client Generation
```typescript
// OpenAPI Generator
// npx openapi-generator-cli generate -i api.yaml -g typescript-fetch -o ./client

// Type-safe client usage
import { OrdersApi, Configuration } from './client';

const api = new OrdersApi(new Configuration({
  basePath: process.env.API_URL,
  accessToken: () => getAccessToken(),
}));

const orders = await api.getOrders({ status: 'pending' });
```

### Error Boundary Implementation
```typescript
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorReportingService.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Loading State Management
```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

const useAsyncData = <T>(fetcher: () => Promise<T>): AsyncState<T> => {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });

  useEffect(() => {
    setState({ status: 'loading' });
    fetcher()
      .then(data => setState({ status: 'success', data }))
      .catch(error => setState({ status: 'error', error }));
  }, [fetcher]);

  return state;
};
```

### Optimistic Update Handling
```typescript
const useOptimisticUpdate = <T>(
  mutationFn: (data: T) => Promise<T>,
  onSuccess: (data: T) => void,
  onError: (error: Error, rollback: T) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (newData: T, previousData: T) => {
    setIsLoading(true);
    onSuccess(newData); // Optimistic update

    try {
      const result = await mutationFn(newData);
      onSuccess(result); // Confirm with server data
    } catch (error) {
      onError(error as Error, previousData); // Rollback
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
};
```

### Offline Capability
```typescript
// Service Worker for offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open('v1').then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      }).catch(() => caches.match('/offline.html'));
    })
  );
});
```
