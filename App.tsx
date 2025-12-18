
import React, { useState, useEffect, useRef } from 'react';
import { Message, FileData } from './types';
import FileUploader from './components/FileUploader';
import ChatBubble from './components/ChatBubble';
import { askQuestionAboutDoc } from './services/gemini';

const App: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileSelect = (newFile: FileData) => {
    setFile(newFile);
    setMessages([]);
    setError(null);
    // Add a system welcome message
    setMessages([{
      role: 'model',
      text: `Perfect! I've loaded "${newFile.name}". You can now ask me any questions about its content.`,
      timestamp: new Date()
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || !file || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await askQuestionAboutDoc(userMessage.text, file, messages);
      const aiMessage: Message = {
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-6xl mx-auto shadow-2xl bg-white border-x">
      {/* Header */}
      <header className="px-6 py-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-brain text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">DocInsight</h1>
            <p className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">AI-Powered RAG</p>
          </div>
        </div>
        {file && (
          <button 
            onClick={reset}
            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <i className="fa-solid fa-rotate-left"></i>
            Reset Session
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {!file ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to DocInsight</h2>
                <p className="text-gray-600 leading-relaxed">
                  Unlock the knowledge hidden in your documents. Upload a PDF to start a context-aware conversation.
                </p>
              </div>
              <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <i className="fa-solid fa-bolt text-indigo-500 mb-2"></i>
                  <h4 className="text-sm font-semibold mb-1">Fast Retrieval</h4>
                  <p className="text-xs text-gray-500">Instant answers from any sized PDF.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <i className="fa-solid fa-lock text-indigo-500 mb-2"></i>
                  <h4 className="text-sm font-semibold mb-1">Contextual</h4>
                  <p className="text-xs text-gray-500">Only uses your uploaded document.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* File Status Bar */}
            <div className="bg-indigo-50 px-6 py-2 border-b flex items-center gap-3">
              <i className="fa-solid fa-file-pdf text-indigo-600"></i>
              <span className="text-sm font-medium text-indigo-900 truncate flex-1">{file.name}</span>
              <span className="text-xs text-indigo-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>

            {/* Chat Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                       <i className="fa-solid fa-ellipsis text-gray-400"></i>
                    </div>
                    <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="mx-auto max-w-md bg-red-50 border border-red-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <i className="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Error</p>
                    <p className="text-xs text-red-600">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="text-xs font-bold text-red-800 underline mt-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-white border-t">
              <div className="relative group">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question about the document..."
                  className="w-full bg-gray-50 border-gray-200 border-2 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-indigo-500 transition-all text-gray-800 text-sm font-medium shadow-sm group-hover:bg-white"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-3 top-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    input.trim() && !isLoading 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 text-center uppercase tracking-widest font-bold">
                Powered by Gemini 3 Pro • Privacy Protected context
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
