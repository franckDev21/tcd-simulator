import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, LogIn, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { chatService, ChatMessage } from '../services/chatService';

export const ChatWidget: React.FC = () => {
  const { user, toggleAuthModal } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load conversation when chat opens and user is authenticated
  useEffect(() => {
    if (isOpen && user) {
      loadConversation();
      startHeartbeat();
    }
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [isOpen, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  // Poll for new messages
  useEffect(() => {
    if (!isOpen || !user) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await chatService.getMessages(20);
        if (response.data.length > 0) {
          setMessages(prev => {
            // Merge new messages
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = response.data.filter(m => !existingIds.has(m.id));
            if (newMessages.length > 0) {
              return [...prev, ...newMessages].sort((a, b) => a.id - b.id);
            }
            return prev;
          });
        }
      } catch (error) {
        // Silently fail polling
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [isOpen, user]);

  // Load unread count periodically
  useEffect(() => {
    if (!user) return;

    const loadUnread = async () => {
      try {
        const count = await chatService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        // Silently fail
      }
    };

    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const startHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    // Send heartbeat immediately
    chatService.heartbeat().catch(() => {});
    // Then every 60 seconds
    heartbeatRef.current = setInterval(() => {
      chatService.heartbeat().catch(() => {});
    }, 60000);
  };

  const loadConversation = async () => {
    setIsLoading(true);
    try {
      const conversation = await chatService.getConversation();
      setMessages(conversation.messages || []);
      // Mark as read
      await chatService.markAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Show welcome message on error
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic update
    const tempMessage: ChatMessage = {
      id: Date.now(),
      conversation_id: 0,
      sender_type: 'user',
      sender_id: parseInt(user.id),
      sender: {
        id: parseInt(user.id),
        name: user.name,
        avatar: user.avatar || null,
      },
      content,
      type: 'text',
      attachment_url: null,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const savedMessage = await chatService.sendMessage({ content });
      // Replace temp message with saved one
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? savedMessage : m));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setInputText(content); // Restore input
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderAuthPrompt = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-glass-bg/50">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-4 border border-blue-500/30">
        <MessageCircle size={32} className="text-blue-400" />
      </div>
      <h3 className="text-lg font-bold text-glass-text mb-2">
        Discutez avec notre équipe
      </h3>
      <p className="text-sm text-slate-400 mb-6 max-w-[200px]">
        Connectez-vous pour démarrer une conversation avec notre support.
      </p>
      <button
        onClick={() => {
          setIsOpen(false);
          toggleAuthModal(true);
        }}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95"
      >
        <LogIn size={18} />
        Se connecter
      </button>
      <p className="text-xs text-slate-500 mt-4">
        Pas encore de compte ?{' '}
        <button
          onClick={() => {
            setIsOpen(false);
            toggleAuthModal(true);
          }}
          className="text-blue-400 hover:underline"
        >
          S'inscrire
        </button>
      </p>
    </div>
  );

  const renderMessages = () => (
    <>
      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-glass-bg/50">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot size={40} className="text-slate-400 mb-3" />
            <p className="text-sm text-slate-400">
              Bonjour {user?.name?.split(' ')[0]} ! Comment pouvons-nous vous aider ?
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isUser = msg.sender_type === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col max-w-[85%]">
                    <div
                      className={`p-3 text-sm rounded-2xl shadow-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 border border-glass-border text-glass-text rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className={`text-[10px] text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.created_at)}
                      {isUser && msg.is_read && ' • Lu'}
                    </span>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-glass-border p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Footer Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-glass-border bg-glass-100 backdrop-blur-md shrink-0">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Votre message..."
            disabled={isSending}
            className="w-full bg-glass-bg border border-glass-border rounded-full pl-4 pr-12 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-glass-text shadow-inner disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="fixed z-[100] bottom-4 right-4 md:bottom-6 md:right-6 font-sans flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div
        className={`
          mb-4 origin-bottom-right transition-all duration-300 ease-out
          bg-glass-100 backdrop-blur-xl border border-glass-border shadow-2xl rounded-2xl
          flex flex-col overflow-hidden
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-8 pointer-events-none'
          }
          w-[calc(100vw-2rem)] h-[60vh]
          max-w-[350px] max-h-[500px]
        `}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Bot size={20} />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-sm">Support PRIMO</h3>
              <p className="text-xs text-blue-100">
                {user ? 'En ligne' : 'Connectez-vous pour discuter'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {user ? renderMessages() : renderAuthPrompt()}
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          pointer-events-auto relative
          group w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center transition-all duration-300 border border-white/20
          ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110 active:scale-95'}
        `}
      >
        <MessageCircle size={28} />
        {/* Unread Badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
