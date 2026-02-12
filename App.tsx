import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile, OnboardingData } from './types';
import { generateMathResponse } from './services/gemini';
import OnboardingModal from './components/OnboardingModal';
import ChatMessageBubble from './components/ChatMessage';

const App: React.FC = () => {
  // Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize from LocalStorage (Demo Mode)
  useEffect(() => {
    const savedProfile = localStorage.getItem('geleza_user_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setShowOnboarding(true);
    }
    setLoading(false);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleOnboardingSubmit = (data: OnboardingData) => {
    // Create a demo profile
    const newProfile: UserProfile = {
      uid: 'demo-user-' + Date.now(),
      displayName: "Student", 
      isProfileComplete: true,
      ...data
    };

    // Save to LocalStorage
    localStorage.setItem('geleza_user_profile', JSON.stringify(newProfile));
    setProfile(newProfile);
    setShowOnboarding(false);
      
    // Initial greeting
    const greeting: ChatMessage = {
      id: 'init-1',
      role: 'model',
      text: `Hey there! I'm Geleza Smart, your new math buddy! 🎓✨ \n\nI see you like **${data.favoredCelebrity}** and want to be a **${data.dreamJob}**! That is so cool! 🤩\n\nAsk me a question, and let's crush some math problems together!`,
      timestamp: Date.now()
    };
    setMessages([greeting]);
  };

  const handleResetDemo = () => {
    if (window.confirm("Are you sure you want to reset your profile? This will clear your chat history.")) {
      localStorage.removeItem('geleza_user_profile');
      setProfile(null);
      setMessages([]);
      setShowOnboarding(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing || !profile) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const responseText = await generateMathResponse(
        messages, 
        userMsg.text, 
        undefined, // No image support
        profile
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 font-sans overflow-hidden">
      <OnboardingModal isOpen={showOnboarding} onSubmit={handleOnboardingSubmit} />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-fun-purple to-fun-pink rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
            🧠
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-gray-800 leading-tight">Geleza Smart</h1>
            <p className="text-xs text-gray-500 font-medium">Your AI Maths Teacher (Demo)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {profile && (
                <div className="hidden md:flex items-center gap-2 text-xs bg-primary-50 px-3 py-1.5 rounded-full text-primary-700 border border-primary-100">
                    <i className="fas fa-star text-fun-yellow"></i>
                    <span>{profile.gradeLevel}</span>
                </div>
            )}
            {profile && (
              <button 
                onClick={handleResetDemo}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-2"
                title="Reset Demo User"
              >
                <i className="fas fa-power-off"></i>
              </button>
            )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide relative bg-gray-50/50">
        <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">
          {messages.length === 0 && !showOnboarding && (
            <div className="text-center text-gray-400 my-auto pb-10">
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                 <i className="fas fa-calculator text-4xl text-primary-200"></i>
              </div>
              <p className="text-lg font-display text-gray-500">Ask me a math question to start!</p>
            </div>
          )}
          
          {messages.map(msg => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}
          
          {isProcessing && (
             <div className="flex w-full mb-6 justify-start">
               <div className="flex max-w-[85%] flex-row items-end gap-2">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md text-fun-purple">
                   <i className="fas fa-comment-dots text-lg"></i>
                 </div>
                 <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                 </div>
               </div>
             </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4 z-20">
        <div className="max-w-3xl mx-auto space-y-3">
          
          <div className="flex items-end gap-3">
             <div className="flex-1 bg-gray-100 rounded-2xl flex items-center border border-transparent focus-within:border-primary-500 focus-within:bg-white transition-all">
               <textarea
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Type a math question..."
                 className="flex-1 bg-transparent border-none focus:ring-0 p-3 max-h-32 min-h-[48px] resize-none text-gray-700 placeholder-gray-400"
                 rows={1}
               />
             </div>
             
             <button 
               onClick={handleSendMessage}
               disabled={!inputText.trim() || isProcessing}
               className={`p-3 rounded-full shadow-lg transition-all duration-200 
                 ${!inputText.trim() || isProcessing 
                   ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                   : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-90 hover:shadow-xl'
                 }`}
             >
               <i className="fas fa-paper-plane"></i>
             </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;