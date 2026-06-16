import React, { useState, useEffect } from "react";
import { SavedIdea } from "../types";
import { Copy, Trash2, FolderOpen, Save, FileText, Check, AlertCircle } from "lucide-react";

interface IdeaLibraryProps {
  // Callback trigger to reload ideas
  refreshTrigger: number;
}

export const IdeaLibrary: React.FC<IdeaLibraryProps> = ({ refreshTrigger }) => {
  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [editableNotes, setEditableNotes] = useState<string>("");

  useEffect(() => {
    loadIdeas();
  }, [refreshTrigger]);

  const loadIdeas = () => {
    try {
      const stored = localStorage.getItem("vibetheory_ideas");
      if (stored) {
        const parsed = JSON.parse(stored) as SavedIdea[];
        setIdeas(parsed);
        if (parsed.length > 0 && !activeIdeaId) {
          setActiveIdeaId(parsed[0].id);
          setEditableNotes(parsed[0].notes || "");
        }
      } else {
        setIdeas([]);
      }
    } catch (err) {
      console.error("Failed to load ideas:", err);
    }
  };

  const handleDeleteIdea = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = ideas.filter(i => i.id !== id);
      localStorage.setItem("vibetheory_ideas", JSON.stringify(updated));
      setIdeas(updated);
      if (activeIdeaId === id) {
        if (updated.length > 0) {
          setActiveIdeaId(updated[0].id);
          setEditableNotes(updated[0].notes || "");
        } else {
          setActiveIdeaId(null);
          setEditableNotes("");
        }
      }
    } catch (err) {
      console.error("Failed to delete idea:", err);
    }
  };

  const handleSaveNotes = () => {
    if (!activeIdeaId) return;
    try {
      const updated = ideas.map(i => {
        if (i.id === activeIdeaId) {
          return { ...i, notes: editableNotes };
        }
        return i;
      });
      localStorage.setItem("vibetheory_ideas", JSON.stringify(updated));
      setIdeas(updated);
      alert("Deine Notizen wurden erfolgreich gespeichert!");
    } catch (err) {
      console.error("Failed to save draft notes:", err);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAsTxtFile = (idea: SavedIdea) => {
    try {
      const blob = new Blob([idea.exportText + `\n\nPersönliche Notizen:\n${idea.notes || "Keine Notizen"}`], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VibeTheory_Idee_${idea.moodId}_${idea.key.replace(" ", "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export txt file:", err);
    }
  };

  const activeIdeaChange = (id: string) => {
    setActiveIdeaId(id);
    const idea = ideas.find(i => i.id === id);
    setEditableNotes(idea?.notes || "");
  };

  const activeIdea = ideas.find(i => i.id === activeIdeaId);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl" id="idea-library-section">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="text-violet-400" size={20} />
        <h3 className="text-lg font-sans font-semibold text-white">Meine Vibe-Bibliothek (Ideenexport)</h3>
      </div>

      <p className="text-sm text-gray-300 mb-5">
        Deine eigene Songskizzen-Bibliothek. Alle hier gespeicherten Ideen liegen lokal in deinem Browser. Exportiere sie
        einfach als Textdatei oder halte deine Spielfortschritte handschriftlich fest.
      </p>

      {ideas.length === 0 ? (
        <div className="bg-gray-950 p-6 rounded-lg border border-dashed border-gray-850 flex flex-col items-center justify-center gap-2 text-gray-500">
          <AlertCircle size={24} className="text-gray-600" />
          <p className="text-xs font-mono">Noch keine Ideen gespeichert.</p>
          <p className="text-[10px] max-w-xs text-center leading-relaxed">
            Wähle links eine Stimmung, erstelle deine Akkorde oder dein Riff und klicke auf den Button &apos;Akkord-Idee lokal sichern&apos;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="idea-library-grids">
          
          {/* List Sidebar */}
          <div className="lg:col-span-5 space-y-2 max-h-96 overflow-y-auto pr-1">
            <span className="text-[10px] font-mono text-gray-500 block uppercase">Gespeicherte Songfunken:</span>
            {ideas.map((idea) => (
              <div
                key={idea.id}
                id={`idea-card-${idea.id}`}
                onClick={() => activeIdeaChange(idea.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center text-xs font-mono
                  ${activeIdeaId === idea.id
                    ? "bg-violet-950/20 border-violet-500/70 text-violet-300"
                    : "bg-gray-950 border-gray-850 text-gray-400 hover:border-gray-700 hover:text-white"
                  }`}
              >
                <div>
                  <span className="block font-bold text-gray-100 uppercase">{idea.moodName} ({idea.key})</span>
                  <span className="block text-[9px] text-gray-500 mt-0.5">{new Date(idea.createdAt).toLocaleString("de-DE")}</span>
                </div>
                <button
                  id={`del-idea-${idea.id}`}
                  onClick={(e) => handleDeleteIdea(idea.id, e)}
                  className="p-1 text-gray-600 hover:text-red-400 rounded transition-all shrink-0"
                  title="Idee löschen"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Active Detail Display */}
          {activeIdea && (
            <div className="lg:col-span-7 bg-gray-950 border border-gray-850 rounded-lg p-4 flex flex-col justify-between" id="active-idea-details">
              
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-900 pb-2 mb-3.5">
                  <h4 className="text-sm font-sans font-bold text-white uppercase tracking-tight">
                    Songfunke: {activeIdea.moodName} ({activeIdea.key})
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      id="copy-idea-btn"
                      onClick={() => handleCopyText(activeIdea.exportText, activeIdea.id)}
                      className="p-1 px-2 bg-indigo-950/40 hover:bg-indigo-600 border border-indigo-900/60 rounded text-[10px] text-indigo-300 hover:text-white flex items-center gap-1 font-mono transition-all"
                      title="Kopieren für DAW"
                    >
                      {copiedId === activeIdea.id ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedId === activeIdea.id ? "Kopiert!" : "Kopieren"}</span>
                    </button>

                    <button
                      id="export-txt-btn"
                      onClick={() => handleExportAsTxtFile(activeIdea)}
                      className="p-1 px-2 bg-emerald-950/40 hover:bg-emerald-600 border border-emerald-900/60 rounded text-[10px] text-emerald-300 hover:text-white flex items-center gap-1 font-mono transition-all"
                      title="Exportieren"
                    >
                      <FileText size={11} />
                      <span>Export TXT</span>
                    </button>
                  </div>
                </div>

                {/* Info summary */}
                <div className="space-y-3 mb-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Akkordverlauf:</span>
                    <span className="text-slate-250 font-bold block bg-gray-900 p-2 rounded border border-gray-850 text-center tracking-widest text-sm">
                      {activeIdea.chords.join(" – ")}
                    </span>
                  </div>

                  {/* Tiny notes pad */}
                  <div>
                    <span className="text-[10px] text-gray-500 block mb-1">Eigene Notizen zum Songentwurf:</span>
                    <textarea
                      id="idea-notepad"
                      value={editableNotes}
                      onChange={(e) => setEditableNotes(e.target.value)}
                      placeholder="Trage hier deine Fortschritte, Tempowünsche (z.B. Tremolo-Effekt dazuschalten, 120 bpm) oder Lyrics ein..."
                      className="w-full h-24 bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:border-violet-500 focus:outline-none resize-none leading-normal placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <button
                id="save-notes-btn"
                onClick={handleSaveNotes}
                className="w-full py-1.5 bg-violet-600 hover:bg-violet-750 text-white font-mono rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
              >
                <Save size={13} />
                <span>Eigene Notizen abspeichern</span>
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
