import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import axiosClient from '../api/axiosClient';

export const useChat = (token, onMessageReceived) => {
    const [connection, setConnection] = useState(null);
    const callbackRef = useRef(onMessageReceived);

    // Update ref whenever callback changes
    useEffect(() => {
        callbackRef.current = onMessageReceived;
    });

    useEffect(() => {
        if (!token) return;

        const baseUrl = axiosClient.defaults.baseURL || 'http://localhost:5284/api';
        const hubUrl = baseUrl.replace('/api', '/hub/chat');

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, [token]);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Connected to ChatHub');
                    connection.on('ReceiveMessage', (message) => {
                        if (callbackRef.current) callbackRef.current(message);
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }

        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [connection]);

    const sendMessage = useCallback(async (receiverId, content) => {
        try {
            const { data } = await axiosClient.post('/chat/send', { receiverId, content });
            return data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }, []);

    const fetchHistory = useCallback(async (otherUserId) => {
        try {
            const { data } = await axiosClient.get(`/chat/history/${otherUserId}`);
            return data;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
    }, []);

    const markAsRead = useCallback(async (otherUserId) => {
        try {
            await axiosClient.put(`/chat/read/${otherUserId}`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }, []);

    const fetchUnreadCounts = useCallback(async () => {
        try {
            const { data } = await axiosClient.get('/chat/unread-counts');
            return data;
        } catch (error) {
            console.error('Error fetching unread counts:', error);
            return {};
        }
    }, []);

    return { sendMessage, fetchHistory, markAsRead, fetchUnreadCounts };
};
