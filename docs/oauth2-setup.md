# OAuth2 Login Setup Guide

This document explains how to configure OAuth2 login for GitHub and Google providers.

## Backend Configuration

### 1. GitHub OAuth App Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the form:
   - Application name: `Synapse (Development)`
   - Homepage URL: `http://localhost:8080`
   - Authorization callback URL: `http://localhost:8080/login/oauth2/code/github`
4. Copy the Client ID and generate a Client Secret

### 2. Google OAuth Client Setup

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Navigate to APIs & Services > Credentials
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure consent screen if required
6. Application type: Web application
7. Authorized redirect URIs: `http://localhost:8080/login/oauth2/code/google`
8. Copy the Client ID and Client Secret

### 3. Environment Variables

Add to `server/src/main/resources/application.properties` or set as environment variables:

```properties
spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET}
spring.security.oauth2.client.registration.github.scope=read:user,user:email
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=profile,email
```

Or export in shell:
```bash
export GITHUB_CLIENT_ID=your_github_client_id
export GITHUB_CLIENT_SECRET=your_github_client_secret
export GOOGLE_CLIENT_ID=your_google_client_id
export GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Smart Merge Behavior

The OAuth2 login system implements smart account merging:

1. **New User**: If email not found, creates new account with OAuth provider
2. **Local Account Link**: If email exists with LOCAL provider, links OAuth to the account
3. **OAuth Login**: If email exists with same OAuth provider, normal login
4. **Provider Conflict**: If email exists with different OAuth provider, returns error

## Frontend Usage

### Login with OAuth

```typescript
import { useAuth } from "@/hooks/useAuth";

function LoginPage() {
  const { loginWithGitHub, loginWithGoogle } = useAuth();

  return (
    <>
      <button onClick={loginWithGitHub}>Continue with GitHub</button>
      <button onClick={loginWithGoogle}>Continue with Google</button>
    </>
  );
}
```

## Testing

### Backend Tests
```bash
cd server
./mvnw test -Dtest=OAuth2UserServiceTest
./mvnw test -Dtest=SecurityConfigTest
```

### Frontend Tests
```bash
cd client
bun run test useAuth.test.tsx
bun run test OAuthButton.test.tsx
bun run test LoginForm.test.tsx
bun run test RegisterForm.test.tsx
bun run test login.test.tsx
```
