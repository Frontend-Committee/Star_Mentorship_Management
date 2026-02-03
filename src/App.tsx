import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
// import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Weeks from "./pages/Weeks";
// import Projects from "./pages/Projects";
import Attendance from "./pages/Attendance";
import Announcements from "./pages/Announcements";
import Feedback from "./pages/Feedback";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import TasksListPage from "./pages/TasksListPage";
import TaskDetailsPage from "./pages/TaskDetailsPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryProvider>
    <ThemeProvider defaultTheme="system" storageKey="star-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              {/* Signup route removed as registration is admin-only */}
              
              {/* Dashboard Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/weeks" element={<Weeks />} />
                {/* <Route path="/projects" element={<Projects />} /> */}
                <Route path="/tasks" element={<TasksListPage />} />
                <Route path="/tasks/:id" element={<TaskDetailsPage />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/members" element={<Members />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryProvider>
);

export default App;
