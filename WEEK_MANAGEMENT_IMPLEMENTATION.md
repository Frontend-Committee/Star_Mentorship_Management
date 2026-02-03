# Week Management Feature Implementation

## Overview

This document describes the implementation of the Week Management feature for the STAR Mentorship Management platform, integrating with the backend API.

## API Endpoints Implemented

### 1. Create a New Week

**POST** `/weeks/`

**Request Body:**

```typescript
{
  number: number;        // Unique week number
  title: string;         // Week title
  start_date: Date;      // Week start date
  end_date?: Date | null; // Optional end date
}
```

**Response:**

```typescript
{
  id?: number;
  number: number;
  title: string;
  start_date: Date;
  end_date?: Date | null;
  committee?: number;
  Items?: WeekItem[];
}
```

### 2. Get All Weeks

**GET** `/weeks/`

**Response:** Array of `WeekDetail` objects

### 3. Get Single Week

**GET** `/weeks/{id}/`

**Response:** Single `WeekDetail` object

## Type Definitions

### New API Types (`src/types/index.ts`)

```typescript
// Week Progress tracking for individual items
export interface WeekProgress {
  id?: number;
  is_finished?: boolean;
  notes?: string | null;
}

// Week Item (resource within a week)
export interface WeekItem {
  id?: number;
  notes?: string | null;
  resource: string; // Resource URL
  title: string;
  week_progress?: WeekProgress;
}

// Week Detail (GET weeks/{id}/ and GET weeks/)
export interface WeekDetail {
  committee?: number;
  end_date?: Date | null;
  id?: number;
  Items?: WeekItem[]; // Note: Capitalized as per API spec
  number: number; // Unique week number
  start_date: Date;
  title: string;
}

// Week Create Payload (POST weeks/)
export interface WeekCreatePayload {
  end_date?: Date | null;
  number: number; // Unique week number
  start_date: Date;
  title: string;
}
```

## React Query Hooks (`src/features/weeks/hooks.ts`)

### `useWeeks()`

Fetches all weeks from the API.

**Usage:**

```typescript
const { data: weeks, isLoading, error } = useWeeks();
```

### `useWeek(id)`

Fetches a single week by ID.

**Usage:**

```typescript
const { data: week, isLoading, error } = useWeek(weekId);
```

### `useCreateWeek()`

Creates a new week.

**Usage:**

```typescript
const createWeek = useCreateWeek();

await createWeek.mutateAsync({
  number: 1,
  title: "Introduction to Web Development",
  start_date: new Date("2026-02-03"),
  end_date: new Date("2026-02-09"),
});
```

### `useUpdateWeek(id)`

Updates an existing week.

**Usage:**

```typescript
const updateWeek = useUpdateWeek(weekId);

await updateWeek.mutateAsync({
  title: "Updated Title",
});
```

### `useDeleteWeek()`

Deletes a week.

**Usage:**

```typescript
const deleteWeek = useDeleteWeek();

await deleteWeek.mutateAsync(weekId);
```

## Components

### AddWeekDialog (`src/components/dialogs/AddWeekDialog.tsx`)

Updated to work with the API:

- Removed description and resource URL fields (not in API spec)
- Added start_date and end_date fields with date pickers
- Integrated `useCreateWeek` hook
- Shows loading state while creating
- Displays error messages on failure

**Props:**

```typescript
interface AddWeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextWeekNumber: number;
}
```

### Weeks Page (`src/pages/Weeks.tsx`)

Updated to use API data:

- Replaced mock data with `useWeeks()` hook
- Added loading state with spinner
- Added error state with error message
- Transforms API data to UI format using `useMemo`
- Automatically calculates week completion based on `week_progress.is_finished`

## Data Transformation

The API data is transformed to maintain compatibility with the existing UI:

```typescript
const weeks = useMemo<WeekContent[]>(() => {
  if (!apiWeeks) return [];

  return apiWeeks.map((week) => {
    // Calculate if week is completed based on all items being finished
    const isCompleted =
      week.Items?.every((item) => item.week_progress?.is_finished) ?? false;

    return {
      id: week.id?.toString() ?? `week-${week.number}`,
      weekNumber: week.number,
      title: week.title,
      description: "",
      isCompleted,
      // Map items to legacy format
      notes: week.Items?.find((item) =>
        item.title.toLowerCase().includes("note"),
      )?.resource,
      slides: week.Items?.find((item) =>
        item.title.toLowerCase().includes("slide"),
      )?.resource,
      challengeLink: week.Items?.find((item) =>
        item.title.toLowerCase().includes("challenge"),
      )?.resource,
      formLink: week.Items?.find((item) =>
        item.title.toLowerCase().includes("form"),
      )?.resource,
      quizLink: week.Items?.find((item) =>
        item.title.toLowerCase().includes("quiz"),
      )?.resource,
    };
  });
}, [apiWeeks]);
```

## Testing the Implementation

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to Weeks Page

- Login as an admin user
- Navigate to the "Weeks" or "Content Management" page

### 3. Create a New Week

- Click "Add Week" button
- Fill in:
  - Title: "Introduction to Web Development"
  - Start Date: Select a date
  - End Date: (Optional) Select an end date
- Click "Add Week"

### 4. Verify API Call

Check the browser's Network tab to see:

- POST request to `/api/weeks/`
- Request payload with the week data
- Response with the created week

## TODO: Future Enhancements

1. **Week Progress Tracking**
   - Implement API endpoints for updating `week_progress`
   - Add hooks for marking items as complete/incomplete
   - Update `handleMarkComplete` and `handleMarkIncomplete` functions

2. **Week Items Management**
   - Add UI for managing week items (resources)
   - Create/Update/Delete individual items within a week
   - Better mapping between items and UI elements

3. **Week Editing**
   - Implement edit functionality for existing weeks
   - Add edit dialog component
   - Wire up `useUpdateWeek` hook

4. **Week Deletion**
   - Add delete confirmation dialog
   - Wire up `useDeleteWeek` hook
   - Handle cascade deletion of items

5. **Better Error Handling**
   - Add retry mechanism for failed requests
   - Show more detailed error messages
   - Add toast notifications for all operations

## Notes

- The API uses capitalized `Items` property (not `items`)
- Week completion is calculated based on all items having `is_finished: true`
- Date fields are sent as JavaScript Date objects (will be serialized to ISO strings)
- The proxy is configured in `vite.config.ts` to forward `/api` requests to the backend
