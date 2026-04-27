import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import TaskList from './pages/TaskList';
import CreateEditTask from './pages/CreateEditTask';
import Chat from './pages/Chat';

function Router() {
  const { user } = useAuth();
  const path = window.location.pathname;

  if (!user) return <Login />;

  if (path === '/tasks/create') return <CreateEditTask />;
  if (path.includes('/edit')) return <CreateEditTask />;
  if (path === '/tasks') return <TaskList />;
  if (path === '/chat') return <Chat />;

  window.location.href = '/tasks';
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}