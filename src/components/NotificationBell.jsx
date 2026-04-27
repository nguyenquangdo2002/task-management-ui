import React, { useEffect, useState } from 'react';
import { useNotification } from '../hooks/useNotification';
import axiosClient from '../api/axiosClient';
const NotificationBell = () => {
    // Lấy token từ LocalStorage
    const token = localStorage.getItem('token'); 
    const [isOpen, setIsOpen] = useState(false);
    
    // Gọi custom hook SignalR
    const { 
        notifications, 
        unreadCount, 
        setNotifications, 
        setUnreadCount 
    } = useNotification(token);

    // Load data cũ khi mở trang
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Lấy thông báo gần nhất
                const notiRes = await axiosClient.get('/notifications');
                setNotifications(notiRes.data);
                
                // Lấy số lượng chưa đọc
                const countRes = await axiosClient.get('/notifications/unread-count');
                // The endpoint returns Ok(new { Count = count }), which is usually camelCased by ASP.NET Core
                setUnreadCount(countRes.data.count ?? countRes.data.Count ?? countRes.data);
            } catch (error) {
                console.error("Lỗi fetch thông báo:", error);
            }
        };

        if (token) fetchInitialData();
    }, [token, setNotifications, setUnreadCount]);

    // Hàm xử lý khi user bấm "Đánh dấu tất cả đã đọc"
    const handleMarkAllRead = async () => {
        try {
            await axiosClient.put('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setIsOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    // Hàm xử lý bấm vào 1 thông báo
    const handleReadOne = async (id, taskItemId) => {
        try {
            await axiosClient.put(`/notifications/${id}/read`);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            ));
            
            setIsOpen(false);

            // Redirect tới trang chi tiết Task
            if (taskItemId) {
                window.location.href = `/tasks/${taskItemId}`;
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* UI Nút chuông thông báo */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    fontSize: '20px', 
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '8px'
                }}
            >
                🔔 
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* UI Dropdown danh sách thông báo */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '300px',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Thông báo</h4>
                        <button onClick={handleMarkAllRead} style={{ fontSize: '12px', cursor: 'pointer', background: 'none', border: 'none', color: '#1890ff' }}>
                            Đánh dấu đã đọc tất cả
                        </button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {notifications.length === 0 ? (
                            <li style={{ padding: '16px', textAlign: 'center', color: '#888' }}>Không có thông báo nào</li>
                        ) : (
                            notifications.map(n => (
                                <li 
                                    key={n.id} 
                                    style={{ 
                                        padding: '12px', 
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        background: n.isRead ? 'white' : '#e6f7ff',
                                        transition: 'background 0.2s'
                                    }}
                                    onClick={() => handleReadOne(n.id, n.taskItemId)}
                                >
                                    <div style={{ fontWeight: n.isRead ? 'normal' : 'bold', fontSize: '14px' }}>
                                        {n.message}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
