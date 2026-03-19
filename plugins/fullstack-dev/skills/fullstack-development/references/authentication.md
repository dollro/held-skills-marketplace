# Cross-Stack Authentication

## Session-Based Authentication
```typescript
// Backend: Express session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: new RedisStore({ client: redisClient })
}));
```

## JWT Implementation
```typescript
// Token structure
interface TokenPayload {
  userId: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

// Access token: short-lived (15 min)
// Refresh token: longer-lived (7 days), stored in httpOnly cookie
```

## SSO Integration
- SAML 2.0 for enterprise integrations
- OAuth 2.0 / OpenID Connect for consumer apps
- Handle token exchange and session bridging

## Role-Based Access Control (RBAC)
```typescript
// Permission matrix
const permissions = {
  admin: ['read', 'write', 'delete', 'manage'],
  editor: ['read', 'write'],
  viewer: ['read']
};

// Middleware pattern
const requirePermission = (permission: string) => (req, res, next) => {
  if (!req.user.permissions.includes(permission)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

## Frontend Route Protection
```typescript
// React Router protection
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

## Database Row-Level Security
```sql
-- PostgreSQL RLS example
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_access ON documents
  FOR ALL
  USING (
    owner_id = current_user_id()
    OR EXISTS (
      SELECT 1 FROM document_shares
      WHERE document_id = documents.id
      AND user_id = current_user_id()
    )
  );
```
