"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  MoreHorizontal, 
  ArrowUp, 
  Paperclip, 
  Globe, 
  Search,
  Calendar,
  FileText,
  CheckCircle,
  Pill,
  File as FileIcon,
  Image as ImageIcon
} from "lucide-react";

type Role = "user" | "assistant";

type Message = {
  role: Role;
  text: string;
};

export interface AiChatModalProps {
  open: boolean;
  onClose: () => void;
  apiEndpoint: string;
}

export function AiChatModal({ open, onClose, apiEndpoint }: AiChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSend(textOverride?: string) {
    const text = textOverride || input.trim();
    if ((!text && files.length === 0) || loading) return;

    setInput("");
    setFiles([]);
    setMessages((prev) => [...prev, { role: "user", text: text || (files.length > 0 ? "Sent attachments" : "") }]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", text);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const reply = data.reply ?? "I'm not sure how to answer that yet.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, ensuring secure connection..."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    { icon: Search, text: "Search for doctors", action: "Find me a cardiologist" },
    { icon: Calendar, text: "Schedule appointment", action: "I need to book an appointment" },
    { icon: FileText, text: "Analyze medical report", action: "Can you summarize this report in simple terms and highlight anything I should discuss with my doctor?" },
    { icon: Pill, text: "Prescription summary", action: "Can you summarize this prescription in simple terms?" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
           className="fixed bottom-28 right-4 sm:right-8 z-[100] w-[calc(100vw-32px)] sm:w-[420px] h-[500px] sm:h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden origin-bottom-right"
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.9, y: 20 }}
           transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 bg-white z-10 border-b border-gray-50">
             <button 
              onClick={() => setMessages([])}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              title="Reset Chat"
            >
               <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shadow-sm group-hover:scale-105 transition-transform">
                CP
              </div>
              <span className="text-sm font-medium">CarePulse Assistant</span>
            </button>
            <div className="flex items-center gap-1">
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-gray-200">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-6 mt-10">
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center mb-2">
                  <Sparkles className="w-8 h-8 text-gray-800" />
                  <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-gray-200 animate-[spin_10s_linear_infinite]" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800">
                  How can I help you today?
                </h3>

                <div className="w-full space-y-2 mt-4">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s.action)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                    >
                      <s.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4 mt-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        m.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {m.role === "assistant" && (
                         <div className="mb-1 text-[10px] text-gray-400 font-medium uppercase tracking-wider">CarePulse AI</div>
                      )}
                      
                      {m.role === "user" ? (
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      ) : (
                         <div className="text-sm leading-relaxed space-y-2">
                           <ReactMarkdown 
                             components={{
                               ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                               ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1" {...props} />,
                               li: ({node, ...props}) => <li className="pl-1" {...props} />,
                               h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                               h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                               h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-1" {...props} />,
                               strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                               a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                               p: ({node, ...props}) => <div className="mb-2 last:mb-0" {...props} />,
                             }}
                           >
                             {m.text}
                           </ReactMarkdown>
                         </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white">
            <div className="relative group">
              {/* File Chips */}
              {files.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 animate-in slide-in-from-bottom-2 fade-in duration-200">
                      {file.type.includes("image") ? <ImageIcon className="w-3 h-3" /> : <FileIcon className="w-3 h-3" />}
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button onClick={() => removeFile(index)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all duration-200"
              >
                <div className="px-3 pt-3 pb-10">
                    <input
                        className="w-full text-sm placeholder:text-gray-400 outline-none text-gray-700 bg-transparent"
                        placeholder="Ask anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                </div>
                
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          multiple 
                          accept=".pdf,image/*"
                          onChange={handleFileSelect}
                        />
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Attach files"
                        >
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <button type="button" className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Search</span>
                        </button>
                    </div>
                    <button 
                        type="submit" 
                        disabled={(!input.trim() && files.length === 0) && !loading}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                            (input.trim() || files.length > 0)
                                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
