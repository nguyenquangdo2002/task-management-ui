import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import axiosClient from '../api/axiosClient';

const Chat = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('token');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [content, setContent] = useState('');
    const [messages, setMessages] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const messagesEndRef = useRef(null);

    // Filter incoming messages: only add if they're from the user we are currently chatting with
    const onMessageReceived = useCallback((message) => {
        const isFromSelected = selectedUser && message.senderId === selectedUser.id;
        const isToMe = message.receiverId === user?.id;

        if (isFromSelected || message.receiverId === selectedUser?.id) {
            setMessages(prev => [...prev, message]);
        }

        // Increment unread count if message is for me and NOT from the selected user
        if (isToMe && !isFromSelected) {
            setUnreadCounts(prev => ({
                ...prev,
                [message.senderId]: (prev[message.senderId] || 0) + 1
            }));
        }
    }, [selectedUser, user]);

    const { sendMessage, fetchHistory, markAsRead, fetchUnreadCounts } = useChat(token, onMessageReceived);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        axiosClient.get('/users').then(({ data }) => {
            setUsers(data.filter(u => u.username !== user?.username));
        });
        fetchUnreadCounts().then(counts => setUnreadCounts(counts));
    }, [user]);

    useEffect(() => {
        if (selectedUser) {
            fetchHistory(selectedUser.id).then(data => setMessages(data));
            markAsRead(selectedUser.id);
            // Clear local unread count for this user
            setUnreadCounts(prev => {
                const newCounts = { ...prev };
                delete newCounts[selectedUser.id];
                return newCounts;
            });
        } else {
            setMessages([]);
        }
    }, [selectedUser, fetchHistory, markAsRead]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!content.trim() || !selectedUser) return;
        
        try {
            const data = await sendMessage(selectedUser.id, content);
            setMessages(prev => [...prev, data]);
            setContent('');
        } catch (error) {
            alert('Failed to send message');
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            height: 'calc(100vh - 100px)', 
            margin: '20px', 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        }}>
            {/* User List Side Bar */}
            <div style={{ 
                width: '300px', 
                borderRight: '1px solid #eee', 
                display: 'flex', 
                flexDirection: 'column',
                background: '#f8f9fa'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Chats</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {users.map(u => (
                        <div 
                            key={u.id} 
                            onClick={() => setSelectedUser(u)}
                            style={{ 
                                padding: '15px 20px', 
                                cursor: 'pointer', 
                                borderBottom: '1px solid #f0f0f0',
                                background: selectedUser?.id === u.id ? '#e6f7ff' : 'transparent',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                background: '#1890ff', 
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {u.username[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', color: '#333' }}>{u.username}</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>Click to chat</div>
                            </div>
                            {unreadCounts[u.id] > 0 && (
                                <div style={{ 
                                    background: '#ff4d4f', 
                                    color: 'white', 
                                    borderRadius: '10px', 
                                    padding: '2px 8px', 
                                    fontSize: '12px', 
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(255,77,79,0.3)'
                                }}>
                                    {unreadCounts[u.id]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedUser ? (
                    <>
                        {/* Header */}
                        <div style={{ 
                            padding: '15px 25px', 
                            borderBottom: '1px solid #eee', 
                            display: 'flex', 
                            alignItems: 'center',
                            background: 'white'
                        }}>
                            <div style={{ 
                                width: '35px', 
                                height: '35px', 
                                borderRadius: '50%', 
                                background: '#52c41a', 
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px'
                            }}>
                                {selectedUser.username[0].toUpperCase()}
                            </div>
                            <h4 style={{ margin: 0 }}>{selectedUser.username}</h4>
                        </div>

                        {/* Messages */}
                        <div style={{ 
                            flex: 1, 
                            padding: '20px', 
                            overflowY: 'auto', 
                            background: '#f0f2f5',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            {messages.map((m, index) => {
                                const isMine = m.senderUsername === user?.username;
                                return (
                                    <div 
                                        key={m.id || index} 
                                        style={{ 
                                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isMine ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <div style={{ 
                                            padding: '10px 16px', 
                                            borderRadius: '18px', 
                                            background: isMine ? '#1890ff' : 'white',
                                            color: isMine ? 'white' : '#333',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                            fontSize: '14px',
                                            lineHeight: '1.4'
                                        }}>
                                            {m.content}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', padding: '0 4px' }}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form 
                            onSubmit={handleSend}
                            style={{ 
                                padding: '20px', 
                                borderTop: '1px solid #eee', 
                                display: 'flex', 
                                gap: '12px',
                                background: 'white'
                            }}
                        >
                            <input 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Type a message..."
                                style={{ 
                                    flex: 1, 
                                    padding: '12px 20px', 
                                    borderRadius: '25px', 
                                    border: '1px solid #eee',
                                    outline: 'none',
                                    background: '#f8f9fa'
                                }}
                            />
                            <button 
                                type="submit"
                                style={{ 
                                    background: '#1890ff', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '50%', 
                                    width: '45px', 
                                    height: '45px', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    boxShadow: '0 4px 12px rgba(24,144,255,0.3)'
                                }}
                            >
                                ✈️
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#999',
                        flexDirection: 'column'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
                        <h3>Select a user to start chatting</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
