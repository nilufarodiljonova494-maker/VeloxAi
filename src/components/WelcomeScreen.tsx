import { Sparkles, MessageSquare, Image, Volume2, ArrowRight, Lightbulb, Zap, Code } from "lucide-react";
import { AppMode } from "../types";

interface WelcomeScreenProps {
  currentMode: AppMode;
  onSelectSuggestion: (text: string) => void;
}

export default function WelcomeScreen({ currentMode, onSelectSuggestion }: WelcomeScreenProps) {
  const suggestions = {
    chat: [
      {
        icon: <Code className="h-4 w-4 text-indigo-400" />,
        title: "Dasturlash",
        desc: "CSS grid, JavaScript xatolarini tuzatish yoki API yozish namunalari",
        prompt: "Express.js frameworkida oddiy xavfsiz REST API yozish uchun to'liq namunaviy kod ber va qisqacha tushuntirib ber."
      },
      {
        icon: <Lightbulb className="h-4 w-4 text-amber-400" />,
        title: "Ijodiy fikrlash",
        desc: "Yangi loyihalar yoki YouTube videolari uchun qiziqarli g'oyalar",
        prompt: "Yangi texnologiyalar va sun'iy intellekt mavzusidagi blog uchun 5ta qiziqarli sarlavha va maqola g'oyalarini taklif qil."
      },
      {
        icon: <Zap className="h-4 w-4 text-cyan-400" />,
        title: "Ma'lumotlar / Tushuntirish",
        desc: "Murakkab ilmiy g'oyalarni sodda tarzda bayon qilish",
        prompt: "Kvant kompyuterlarining ishlash prinsipini 10 yoshli bolaga tushuntirgandek juda sodda tilda misollar bilan yozib ber."
      }
    ],
    image: [
      {
        icon: <Sparkles className="h-4 w-4 text-emerald-400" />,
        title: "Yorqin Tasvir",
        desc: "Kelajak shahri, uchar avtomobillar, ultra-batafsil",
        prompt: "Kelajakdagi neon chiroqlar bilan bezatilgan uchar mashinalari bor kiberpank uslubidagi o'ta mahobatli shahar tasviri."
      },
      {
        icon: <Image className="h-4 w-4 text-pink-400" />,
        title: "Fantaziya O'rmoni",
        desc: "Sehrli daraxtlar, daryolar bilan mistik manzara",
        prompt: "Sehrli o'rmondagi mitti mo'jizakor uy va uning atrofida taralayotgan sehrli tillarang nurli daryo tasviri, 3D render."
      },
      {
        icon: <Code className="h-4 w-4 text-cyan-400" />,
        title: "Kosmik sayohatchi",
        desc: "Astronavt, noma'lum sayyorada, retro-fentezi",
        prompt: "Astronavt yosh bolakay yangi sirli binafsharang sayyora yuzasida ulkan yulduzli osmonga tikilib turibdi, minimalist rasmi."
      }
    ],
    voice: [
      {
        icon: <Volume2 className="h-4 w-4 text-violet-400" />,
        title: "Erkak Ovozi (Kore)",
        desc: "O'zbek va inglizcha matnlarni o'qish uchun mukammal",
        prompt: "Olamda baxtli yashash sirlaridan biri - bu har bir tongni minnatdorchilik va tabassum bilan qarshi olishdir."
      },
      {
        icon: <Volume2 className="h-4 w-4 text-purple-400" />,
        title: "Ayol Ovozi (Zephyr)",
        desc: "Tez va mayin tilda gapirish rejimini xush ko'ruvchilarga",
        prompt: "Sun'iy intellekt texnologiyalari hayotimizni osonlashtirish va bizga ko'mak berish uchun yaratilgan eng ajoyib vositadir."
      }
    ]
  };

  const getModeTitle = () => {
    switch (currentMode) {
      case 'image':
        return {
          title: "Velox Tasvir Yaratuvchisi",
          desc: "Xohlagan g'oyangizni yozing va Gemini sizga ajoyib, yuqori sifatli rasm chizib beradi.",
          badge: "Tasvir Rejimi",
          badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        };
      case 'voice':
        return {
          title: "Velox Ovoz Sintezatori",
          desc: "Xohlagan matningizni yozing va uni real vaqtda haqiqiy ovoz qilib tinglang.",
          badge: "Ovoz Rejimi",
          badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20"
        };
      default:
        return {
          title: "VeloxAI Sun'iy Intellekti suhbati",
          desc: "Sizga kod yozishda, hikoyalar tuzishda yoki turli fanlarga oid savollarga javob topishda ko'maklashadi.",
          badge: "Suhbat Rejimi",
          badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
        };
    }
  };

  const modeDetails = getModeTitle();
  const list = suggestions[currentMode] || suggestions.chat;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
      {/* Sparkle Icon with pulsing ring */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-indigo-500/15 blur-xl animate-pulse"></div>
        <div className="relative h-16 w-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
          {currentMode === 'image' ? (
            <Image className="h-8 w-8 text-cyan-400" />
          ) : currentMode === 'voice' ? (
            <Volume2 className="h-8 w-8 text-violet-400" />
          ) : (
            <Sparkles className="h-8 w-8 text-indigo-400" />
          )}
        </div>
      </div>

      {/* Mode Badge */}
      <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border mb-4 inline-block ${modeDetails.badgeColor}`}>
        {modeDetails.badge}
      </span>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
        Qanday yordam bera olaman?
      </h2>
      <p className="text-sm md:text-base text-slate-400 max-w-xl leading-relaxed mb-12">
        {modeDetails.desc}
      </p>

      {/* Suggested prompts list */}
      <div className="w-full space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <Lightbulb className="h-4 w-4" />
          <span>Namuna so'rovlar (Tanlash uchun bosing):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelectSuggestion(item.prompt)}
              className="group text-left p-5 bg-slate-950 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 transition-all duration-300 rounded-2xl cursor-pointer shadow-xs hover:shadow-lg hover:shadow-indigo-500/[0.02]"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-900 group-hover:bg-slate-850 rounded-xl transition duration-300 shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition duration-300">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-all duration-300 ml-auto translate-x-1 opacity-0 group-hover:opacity-100 shrink-0 self-center" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
