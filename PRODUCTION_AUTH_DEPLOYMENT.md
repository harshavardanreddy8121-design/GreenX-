# Production Authentication Deployment Guide

## Overview
This guide covers the deployment of the production-ready JWT authentication system for GreenX. Two PRs are involved:
- **PR #11**: Backend JWT filter fix (Spring Boot)
- **PR #12**: Frontend auth system (React)

## Prerequisites
- Access to GitHub repository
- Access to Railway dashboard
- Access to Vercel dashboard (for frontend)
- Test user credentials for each role

## Merge Order

### Step 1: Merge PR #11 (Backend JWT Filter Fix)
1. Go to https://github.com/harshavardanreddy8121-design/GreenX-/pull/11
2. Review the changes (adds logging to JwtFilter)
3. Click "Merge pull request"
4. Confirm merge to main branch

**Why first?** The backend fix must be deployed before the frontend changes, so that when the frontend tries to authenticate, the backend properly logs and handles errors.

### Step 2: Merge PR #12 (Frontend Auth System)
1. Go to https://github.com/harshavardanreddy8121-design/GreenX-/pull/12
2. Review the changes (auth context, protected routes, error handling)
3. Click "Merge pull request"
4. Confirm merge to main branch

## Deployment Steps

### Backend Deployment (Spring Boot on Railway)
1. Go to Railway dashboard: https://railway.com/project/2c5cdc54-0bcc-4413-ac04-2b8f9091cd22
2. Select "Spring Boot Backend" service
3. Go to "Deployments" tab
4. Click "Deploy" button (or wait for auto-deploy if enabled)
5. Monitor the deployment:
   - Build should complete in ~2 minutes
   - Service should show "Online" status
   - Check logs for any errors

**Verify Backend is Ready:**
```bash
curl https://spring-boot-backend-production-13e6.up.railway.app/api/health
```
Expected response: `{"status":"UP",...}`

### Frontend Deployment (React on Vercel)
1. Go to Vercel dashboard
2. Select the GreenX project
3. The deployment should trigger automatically when PR #12 is merged
4. Monitor the deployment in Vercel
5. Once complete, the frontend will be updated

**Verify Frontend is Ready:**
- Visit your frontend URL
- You should see the login page
- Try to access any dashboard without logging in
- You should be redirected to login

## Testing Checklist

### Test 1: Login with Valid Credentials
**Steps:**
1. Go to login page
2. Select role: "Land Owner"
3. Enter email: `landowner@example.com`
4. Enter password: `password123`
5. Click "Login"

**Expected Result:**
- Loading spinner appears
- After 2-3 seconds, redirected to Land Owner dashboard
- Dashboard shows user info
- Page refresh keeps you logged in

**If it fails:**
- Check browser console for errors
- Check backend logs: `railway logs --service "Spring Boot Backend"`
- Verify JWT_SECRET is set in Railway environment variables

### Test 2: Login with Invalid Credentials
**Steps:**
1. Go to login page
2. Select role: "Land Owner"
3. Enter email: `wrong@example.com`
4. Enter password: `wrongpassword`
5. Click "Login"

**Expected Result:**
- Loading spinner appears
- Error message: "Invalid email or password. Please try again."
- User stays on login page
- Can try again

**If it fails:**
- Check that error message is displayed
- Verify backend is returning 401 for invalid credentials

### Test 3: Protected Routes
**Steps:**
1. Open browser DevTools → Application → Local Storage
2. Delete the `greenx_token` key
3. Try to access `/landowner` directly in URL
4. You should be redirected to `/login`

**Expected Result:**
- Redirected to login page
- Can log in and access dashboard

**If it fails:**
- Check ProtectedRoute component is wrapping all dashboard routes
- Verify AuthContext is properly checking authentication status

### Test 4: Role-Based Access Control
**Steps:**
1. Log in as "Land Owner"
2. Try to access `/admin` directly in URL
3. You should be redirected to home page

