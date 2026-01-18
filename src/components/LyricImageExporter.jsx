import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import './LyricImageExporter.css';

/**
 * LyricImageExporter
 * Props:
 *  - lyrics: string
 *  - filename: string (default 'lyrics.png')
 *  - watermark: string (default 'RapGen')
 */
export default function LyricImageExporter({
  lyrics = '',
  filename = 'lyrics.png',
  watermark = 'RapGen',
}) {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!lyrics || !cardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      // ensure fonts loaded
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const original = cardRef.current;
      const clone = original.cloneNode(true);

      // Make clone expand to full content height and keep it off-screen
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = original.offsetWidth + 'px';
      clone.style.maxHeight = 'none';
      clone.style.height = 'auto';
      clone.style.overflow = 'visible';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });

      // watermark
      try {
        const ctx = canvas.getContext('2d');
        ctx.save();
        const padding = Math.round(12 * (window.devicePixelRatio || 1));
        const fontSize = Math.round(14 * (window.devicePixelRatio || 1));
        ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.globalAlpha = 0.6;
        const text = watermark || 'RapGen';
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, canvas.width - textWidth - padding, canvas.height - padding);
        ctx.restore();
      } catch (e) {
        console.warn('watermark draw failed', e);
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Export failed');
          clone.remove();
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'lyrics.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/png');

      clone.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed — check console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="lyric-export-wrapper">
      <div ref={cardRef} className="lyric-card" aria-live="polite">
        <div className="lyric-header">RapGen</div>
        <div className="lyric-text">{lyrics || 'Your lyrics will appear here...'}</div>
        <div className="lyric-footer">— exported from RapGen</div>
      </div>

      <div className="export-controls">
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={isExporting || !lyrics}
          aria-disabled={isExporting || !lyrics}
        >
          {isExporting ? 'Exporting…' : 'Export as PNG'}
        </button>
      </div>
    </div>
  );
}
