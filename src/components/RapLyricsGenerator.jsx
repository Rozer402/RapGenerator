import React, { useState, useRef, useEffect } from "react";
import {
  Music2,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  ChevronRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import BeatSelector from "./BeatSelector.jsx";
import LyricImageExporter from "./LyricImageExporter.jsx";

const presets = [
  {
    label: "Street Life",
    theme: "Street Life",
    mood: "Raw energy",
    length: "medium",
  },
  {
    label: "Ocean Vibes",
    theme: "Ocean Waves",
    mood: "Chill",
    length: "medium",
  },
  {
    label: "Success Story",
    theme: "Success",
    mood: "Motivational",
    length: "medium",
  },
];

const lengthOptions = [
  { value: "short", label: "Short (8 bars)" },
  { value: "medium", label: "Medium (16 bars)" },
  { value: "long", label: "Long (24 bars)" },
];

const fetchLyrics = async ({ theme, mood, length }) => {
  const response = await fetch("/api/lyrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme, mood, length }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || "Failed to generate lyrics");
  }

  const data = await response.json();
  return data.lyrics;
};

const RapLyricsGenerator = () => {
  const [formData, setFormData] = useState({
    theme: "",
    mood: "",
    length: "medium",
  });
  const [lyrics, setLyrics] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusText, setStatusText] = useState("Waiting for your cue...");
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [lineDuration, setLineDuration] = useState(0);
  const lineDurationRef = useRef(0);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.theme.trim() || !formData.mood.trim()) {
      setStatusText("Theme and mood are required.");
      return;
    }

    setIsGenerating(true);
    setStatusText("Crafting your flow...");
    setLyrics("");

    try {
      const generatedLyrics = await fetchLyrics(formData);
      setLyrics(generatedLyrics);
      setStatusText("Fresh bars ready.");
    } catch (error) {
      setStatusText(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!lyrics) {
      return;
    }
    await navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!lyrics) {
      return;
    }
    const blob = new Blob([lyrics], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rap-lyrics.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePreset = (preset) => {
    setFormData({
      theme: preset.theme,
      mood: preset.mood,
      length: preset.length,
    });
  };

  const handleReset = () => {
    setFormData({ theme: "", mood: "", length: "medium" });
    setLyrics("");
    setStatusText("Waiting for your cue...");
    setActiveLineIndex(-1);
    setLineDuration(0);
    lineDurationRef.current = 0;
  };

  // Lyric synchronization effect
  useEffect(() => {
    const audio = document.getElementById("beatPlayer");
    if (!audio || !lyrics) {
      setActiveLineIndex(-1);
      setLineDuration(0);
      lineDurationRef.current = 0;
      return;
    }

    // Split lyrics into lines, filtering empty lines
    const lyricLines = lyrics.split("\n").filter((line) => line.trim() !== "");

    if (lyricLines.length === 0) {
      setActiveLineIndex(-1);
      setLineDuration(0);
      lineDurationRef.current = 0;
      return;
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        const duration = audio.duration / lyricLines.length;
        lineDurationRef.current = duration;
        setLineDuration(duration);
      }
    };

    const handleTimeUpdate = () => {
      if (lineDurationRef.current > 0) {
        const currentIndex = Math.floor(audio.currentTime / lineDurationRef.current);
        const clampedIndex = Math.max(0, Math.min(currentIndex, lyricLines.length - 1));
        setActiveLineIndex(clampedIndex);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    // Check if metadata is already loaded
    if (audio.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [lyrics]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#04080f] via-[#050f1f] to-[#03060a] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-12">
        <header className="rounded-3xl border border-white/5 bg-white/5 px-8 py-10 shadow-[0_20px_120px_rgba(3,7,18,0.65)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3 text-green-400">
                <Music2 className="h-6 w-6" />
                <span className="text-sm uppercase tracking-[0.25em] text-white/70">
                  RapFlow AI
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Rap Lyrics Generator
              </h1>
              <p className="mt-3 text-lg text-white/70">
                Feed in a vibe, set the mood, and craft original bars with AI
                flair.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-4 text-sm text-emerald-200">
              <p className="font-semibold uppercase tracking-widest text-emerald-400">
                Status
              </p>
              <p className="mt-1 text-base text-white">{statusText}</p>
            </div>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <section className="space-y-6 rounded-3xl border border-white/5 bg-white/5 p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-white/70"
                  htmlFor="theme"
                >
                  Theme
                </label>
                <input
                  id="theme"
                  type="text"
                  value={formData.theme}
                  onChange={(event) =>
                    handleInputChange("theme", event.target.value)
                  }
                  placeholder="City nights, hustle, dreams..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-white/70"
                  htmlFor="mood"
                >
                  Mood
                </label>
                <input
                  id="mood"
                  type="text"
                  value={formData.mood}
                  onChange={(event) =>
                    handleInputChange("mood", event.target.value)
                  }
                  placeholder="Confident, mellow, gritty..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-white/70"
                  htmlFor="length"
                >
                  Length
                </label>
                <select
                  id="length"
                  value={formData.length}
                  onChange={(event) =>
                    handleInputChange("length", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                  disabled={isGenerating}
                >
                  {lengthOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#050f1f]"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-4 text-lg font-semibold text-[#020611] shadow-lg shadow-emerald-500/40 transition-all hover:translate-y-0.5 hover:shadow-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Crafting your flow...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    Generate Lyrics
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
              <header className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-emerald-300" />
                  <h2 className="text-lg font-semibold">Your Lyrics</h2>
                </div>

              <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!lyrics}
                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copied ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="h-4 w-4" />
                        Copy
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!lyrics}
                    className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Save
                    </span>
                  </button>
                <LyricImageExporter lyrics={lyrics} />
                </div>
              </header>

              <div className="rounded-2xl border border-white/5 bg-[#03070e] p-5">
                {isGenerating ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="h-4 animate-pulse rounded-full bg-white/10"
                        style={{ width: `${90 - index * 10}%` }}
                      />
                    ))}
                  </div>
                ) : lyrics ? (
                  <div className="space-y-2 font-mono text-sm leading-relaxed">
                    {lyrics
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((line, index) => {
                        const isActive = index === activeLineIndex;
                        return (
                          <div
                            key={index}
                            className={`transition-all duration-300 ${
                              isActive
                                ? "text-emerald-300 font-semibold opacity-100"
                                : "text-white/40 opacity-50"
                            }`}
                          >
                            {line}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-white/50">
                    <Music2 className="h-10 w-10 text-emerald-300/80" />
                    <p>No lyrics yet. Feed in a vibe and hit generate.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <BeatSelector />

            <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-300" />
                <h3 className="font-semibold">Quick Presets</h3>
              </div>
              <div className="space-y-3">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-emerald-400/60 hover:bg-emerald-400/10"
                  >
                    <p className="font-semibold text-white">{preset.label}</p>
                    <p className="text-sm text-white/60">
                      {preset.theme} • {preset.mood}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/10 to-white/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <Zap className="h-5 w-5 text-amber-300" />
                <h3 className="font-semibold">Pro Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex gap-3">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                  Blend unexpected themes for standout storytelling.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                  Push contrast between theme and mood for unique energy.
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                  Longer verses let you develop motifs and callbacks.
                </li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default RapLyricsGenerator;
