import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import axiosClient from '../api/axiosClient';

export const useNotification = (token) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!token) return;

        // Construct Hub URL based on axiosClient's baseURL
        const baseUrl = axiosClient.defaults.baseURL || 'http://localhost:5284/api';
        const hubUrl = baseUrl.replace('/api', '/hub/notifications');

        // 1. Khởi tạo kết nối tới NotificationHub
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                // Truyền JWT Token vào query string để Server xác thực
                accessTokenFactory: () => token 
            })
            .withAutomaticReconnect() // Tự động kết nối lại nếu rớt mạng
            .build();

        // 2. Lắng nghe sự kiện "ReceiveNotification" từ Server gửi xuống
        connection.on("ReceiveNotification", (newNotification) => {
            console.log("Co thong bao moi: ", newNotification);
            
            // Thêm thông báo mới vào đầu danh sách
            setNotifications(prev => [newNotification, ...prev]);
            
            // Tăng biến đếm chưa đọc lên 1
            setUnreadCount(prev => prev + 1);
        });

        // 3. Bắt đầu kết nối
        connection.start()
            .then(() => console.log("SignalR Connected to", hubUrl))
            .catch(err => console.error("SignalR Connection Error: ", err));

        // 4. Cleanup khi component unmount
        return () => {
            connection.stop();
        };
    }, [token]);

    return { notifications, unreadCount, setNotifications, setUnreadCount };
};
