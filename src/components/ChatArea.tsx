import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Sparkles, Loader2, Image as ImageIcon, Volume2, Globe, Command, AlertCircle, Settings2, Trash2 } from "lucide-react";
import { Message, AppMode, VoiceOption } from "../types";
import WelcomeScreen from "./WelcomeScreen";
import MessageItem from "./MessageItem";

interface ChatAreaProps {
  messages: Message[];
  currentMode: AppMode;
  onChangeMode: (mode: AppMode) => void;
  onSendMessage: (content: string, options?: { aspectRatio?: string }) => void;
  isGenerating: boolean;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  systemPrompt: string;
  onChangeSystemPrompt: (prompt: string) => void;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: "Kore", name: "Kore (Erkak)", gender: "Erkak", description: "Chuqur va professional ovoz" },
  { id: "Zephyr", name: "Zephyr (Erkak)", gender: "Erkak", description: "Silliq va rasmiy ovoz" },
  { id: "Puck", name: "Puck (Ayol)", gender: "Ayol", description: "Yoqimli va mayin ovoz" },
  { id: "Charon", name: "Charon (Erkak)", gender: "Erkak", description: "Vazmin va aniq ovoz" },
  { id: "Fenrir", name: "Fenrir (Erkak)", gender: "Erkak", description: "G'ayratli va yorqin ovoz" },
];

const ASPECT_RATIOS = [
  { id: "1:1", label: "Kvadrat (1:1)" },
  { id: "16:9", label: "Keng (16:9)" },
  { id: "9:16", label: "Tik (9:16)" },
  { id: "3:4", label: "Portret (3:4)" },
  { id: "4:3", label: "Albom (4:3)" },
];

export default function ChatArea({
  messages,
  currentMode,
  onChangeMode,
  onSendMessage,
  isGenerating,
  selectedVoice,
  onSelectVoice,
  systemPrompt,
  onChangeSystemPrompt,
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    onSendMessage(input.trim(), { aspectRatio });
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getInputPlaceholder = () => {
    switch (currentMode) {
      case "image":
        return "Qanday rasm yaratasiz? e.g., 'O'rmonda chiroyli sehrli uy, 3D art'...";
      case "voice":
        return "Ovozli o'qish uchun istalgan matn yoki jumlani yozing...";
      default:
        return "VeloxAIdan biror narsa so'rang (masalan: 'Dunyodagi eng katta sayyora qaysi?')...";
    }
  };

  const handleSelectSuggestion = (prompt: string) => {
    setInput(prompt);
  };

  const handleResetSystemPrompt = () => {
    onChangeSystemPrompt("Siz VeloxAI ismli o'ta aqlli, tezkor va xushmuomala sun'iy intellekt yordamchisiz. Foydalanuvchining har qanday savollariga aniq, ravshan va har taraflama mukammal javob berasiz. Savollarga chiroyli tartibda, tushunarli qilish uchun markdown (ro'yxatlar, qalin matn, kod bloklari kabi) formatda javob bering.");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full relative overflow-hidden">
      {/* Top Header Controls bar */}
      <header className="px-6 py-4 bg-slate-950/90 border-b border-slate-900 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <h2 className="text-sm font-bold text-white capitalize select-none flex items-center gap-1.5">
              {currentMode === "chat" && "Suhbat Rejimi"}
              {currentMode === "image" && "Tasvirlar Rejimi"}
              {currentMode === "voice" && "Ovoz Sintezi"}
            </h2>
          </div>
          <span className="text-slate-700">|</span>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            {currentMode === "chat" && "Gemini 3.5-Flash bilan cheksiz muloqot"}
            {currentMode === "image" && "Gemini 2.5-Image bilan instant rasm chizish"}
            {currentMode === "voice" && "Gemini 3.1-TTS texnologiyalari"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Advanced config button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition duration-200 border cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              showSettings
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
            }`}
            title="Tizim Sozlamalari"
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden md:inline">Konfiguratsiya</span>
          </button>
        </div>
      </header>

      {/* Advanced System Instructions Drawer Panel */}
      {showSettings && (
        <div className="bg-slate-950 border-b border-slate-900 p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Command className="h-4 w-4 text-indigo-400" />
                Tizim Ko'rsatmalari (System Instruction)
              </h3>
              <p className="text-xs text-slate-500">
                AI o'zini qanday tutishini va qaysi tilda qanaqa javob berishini shu yerdan tahrirlang.
              </p>
            </div>
            <button
              onClick={handleResetSystemPrompt}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Asliga qaytarish
            </button>
          </div>

          <textarea
            value={systemPrompt}
            onChange={(e) => onChangeSystemPrompt(e.target.value)}
            className="w-full min-h-[80px] p-3 text-xs bg-slate-900 text-slate-300 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none transition font-sans leading-relaxed"
          />
        </div>
      )}

      {/* Main Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <WelcomeScreen
            currentMode={currentMode}
            onSelectSuggestion={handleSelectSuggestion}
          />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                selectedVoice={selectedVoice}
              />
            ))}

            {/* Simulated typing indicator */}
            {isGenerating && (
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-900/60 mr-12 block">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-semibold text-slate-400">VeloxAI javob qaytarmoqda...</p>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input controls form bottom bar */}
      <div className="p-4 md:p-6 bg-linear-to-t from-slate-950 via-slate-950 to-slate-950/40 sticky bottom-0 border-t border-slate-900/80">
        <div className="max-w-3xl mx-auto space-y-4">
          
          {/* Multi-mode control bar widgets */}
          {currentMode === "image" && (
            <div className="flex flex-wrap items-center gap-2 py-1 px-2.5 bg-slate-900/40 border border-slate-900 rounded-xl max-w-max">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 select-none">O'lcham:</span>
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                    aspectRatio === ratio.id
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          )}

          {currentMode === "voice" && (
            <div className="flex flex-wrap items-center gap-2 py-1 px-2.5 bg-slate-900/40 border border-slate-900 rounded-xl max-w-max">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 select-none">Sintez Ovoz:</span>
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => onSelectVoice(voice.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                    selectedVoice === voice.id
                      ? "bg-violet-600 text-white font-bold"
                      : "text-slate-400 hover:bg-slate-900"
                  }`}
                  title={voice.description}
                >
                  {voice.name}
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getInputPlaceholder()}
              rows={1}
              disabled={isGenerating}
              className="w-full pr-14 pl-5 py-4 bg-slate-900 border border-slate-800 focus:border-indigo-500/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner resize-none min-h-[52px]"
              style={{ maxHeight: "200px" }}
            />

            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className={`absolute right-3 p-2 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center ${
                !input.trim() || isGenerating
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : currentMode === "image"
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/10"
                  : currentMode === "voice"
                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/10"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
              }`}
              title="Yuborish"
            >
              {isGenerating ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Send className="h-4.5 w-4.5" />
              )}
            </button>
          </form>

          {/* Informative Footer Credits */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 leading-relaxed">
            <span>
              VeloxAI noto'g'ri axborot berishi mumkin. Muhim faktlarni tekshiring.
            </span>
            <span className="hidden sm:inline">
              Shift + Enter for break line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
