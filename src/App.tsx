/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { CreateDrop } from './pages/CreateDrop';
import { MyResults } from './pages/MyResults';
import { Saved } from './pages/Saved';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { Settings } from './pages/Settings';
import { PublicDrop } from './pages/PublicDrop';
import { DropResults } from './pages/DropResults';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminAsks } from './pages/admin/AdminAsks';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminModeration } from './pages/admin/AdminModeration';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Dedicated Admin Panel Routes (Isolated Custom Theme & Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminOverview />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/asks"
          element={
            <AdminLayout>
              <AdminAsks />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <AdminLayout>
              <AdminModeration />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <AdminLayout>
              <AdminAnnouncements />
            </AdminLayout>
          }
        />

        {/* Regular User / Public Client Routes */}
        <Route
          path="/"
          element={
            <AppShell>
              <Home />
            </AppShell>
          }
        />
        <Route
          path="/discover"
          element={
            <AppShell>
              <Discover />
            </AppShell>
          }
        />
        <Route
          path="/create"
          element={
            <AppShell>
              <CreateDrop />
            </AppShell>
          }
        />
        <Route
          path="/results"
          element={
            <AppShell>
              <MyResults />
            </AppShell>
          }
        />
        <Route
          path="/saved"
          element={
            <AppShell>
              <Saved />
            </AppShell>
          }
        />
        <Route
          path="/profile"
          element={
            <AppShell>
              <Profile />
            </AppShell>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <AppShell>
              <Profile />
            </AppShell>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <AppShell>
              <EditProfile />
            </AppShell>
          }
        />
        <Route
          path="/settings"
          element={
            <AppShell>
              <Settings />
            </AppShell>
          }
        />
        <Route
          path="/drop/:slug"
          element={
            <AppShell>
              <PublicDrop />
            </AppShell>
          }
        />
        <Route
          path="/drop/:slug/results"
          element={
            <AppShell>
              <DropResults />
            </AppShell>
          }
        />
        <Route
          path="/terms"
          element={
            <AppShell>
              <Terms />
            </AppShell>
          }
        />
        <Route
          path="/privacy"
          element={
            <AppShell>
              <Privacy />
            </AppShell>
          }
        />
      </Routes>
    </Router>
  );
}
