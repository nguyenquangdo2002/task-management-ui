
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function TaskList() {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchTasks = async () => {
        const params = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        const { data } = await axiosClient.get('/tasks', { params });
        setTasks(data);
    };

    useEffect(() => {
        fetchTasks();
    }, [search, statusFilter]);

    const deleteTask = async (id) => {
        if (!window.confirm('Xóa task này?')) return;
        await axiosClient.delete(`/tasks/${id}`);
        fetchTasks();
    };

    return (
        <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2>Task Management</h2>
                <div>
                    <span>Xin chào, {user?.username}</span>
                    <button onClick={logout} style={{ marginLeft: 12 }}>Đăng xuất</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <input
                    placeholder="Tìm kiếm..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, padding: 8 }}
                />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: 8 }}>
                    <option value="">Tất cả</option>
                    <option value="Todo">Todo</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
                <button
                    onClick={() => window.location.href = '/tasks/create'}
                    style={{ padding: '8px 16px', background: '#1890ff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    + Tạo Task
                </button>
            </div>

            {tasks.length === 0 ? (
                <p>Không có task nào.</p>
            ) : (
                tasks.map(task => (
                    <div key={task.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0 }}>{task.title}</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span style={{ padding: '2px 8px', background: '#f0f0f0', borderRadius: 4 }}>{task.status}</span>
                                <span style={{ padding: '2px 8px', background: '#fff7e6', borderRadius: 4 }}>{task.priority}</span>
                            </div>
                        </div>
                        {task.description && <p style={{ color: '#666', margin: '8px 0' }}>{task.description}</p>}
                        {task.assignedToUsername && <p style={{ margin: '4px 0', fontSize: 13 }}>Assigned: {task.assignedToUsername}</p>}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button onClick={() => window.location.href = `/tasks/${task.id}`}>Chi tiết</button>
                            <button onClick={() => window.location.href = `/tasks/${task.id}/edit`}>Sửa</button>
                            {user?.role === 'Admin' && (
                                <button onClick={() => deleteTask(task.id)} style={{ color: 'red' }}>Xóa</button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}