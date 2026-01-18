import React, { useState, useRef } from "react";

const BEAT_PLACEHOLDERS = ["sad.mp3", "trapbeat.mp3", "splint.mp3"];

const BeatSelector = () => {
  const [selectedBeat, setSelectedBeat] = useState("");
  const audioRef = useRef(null);

  const changeBeat = (fileName) => {
    const beatPlayer = audioRef.current;
    if (!beatPlayer || !fileName) {
      return;
    }

    beatPlayer.src = `/beats/${fileName}`;
    beatPlayer.load();
    beatPlayer.play().catch(() => {
      // Autoplay might be blocked; ignore errors silently
    });
  };

  const handleSelect = (event) => {
    const { value } = event.target;
    setSelectedBeat(value);
    changeBeat(value);
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/5 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Beat Selector
          </p>
          <p className="text-xs text-white/50">
            Choose a beat to play instantly
          </p>
        </div>
      </div>

      <select
        value={selectedBeat}
        onChange={handleSelect}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
      >
        <option value="" disabled>
          Select a beat
        </option>
        {BEAT_PLACEHOLDERS.map((beat) => (
          <option key={beat} value={beat} className="bg-[#050f1f] text-white">
            {beat}
          </option>
        ))}
      </select>

      <audio
        id="beatPlayer"
        ref={audioRef}
        controls
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default BeatSelector;
