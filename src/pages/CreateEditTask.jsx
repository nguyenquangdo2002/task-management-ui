import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function CreateEditTask() {
    const id = window.location.pathname.split('/')[2];
    const isEdit = id && id !== 'create';

    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Todo',
        assignedToId: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            axiosClient.get(`/tasks/${id}`).then(({ data }) => {
                setForm({
                    title: data.title,
                    description: data.description || '',
                    priority: data.priority,
                    status: data.status,
                    assignedToId: data.assignedToId || '',
                });
            });
        }
    }, [id]);

    const handleSubmit = async () => {
        try {
            const payload = {
                title: form.title,
                description: form.description,
                priority: form.priority,
                status: form.status,
                assignedToId: form.assignedToId || null,
            };

            if (isEdit) {
                await axiosClient.put(`/tasks/${id}`, payload);
            } else {
                await axiosClient.post('/tasks', payload);
            }
            window.location.href = '/tasks';
        } catch {
            setError('Có lỗi xảy ra!');
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
            <h2>{isEdit ? 'Sửa Task' : 'Tạo Task mới'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input
                placeholder="Tiêu đề *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
            />
            <textarea
                placeholder="Mô tả"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8, height: 100 }}
            />
            <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
            >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>

            {isEdit && (
                <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
                >
                    <option value="Todo">Todo</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Done">Done</option>
                </select>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={handleSubmit}
                    style={{ flex: 1, padding: 10, background: '#1890ff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {isEdit ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                    onClick={() => window.location.href = '/tasks'}
                    style={{ padding: 10 }}
                >
                    Hủy
                </button>
            </div>
        </div>
    );
}