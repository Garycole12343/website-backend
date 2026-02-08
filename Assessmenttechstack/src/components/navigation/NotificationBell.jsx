// src/components/navigation/NotificationBell.jsx - FINAL CLEAN VERSION
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    requestNotificationPermission,
    hasPermission
  } = useNotifications();

  // Request permission on mount
  useEffect(() => {
    if (!hasPermission && Notification.permission === 'default') {
      requestNotificationPermission();
    }
  }, [hasPermission, requestNotificationPermission]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
  };

  // Memoize filtered notifications for better performance
  const [unreadNotifications, readNotifications] = useMemo(() => {
    const unread = notifications.filter(n => !n.read);
    const read = notifications.filter(n => n.read).slice(0, 10);
    return [unread, read];
  }, [notifications]);

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[1.25rem] animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh]"
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <div className="text-xs text-gray-500 mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="mb-2 font-medium text-gray-700">No notifications yet</p>
                <p className="text-sm text-gray-500">
                  You'll be notified when you receive new messages
                </p>
              </div>
            ) : (
              <>
                {unreadNotifications.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-blue-50 text-xs font-semibold text-blue-700 uppercase border-y border-blue-100">
                      New ({unreadNotifications.length})
                    </div>
                    {unreadNotifications.map(notification => (
                      <Link
                        key={notification.id}
                        to={`/messages?conversation=${notification.conversationId}`}
                        className="block hover:no-underline"
                      >
                        <div
                          className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 pt-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-blue-600"></div>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                  {notification.type === 'NEW_MESSAGE' ? 'Message' : 'Alert'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate mt-1">{notification.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-500">
                                  From: <span className="font-medium">{notification.from}</span>
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {readNotifications.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase border-y border-gray-100">
                      Earlier
                    </div>
                    {readNotifications.map(notification => (
                      <Link
                        key={notification.id}
                        to={`/messages?conversation=${notification.conversationId}`}
                        className="block hover:no-underline"
                      >
                        <div
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 pt-1">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-gray-700 truncate">{notification.title}</p>
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                  {notification.type === 'NEW_MESSAGE' ? 'Message' : 'Alert'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 truncate mt-1">{notification.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-gray-500">
                                  From: <span className="font-medium">{notification.from}</span>
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link
              to="/messages"
              className="w-full text-center block text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View all messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;