**Expected Result:**
- Redirected to home page (not admin dashboard)
- Cannot access admin-only routes

**If it fails:**
- Verify role normalization in AuthContext
- Check that ProtectedRoute is checking allowedRoles

### Test 5: Logout
**Steps:**
1. Log in as any user
2. Find logout button (usually in user menu)
3. Click logout
4. Try to access dashboard
5. Should be redirected to login

**Expected Result:**
- Token is cleared from localStorage
- Redirected to login page
- Cannot access protected routes

**If it fails:**
- Verify logout() function clears token
- Check that clearToken() removes from localStorage

### Test 6: Session Persistence
**Steps:**
1. Log in as any user
2. Refresh the page (Ctrl+R or Cmd+R)
3. You should still be logged in

**Expected Result:**
- Token is restored from localStorage
- User info is loaded from backend
- Dashboard is accessible without re-login

**If it fails:**
- Check that token is being saved to localStorage
- Verify refreshSession() is called on app mount
- Check backend /auth/me endpoint is working

### Test 7: Token Expiry (24 hours)
**Steps:**
1. Log in as any user
2. Wait 24 hours (or manually set token expiry in backend)
3. Try to access a protected endpoint
4. Should be redirected to login

**Expected Result:**
- Expired token is detected
- User is redirected to login
- Can log in again

**If it fails:**
- Verify JWT_EXPIRATION is set correctly (86400000 = 24 hours)
- Check that 401 responses trigger redirect to login

## Troubleshooting

### Issue: "Network error — please check your connection"
**Cause:** Frontend cannot reach backend
**Solution:**
1. Verify backend URL in `src/lib/api.ts` is correct
2. Check CORS is enabled in backend SecurityConfig
3. Verify backend is online: `railway logs --service "Spring Boot Backend"`

### Issue: "Invalid email or password" for correct credentials
**Cause:** User doesn't exist in database or password is wrong
**Solution:**
1. Verify user exists in database
2. Check password is correct
3. Verify password hashing is working in backend
4. Check backend logs for errors

### Issue: Redirected to login immediately after successful login
**Cause:** JwtFilter is not properly loading user details
**Solution:**
1. Check backend logs for "JwtFilter" messages
2. Verify user exists in database
3. Verify JWT token is being sent in Authorization header
4. Check that /auth/me endpoint is working

### Issue: Token not persisting across page reload
**Cause:** localStorage is not being used or is being cleared
**Solution:**
1. Check browser DevTools → Application → Local Storage
2. Verify `greenx_token` key exists after login
3. Check that setToken() is being called
4. Verify localStorage is not being cleared by browser settings

### Issue: Role-based access not working
**Cause:** Role normalization is failing
**Solution:**
1. Check backend is returning role in correct format
2. Verify normalizeRole() function handles all role formats
3. Check browser console for role normalization logs
4. Verify ProtectedRoute is checking allowedRoles correctly

## Rollback Plan

If something goes wrong, you can rollback:

### Rollback Backend
1. Go to Railway dashboard
2. Select "Spring Boot Backend"
3. Go to "Deployments" tab
4. Find the previous successful deployment
5. Click "Redeploy"

### Rollback Frontend
1. Go to Vercel dashboard
2. Go to "Deployments" tab
3. Find the previous successful deployment
4. Click "Redeploy"

### Rollback Code
1. Go to GitHub
2. Revert PR #12 (frontend)
3. Revert PR #11 (backend)
4. Redeploy both services

## Success Criteria

✅ All tests pass
✅ Users can log in with valid credentials
✅ Invalid credentials show error message
✅ Protected routes redirect to login
✅ Role-based access control works
✅ Session persists across page reload
✅ Logout clears session
✅ No console errors
✅ Backend logs show proper JWT handling

## Next Steps

After successful deployment:
1. Monitor logs for any errors
2. Test with real users
3. Gather feedback
4. Plan for token refresh implementation (optional)
5. Plan for password reset flow (optional)
6. Plan for 2FA implementation (optional)
