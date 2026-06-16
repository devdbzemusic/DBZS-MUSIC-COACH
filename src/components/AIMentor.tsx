import React, { useState } from "react";
import { DIAGNOSTIC_ISSUES } from "../data/recipes";
import { DiagnosticIssue } from "../types";
import { Award, RefreshCcw, Heart, Send, Sparkles, MessageSquareHeart } from "lucide-react";
import Markdown from "react-markdown";

export const AIMentor: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DIAGNOSTIC_ISSUES[0].id);
  const [customIssue, setCustomIssue] = useState<string>("");
  const [instrument, setInstrument] = useState<"Gitarre" | "Bass" | "Piano">("Gitarre");
  const [mentorResponse, setMentorResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPreset = DIAGNOSTIC_ISSUES.find(d => d.id === selectedPresetId);

  // Parse and trigger the server API call to Gemini
  const handleRequestMentoring = async (isCustom: boolean) => {
    setLoading(true);
    setError(null);
    setMentorResponse("");

    const payload = isCustom
      ? {
          simulatedError: `Schüler meldet folgendes Problem beim Üben: "${customIssue}"`,
          issueTitle: "Individuelles Spielproblem",
          instrument,
        }
      : {
          simulatedError: selectedPreset?.simulatedError || "",
          issueTitle: selectedPreset?.title || "",
          instrument: selectedPreset?.instrument || "Gitarre",
        };

    try {
      const response = await fetch("/api/gemini/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Musik-Mentor antwortet gerade nicht. Fehlercode: " + response.status);
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else if (data.text) {
        setMentorResponse(data.text);
      } else {
        setError("Fehlerbehebung konnte nicht verstanden werden.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Es gab ein Problem beim Abfragen des Mentoring-Services.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl" id="ai-mentor-container">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareHeart className="text-pink-400" size={24} />
        <div>
          <h3 className="text-lg font-sans font-semibold text-white">AI Studio Mentor (Premium Feedback)</h3>
          <p className="text-xs text-gray-400">Empathische Diagnose & 1-Minuten-Mikro-Drills</p>
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-5">
        Unser Premium-Coach lauscht auf deine physischen Spielverzögerungen oder falsch angeschlagenen Noten und formuliert
        einen maßgeschneiderten Heilungs-Drill ohne jeglichen Schuld-Druck.
      </p>

      {/* Tabs / Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        
        {/* Presets Column */}
        <div className="bg-gray-950 p-4 border border-gray-850 rounded-lg flex flex-col justify-between" id="preset-tester-box">
          <div>
            <span className="text-xs font-mono text-pink-400 tracking-wider uppercase block mb-2.5">Fehler-Simulator ausführen:</span>
            <div className="space-y-2">
              {DIAGNOSTIC_ISSUES.map((issue) => (
                <button
                  key={issue.id}
                  id={`preset-${issue.id}`}
                  onClick={() => setSelectedPresetId(issue.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all flex items-start gap-2.5
                    ${selectedPresetId === issue.id
                      ? "bg-pink-500/10 border-pink-500/70 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.2)]"
                      : "bg-gray-900/60 border-gray-850 text-gray-400 hover:border-gray-700 hover:text-gray-300"
                    }`}
                >
                  <span className="px-1.5 py-0.5 bg-gray-950 text-[10px] rounded text-pink-400 font-bold tracking-wider shrink-0">
                    {issue.instrument}
                  </span>
                  <div>
                    <span className="block font-bold text-gray-200">{issue.title}</span>
                    <span className="block text-[10px] text-gray-500 mt-1 italic">{issue.simulatedError}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            id="start-preset-mentor"
            onClick={() => handleRequestMentoring(false)}
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono rounded-lg transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            <span>Fehler diagnostizieren & Drill anlegen</span>
          </button>
        </div>

        {/* Custom Input Column */}
        <div className="bg-gray-950 p-4 border border-gray-850 rounded-lg flex flex-col justify-between" id="custom-mentor-box">
          <div>
            <span className="text-xs font-mono text-purple-400 tracking-wider uppercase block mb-1">Eigene Hürde formulieren:</span>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">Beschreibe kurz eine physische Schwierigkeit auf deiner Gitarre, deinem Bass oder Klavier:</p>

            <div className="mb-3">
              <label className="text-[10px] font-mono text-gray-500 block uppercase mb-1">Instrument:</label>
              <div className="flex bg-gray-900 border border-gray-800 p-0.5 rounded text-xs">
                {(["Gitarre", "Bass", "Piano"] as const).map((inst) => (
                  <button
                    key={inst}
                    onClick={() => setInstrument(inst)}
                    className={`flex-1 py-1 rounded transition-all font-mono text-[10px] ${instrument === inst ? "bg-indigo-600 text-white" : "text-gray-400"}`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id="custom-mentor-input"
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
              placeholder="Schreibe z.B.: Ich stoße beim Zupfen der Bassgitarre immer an die D-Saite, wodurch ein hässliches Nebengeräusch entsteht... oder Ich krampfe ab dem 10. Bund..."
              className="w-full h-24 bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-gray-300 font-mono focus:border-indigo-500 focus:outline-none resize-none placeholder:text-gray-600 leading-normal"
            />
          </div>

          <button
            id="start-custom-mentor"
            onClick={() => handleRequestMentoring(true)}
            disabled={loading || !customIssue.trim()}
            className="w-full mt-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-mono rounded-lg transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40"
          >
            <Send size={13} />
            <span>Eigene Frage absenden</span>
          </button>
        </div>

      </div>

      {/* Mentor Report Display Card */}
      <div className="relative mt-5">
        {loading ? (
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-56 flex flex-col items-center justify-center gap-3">
            <Sparkles className="text-pink-400 animate-bounce" size={24} />
            <div className="w-48 bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full w-2/3 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-pink-400 font-mono uppercase tracking-widest text-center">
              Der Mentor analysiert dein Profil... <br />
              <span className="text-[10px] text-gray-500 normal-case">Suche optimale physiologische Blockadelöser</span>
            </p>
          </div>
        ) : mentorResponse ? (
          <div className="bg-[#0D0E15] border border-pink-950/40 rounded-xl p-5 shadow-inner transition-all duration-300 scale-100" id="mentor-response-card">
            
            <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-gray-800 shrink-0">
              <Award className="text-pink-400" size={16} />
              <span className="text-xs font-mono text-pink-400 uppercase font-bold">Diagnosebericht deines Haus-Mentors:</span>
            </div>

            <div className="text-xs text-gray-300 font-mono prose prose-invert max-w-none mt-1 leading-relaxed">
              <div className="markdown-body space-y-4">
                <Markdown>{mentorResponse}</Markdown>
              </div>
            </div>

            {/* Micro badge of encouragment */}
            <div className="mt-5 pt-3 border-t border-gray-850 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
              <Heart size={11} className="text-red-500 fill-red-500" />
              <span>Diagnose erstellt via Gemini 3.5-Flash.</span>
            </div>

          </div>
        ) : (
          <div className="bg-gray-900/40 border border-gray-850 border-dashed rounded-xl p-6 text-center text-gray-500 text-xs font-mono">
            Klicke oben links auf einen Preset-Fehler oder schreibe rechts eine eigene Frage, um ein personalisiertes Feedback des Mentors einzuholen.
          </div>
        )}

        {/* Error layer */}
        {error && (
          <div className="mt-2 text-xs text-red-400 bg-red-950/30 border border-red-900/40 p-2.5 rounded-lg">
            {error}
          </div>
        )}
      </div>

    </div>
  );
};
