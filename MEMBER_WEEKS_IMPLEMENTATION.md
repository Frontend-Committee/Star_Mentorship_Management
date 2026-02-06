# Member Weeks Feature Implementation

## Overview

The Weeks page displays learning weeks with content items. For **member users**, it shows only the weeks and items that are **assigned to them**, along with their personal progress tracking.

## API Endpoint

```
GET /api/member/weeks/
```

### Authentication

- **Required**: JWT Bearer token in Authorization header
- **Permission**: All authenticated users

### Response Structure

```json
[
  {
    "id": 1,
    "title": "Week Title",
    "number": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-01-07",
    "items": [
      {
        "id": 1,
        "title": "Item Title",
        "notes": "Item notes/description",
        "resource": "https://resource-url.com",
        "week_progress": [
          {
            "id": 1,
            "is_finished": false,
            "notes": "User's progress notes",
            "user": {
              "id": 1,
              "first_name": "John",
              "last_name": "Doe",
              "email": "john@example.com"
            }
          }
        ]
      }
    ]
  }
]
```

## Implementation Details

### 1. Data Fetching (`src/features/weeks/hooks.ts`)

The `useWeeks` hook automatically switches between admin and member endpoints based on user role:

```typescript
export const useWeeks = (role?: string) => {
  return useQuery({
    queryKey: ["weeks", role],
    queryFn: async () => {
      const endpoint = role === "admin" ? "admin/weeks/" : "member/weeks/";
      const response = await api.get(endpoint);
      // ...
    },
  });
};
```

### 2. Data Display (`src/pages/Weeks.tsx`)

#### Member-Specific Features:

1. **Filtered Items**: Only shows items assigned to the authenticated member
2. **Personal Progress**: Displays the member's own progress for each item
3. **Completion Tracking**: Shows if items are finished based on `week_progress[].is_finished`
4. **Overall Progress**: Calculates completed weeks vs total weeks
5. **Locked Weeks**: Prevents access to later weeks until previous ones are completed

#### Key UI Elements for Members:

- **Progress Card** (Lines 177-202): Shows overall completion percentage
- **Week Completion Status** (Lines 71-77): Checks if all items in a week are finished
- **Item Progress Badge** (Lines 376-381): Shows "Finished" badge for completed items
- **Sequential Locking** (Line 207): Locks weeks until previous ones are completed

### 3. Types (`src/types/index.ts`)

#### MemberWeekDetail

```typescript
export interface MemberWeekDetail {
  end_date?: Date;
  id?: number;
  items?: MemberItem[];
  number?: number;
  start_date?: Date;
  title?: string;
}
```

#### MemberItem

```typescript
export interface MemberItem {
  id?: number;
  notes?: string;
  resource?: string;
  title?: string;
  week_progress?: MemberProgress[];
}
```

#### MemberProgress

```typescript
export interface MemberProgress {
  id?: number;
  is_finished?: boolean;
  notes?: null | string;
}
```

## Features for Members

### ✅ Currently Implemented

1. **Personal Progress Tracking**: View progress on assigned items
2. **Completion Status**: See which items are finished
3. **Sequential Learning**: Weeks are locked until previous weeks are completed
4. **Progress Dashboard**: Visual progress bar showing overall completion
5. **Resource Access**: Direct links to notes, slides, and other resources
6. **Item Categorization**: Visual distinction between slides, quizzes, and notes

### 🔄 Progress Tracking Workflow

1. Member logs in and navigates to Weeks page
2. System fetches only weeks/items assigned to that member
3. Progress is displayed for each item based on `week_progress.is_finished`
4. Member can mark items/weeks as complete
5. Completion unlocks the next week in sequence

## Data Flow

```
User Login → JWT Token → GET /api/member/weeks/
                             ↓
                    Filter by user assignments
                             ↓
                    Return weeks with:
                    - Only assigned items
                    - Personal progress data
                             ↓
                    Display in Weeks.tsx
                             ↓
                    Show completion status
```

## Security

- Bearer token authentication required
- Backend filters weeks/items by user assignments
- Members can only see their own progress
- Members cannot modify other users' data

## Testing the Feature

### Manual Testing Steps:

1. **Login as a member** (non-admin user)
2. **Navigate to Weeks page** (`/weeks`)
3. **Verify**: You should only see weeks with items assigned to you
4. **Check Progress**: Progress badges should show your completion status
5. **Test Locking**: Try to access a later week before completing the current one
6. **View Resources**: Click on resource links to verify access

### Expected Behavior:

- ✅ Only assigned weeks and items are visible
- ✅ Progress reflects personal completion status
- ✅ Sequential weeks are locked appropriately
- ✅ Overall progress percentage is accurate
- ✅ Resource links are accessible

## Notes

- The current implementation **already works correctly** for member users
- The API endpoint `/api/member/weeks/` returns filtered data by design
- No additional filtering is needed on the frontend
- Progress updates should use `/api/member/progress/{id}/update/` endpoint
