import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Info, Trophy, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../services/apiClient';

interface Notification {
  id: number;
  type: 'INFO' | 'ACHIEVEMENT' | 'INQUIRY_REPLY' | 'SYSTEM';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // 실제 API 엔드포인트에 맞춰 수정 필요
      const data = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      // Fallback mock data for demo
      setNotifications([
        { id: 1, type: 'ACHIEVEMENT', title: '새로운 칭호 획득!', content: '전설의 쾌변가 칭호를 획득하셨습니다.', isRead: false, createdAt: new Date().toISOString() },
        { id: 2, type: 'INFO', title: '포인트 충전 완료', content: '5000포인트가 충전되었습니다.', isRead: true, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const deleteNotif = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT': return <Trophy className="text-amber-500" size={16} />;
      case 'INQUIRY_REPLY': return <MessageSquare className="text-blue-500" size={16} />;
      case 'INFO': return <Info className="text-emerald-500" size={16} />;
      default: return <Bell className="text-gray-400" size={16} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            className="fixed right-6 top-24 z-[1001] w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#1A2B27]" />
                <h3 className="text-lg font-black text-[#1A2B27] tracking-tight">알림 센터</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="max-height-[400px] overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="py-20 text-center">
                  <motion.div 
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    💩
                  </motion.div>
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <motion.div 
                      key={n.id}
                      layout
                      className={`group relative p-4 rounded-2xl border transition-all ${
                        n.isRead ? 'bg-gray-50/50 border-transparent opacity-60' : 'bg-white border-emerald-100/50 shadow-sm'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          n.isRead ? 'bg-gray-200/50' : 'bg-emerald-50'
                        }`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[#1A2B27] mb-1">{n.title}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed">{n.content}</p>
                          <span className="text-[10px] text-gray-300 mt-2 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.isRead && (
                            <button 
                              onClick={() => markAsRead(n.id)}
                              className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotif(n.id)}
                            className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-gray-300 text-sm">
                  아직 도착한 알림이 없어요.
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 text-center">
              <button 
                className="text-xs font-bold text-[#1B4332]/40 hover:text-[#1B4332] transition-colors"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
              >
                모두 읽음으로 표시
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
