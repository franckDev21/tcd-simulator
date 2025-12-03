
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! Comment pouvons-nous vous aider à préparer votre TCF aujourd'hui ?",
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newUserMsg: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate Support Response
    setTimeout(() => {
      const supportMsg: Message = {
        id: Date.now() + 1,
        text: "Merci pour votre message. Un conseiller va prendre en charge votre demande dans quelques instants.",
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed z-[100] bottom-4 right-4 md:bottom-6 md:right-6 font-sans flex flex-col items-end pointer-events-none">
        
        {/* Chat Window - Floating Bubble Style for All Screens */}
        <div 
          className={`
            mb-4 origin-bottom-right transition-all duration-300 ease-out
            bg-glass-100 backdrop-blur-xl border border-glass-border shadow-2xl rounded-2xl
            flex flex-col overflow-hidden
            ${isOpen 
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 scale-90 translate-y-8 pointer-events-none'
            }
            /* Dimensions */
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
                <p className="text-xs text-blue-100">En ligne</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-glass-bg/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 text-sm rounded-2xl shadow-sm leading-relaxed ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-glass-border text-glass-text rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-glass-border p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-glass-border bg-glass-100 backdrop-blur-md shrink-0">
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Votre message..."
                className="w-full bg-glass-bg border border-glass-border rounded-full pl-4 pr-12 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-glass-text shadow-inner"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            pointer-events-auto
            group w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center transition-all duration-300 border border-white/20
            ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110 active:scale-95'}
          `}
        >
          <div className="relative">
             <MessageCircle size={28} />
          </div>
        </button>
    </div>
  );
};
