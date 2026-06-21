import { useState, useEffect } from "react";
import { Sidebar as SidebarIcon, Sparkles } from "lucide-react";
import { Conversation, Message, AppMode } from "./types";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";

const STORAGE_KEY = "veloxai_history";

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<AppMode>("chat");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [systemPrompt, setSystemPrompt] = useState(
    "Siz VeloxAI ismli o'ta aqlli, tezkor va xushmuomala sun'iy intellekt yordamchisiz. Foydalanuvchining har qanday savollariga aniq, ravshan va har taraflama mukammal javob berasiz. Savollarga chiroyli tartibda, tushunarli qilish uchun markdown (ro'yxatlar, qalin matn, kod bloklari kabi) formatda javob bering."
  );

  // Load conversation history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Conversation[];
        if (parsed.length > 0) {
          setConversations(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch (err) {
      console.error("Local storage loading error:", err);
    }
  }, []);

  // Save changes to localStorage
  const saveToLocalStorage = (list: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error("Local storage saving error:", err);
    }
  };

  // Select a conversation
  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false); // Close on mobile
  };

  // Delete a conversation
  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    saveToLocalStorage(updated);

    if (activeId === id) {
      if (updated.length > 0) {
        setActiveId(updated[0].id);
      } else {
        setActiveId(null);
      }
    }
  };

  // Start new conversation
  const handleNewConversation = (mode: AppMode = "chat") => {
    const newChat: Conversation = {
      id: crypto.randomUUID(),
      title: "Yangi suhbat",
      messages: [],
      createdAt: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [newChat, ...conversations];
    setConversations(updated);
    setActiveId(newChat.id);
    setCurrentMode(mode);
    setSidebarOpen(false);
    saveToLocalStorage(updated);
  };

  // Send a message
  const handleSendMessage = async (text: string, options?: { aspectRatio?: string }) => {
    // 1. Get or create active conversation
    let currentActiveId = activeId;
    let targetConversations = [...conversations];

    if (!currentActiveId) {
      // Create a new chat on the fly
      const newChat: Conversation = {
        id: crypto.randomUUID(),
        title: text.substring(0, 24) + (text.length > 24 ? "..." : ""),
        messages: [],
        createdAt: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      };
      targetConversations = [newChat, ...targetConversations];
      currentActiveId = newChat.id;
      setConversations(targetConversations);
      setActiveId(currentActiveId);
    }

    const currentChat = targetConversations.find((c) => c.id === currentActiveId);
    if (!currentChat) return;

    // 2. Prepare user message payload
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      mode: currentMode,
    };

    // Update with user message in UI
    const updatedMessages = [...currentChat.messages, userMessage];
    
    // Auto rename conversation title if it is "Yangi suhbat"
    let updatedTitle = currentChat.title;
    if (updatedTitle === "Yangi suhbat") {
      updatedTitle = text.substring(0, 24) + (text.length > 24 ? "..." : "");
    }

    let updatedList = targetConversations.map((c) => {
      if (c.id === currentActiveId) {
        return { ...c, title: updatedTitle, messages: updatedMessages };
      }
      return c;
    });

    setConversations(updatedList);
    saveToLocalStorage(updatedList);
    setIsGenerating(true);

    // 3. Perform backend API requests depending on mode
    try {
      if (currentMode === "image") {
        // --- IMAGE REJIMI ---
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, aspectRatio: options?.aspectRatio || "1:1" }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Rasm chizishda vaqtinchalik xatolik yuz berdi");
        }

        const data = await response.json();
        
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: text,
          imageUrl: data.imageUrl,
          timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
          mode: "image",
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        const finalList = updatedList.map((c) => {
          if (c.id === currentActiveId) {
            return { ...c, messages: finalMessages };
          }
          return c;
        });
        setConversations(finalList);
        saveToLocalStorage(finalList);

      } else if (currentMode === "voice") {
        // --- OVOZ REJIMI ---
        // Instantly generate synthesized voice of whatever they typed, or chat then read
        const response = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: selectedVoice }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Ovoz sintez qilishda xatolik");
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Kiritilgan matn muvaffaqiyatli ravishda **${selectedVoice}** ovoziga sintezlandi. Uni quyidagi pleyer orqali tinglashingiz va yuklab olishingiz mumkin.`,
          audioUrl: data.audioUrl,
          timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
          mode: "voice",
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        const finalList = updatedList.map((c) => {
          if (c.id === currentActiveId) {
            return { ...c, messages: finalMessages };
          }
          return c;
        });
        setConversations(finalList);
        saveToLocalStorage(finalList);

      } else {
        // --- CHAT REJIMI (STREAMING) ---
        // Place initial empty assistant message to stream into
        const assistantMsgId = crypto.randomUUID();
        const placeholderMsg: Message = {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
          mode: "chat",
        };

        let activeMessages = [...updatedMessages, placeholderMsg];
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentActiveId) {
              return { ...c, messages: activeMessages };
            }
            return c;
          })
        );

        const response = await fetch("/api/chat-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages, // send user prompt history
            systemPrompt,
          }),
        });

        if (!response.ok) {
          throw new Error("Chat stream xizmati bilan ulanib bo'lmadi");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        if (!reader) throw new Error("Oqimni o'qib bo'lmadi.");

        let fullTextContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const cleanedLine = line.slice(6).trim();
              if (cleanedLine === "[DONE]") {
                break;
              }
              try {
                const parsed = JSON.parse(cleanedLine);
                if (parsed.text) {
                  fullTextContent += parsed.text;
                  
                  // Incremental update of React state for real-time typing effect
                  setConversations((prev) =>
                    prev.map((c) => {
                      if (c.id === currentActiveId) {
                        return {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantMsgId ? { ...m, content: fullTextContent } : m
                          ),
                        };
                      }
                      return c;
                    })
                  );
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // skip broken JSON chunks
              }
            }
          }
        }

        // Save completed stream state to localStorage
        const latestRawState = conversations.map((c) => {
          if (c.id === currentActiveId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, content: fullTextContent } : m
              ),
            };
          }
          return c;
        });
        saveToLocalStorage(latestRawState);
      }
    } catch (err: any) {
      console.error(err);
      
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `**Tizim xatoligi:** ${err.message || "Ulanish xatosi. Secrets qismida GEMINI_API_KEY sozlangani yoki server holatini tekshiring."}`,
        timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentActiveId) {
            return { ...c, messages: [...c.messages.filter((m) => m.content !== ""), errorMsg] };
          }
          return c;
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const activeChat = conversations.find((c) => c.id === activeId);
  const activeMessages = activeChat ? activeChat.messages : [];

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* Structural Sidebar component */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={handleNewConversation}
        currentMode={currentMode}
        onChangeMode={setCurrentMode}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Right Side Working Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header Nav Trigger */}
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-900 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-slate-900 text-slate-300 rounded-xl hover:text-white transition cursor-pointer"
            title="Menu ochish"
          >
            <SidebarIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
            <span className="font-bold text-xs tracking-tight text-white uppercase">VeloxAI</span>
          </div>

          <div className="w-9 h-9"></div> {/* spacing helper */}
        </div>

        {/* Core Chat Area layout */}
        <ChatArea
          messages={activeMessages}
          currentMode={currentMode}
          onChangeMode={setCurrentMode}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          systemPrompt={systemPrompt}
          onChangeSystemPrompt={setSystemPrompt}
        />
      </main>
    </div>
  );
}
