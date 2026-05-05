import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { HomePage } from './pages/Home';
import { AttendancePage } from './pages/Attendance';
import { TimesheetPage } from './pages/Timesheet';
import { ApplyLeavePage } from './pages/ApplyLeave';
import { LeaveApprovalPage } from './pages/LeaveApproval';
import { UserManagementPage } from './pages/UserManagement';
import { LeaveTypesPage } from './pages/LeaveTypes';
import { Layout } from './components/Layout';
import { RequireAuth } from './auth/RequireAuth';
import { RequirePermission } from './auth/RequirePermission';
import { PERMISSIONS } from './auth/permissions';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/timesheet" element={<TimesheetPage />} />

          <Route
            element={
              <RequirePermission
                permissions={[PERMISSIONS.ATTENDANCE_WRITE]}
              />
            }
          >
            <Route path="/attendance" element={<AttendancePage />} />
          </Route>

          <Route
            element={
              <RequirePermission permissions={[PERMISSIONS.LEAVE_APPLY]} />
            }
          >
            <Route path="/leaves" element={<ApplyLeavePage />} />
          </Route>

          <Route
            element={
              <RequirePermission permissions={[PERMISSIONS.LEAVE_APPROVE]} />
            }
          >
            <Route path="/leaves/approve" element={<LeaveApprovalPage />} />
          </Route>

          <Route
            element={
              <RequirePermission permissions={[PERMISSIONS.USER_MANAGE]} />
            }
          >
            <Route path="/users" element={<UserManagementPage />} />
          </Route>

          <Route
            element={
              <RequirePermission
                permissions={[PERMISSIONS.LEAVE_TYPE_MANAGE]}
              />
            }
          >
            <Route path="/leave-types" element={<LeaveTypesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
