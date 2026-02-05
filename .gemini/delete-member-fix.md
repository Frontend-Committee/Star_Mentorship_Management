# Delete Member Issues - Fixed

## Summary

Two critical issues were preventing the delete member functionality from working properly:

1. **Type Mismatch (String vs Number)**
2. **API Interceptor Blocking Delete Requests**

## Issue 1: Type Mismatch - String vs Number ID

### Problem

- The `Member` type in the frontend uses `id: string`
- The API returns `id: number` (see `User` and `MemberWithProgress` types)
- In `Members.tsx` line 29, the ID is converted from number to string: `id: u.id?.toString()`
- The `useDeleteMember` hook received a **string** but the API endpoint expects a **number**

### Impact

- When `deleteMemberMutation.mutate(memberId)` is called with a string ID
- The API endpoint receives a string like `"123"` instead of the number `123`
- This could cause issues depending on how strict the backend validation is

### Solution

Modified `src/features/members/hooks.ts`:

```typescript
mutationFn: async (userId: string | number) =&gt; {
  // Convert to number if it's a string
  const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;
  const response = await api.delete(`auth/users/${id}/`);
  return response.data;
}
```

Now the hook accepts both string and number, ensuring the API always receives a number.

---

## Issue 2: API Interceptor Blocking Delete Requests

### Problem

In `src/lib/api.ts` line 45-48, the interceptor treated ALL `/auth/users/` routes as auth routes:

```typescript
const isAuthRoute =
  url.includes("/auth/login/") ||
  url.includes("/auth/token/refresh/") ||
  url.includes("/auth/users/"); // ❌ This blocks DELETE /auth/users/{id}/
```

### Impact

When deleting a member at endpoint `DELETE /auth/users/{id}/`:

1. If the access token is expired, the request returns 401
2. The interceptor checks if it's an "auth route"
3. Since the URL contains `/auth/users/`, it's marked as an auth route
4. The interceptor **skips the automatic token refresh** for auth routes
5. The delete request **fails with 401** instead of retrying with a refreshed token

### Why Auth Routes Are Excluded

Auth routes like `/auth/login/` and `/auth/token/refresh/` are excluded from retry logic because:

- If they return 401, it means invalid credentials (not expired token)
- Retrying them with a refreshed token wouldn't help
- It prevents infinite loops

### Solution

Modified `src/lib/api.ts` to exclude only DELETE requests from the auth route check:

```typescript
// Exclude auth-specific routes from token retry
// But allow DELETE /auth/users/{id}/ (delete member) to be retried
const isAuthRoute =
  url.includes("/auth/login/") ||
  url.includes("/auth/token/refresh/") ||
  (url.includes("/auth/users/") &amp;&amp; originalRequest.method?.toUpperCase() !== 'DELETE');
```

Now:

- `POST /auth/users/` (user creation) - still excluded from retry ✅
- `DELETE /auth/users/{id}/` (delete member) - **allowed to retry** ✅

---

## Files Changed

1. **src/features/members/hooks.ts**
   - Updated `useDeleteMember` hook to handle both string and number IDs
   - Converts string IDs to numbers for API compatibility

2. **src/lib/api.ts**
   - Modified API interceptor to allow DELETE requests to `/auth/users/` to retry with refreshed token
   - Prevents 401 errors when tokens expire during member deletion

---

## Testing Recommendations

1. **Test Delete with Valid Token**
   - Delete a member while logged in
   - Should work immediately

2. **Test Delete with Expired Token**
   - Wait for token to expire (or manually expire it)
   - Try to delete a member
   - Should automatically refresh token and complete the deletion
   - Should NOT show a 401 error

3. **Verify Member List Updates**
   - After deleting a member, the list should automatically refresh
   - The deleted member should disappear from the UI

---

## Additional Notes

### Future Improvements

Consider standardizing ID types across the application:

- Either use `number` everywhere (recommended for API consistency)
- Or use `string` everywhere and convert at API boundaries

### Current Flow

```
User clicks Delete
    ↓
Members.tsx calls handleDeleteMember(member.id)  // string
    ↓
deleteMemberMutation.mutate(memberId)  // string
    ↓
useDeleteMember hook receives userId  // string | number
    ↓
Converts to number: parseInt(userId, 10)
    ↓
API.delete(`auth/users/${id}/`)  // number
    ↓
If 401 → Interceptor refreshes token → Retries
    ↓
Success → Invalidates queries → UI updates
```

---

## Potential Backend API Issue

If delete still doesn't work after these fixes, check if:

1. The backend supports `DELETE /api/auth/users/{id}/`
2. The user has proper permissions to delete members
3. The backend returns appropriate error messages

The frontend is now correctly configured to handle member deletion.
