import React, { useEffect, useRef } from "react";
import { getAudioAnalyser } from "../utils/synth";

interface WaveformVisualizerProps {
  isPlaying: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-resolution dimensions for crisp retina rendering
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    
    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(canvas);

    // Byte arrays for Web Audio analyser
    const analyser = getAudioAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear with elegant deep dark blue backdrop with a very slight motion trail
      ctx.fillStyle = "rgba(11, 15, 25, 0.28)"; 
      ctx.fillRect(0, 0, width, height);

      const dpr = window.devicePixelRatio || 1;
      ctx.scale(dpr, dpr);

      const displayWidth = width / dpr;
      const displayHeight = height / dpr;
      const centerY = displayHeight / 2;

      // Check if actual sound is playing
      let hasSound = false;
      let totalAmplitude = 0;

      if (isPlaying && analyser) {
        analyser.getByteTimeDomainData(dataArray);
        // Calculate average amplitude variance from 128 (center of 8-bit signal)
        for (let i = 0; i < bufferLength; i++) {
          const val = dataArray[i];
          const offset = Math.abs(val - 128);
          totalAmplitude += offset;
        }
        // If there's genuine sound energy
        if (totalAmplitude > 10) {
          hasSound = true;
        }
      }

      ctx.beginPath();
      ctx.lineWidth = 1.75;

      if (hasSound && analyser) {
        // Draw actual real-time Web Audio waveform
        // Create an orange/amber neon gradient for the stroke
        const gradient = ctx.createLinearGradient(0, 0, displayWidth, 0);
        gradient.addColorStop(0, "rgba(245, 158, 11, 0.4)");  // Soft amber
        gradient.addColorStop(0.3, "rgba(245, 158, 11, 0.955)"); // Intense amber glow point
        gradient.addColorStop(0.7, "rgba(251, 191, 36, 0.955)"); // Warm golden core
        gradient.addColorStop(1, "rgba(245, 158, 11, 0.4)");  // Soft amber
        ctx.strokeStyle = gradient;

        // Apply a glowing neon shadow for high-end aesthetic
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(245, 158, 11, 0.7)";

        const sliceWidth = displayWidth / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // Normalize 8-bit signal [0, 255] around 0
          const v = dataArray[i] / 128.0; 
          // Center-bias to smooth edges nice and symmetrically
          const edgeCurve = Math.sin((i / (bufferLength - 1)) * Math.PI);
          const yOffset = (v - 1.0) * (displayHeight * 0.45) * edgeCurve;
          const y = centerY + yOffset;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Bezier-like smooth curve interpolation
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
      } else {
        // Calm, elegant, breathing ambient sinusoidal wave when idle/quiet
        phaseRef.current += isPlaying ? 0.08 : 0.035; // slightly faster breathe if playing but waiting for tick
        const gradient = ctx.createLinearGradient(0, 0, displayWidth, 0);
        gradient.addColorStop(0, "rgba(75, 85, 99, 0.15)"); // soft idle gray
        gradient.addColorStop(0.5, isPlaying ? "rgba(245, 158, 11, 0.38)" : "rgba(107, 114, 128, 0.35)"); // ambient orange glow if engine active but idle
        gradient.addColorStop(1, "rgba(75, 85, 99, 0.15)");
        ctx.strokeStyle = gradient;

        // Fainter shadow
        ctx.shadowBlur = isPlaying ? 4 : 2;
        ctx.shadowColor = isPlaying ? "rgba(245, 158, 11, 0.3)" : "rgba(107, 114, 128, 0.2)";

        const segments = 60;
        const sliceWidth = displayWidth / segments;
        let x = 0;

        for (let i = 0; i <= segments; i++) {
          const ratio = i / segments;
          const edgeCurve = Math.sin(ratio * Math.PI); // Pin ends to zero so it fits perfectly
          
          // Generate dual overlaid harmonics for organic wavelike motion
          const wave1 = Math.sin(ratio * Math.PI * 2.5 + phaseRef.current) * 3.5;
          const wave2 = Math.cos(ratio * Math.PI * 4.0 - phaseRef.current * 0.7) * 1.5;
          const y = centerY + (wave1 + wave2) * edgeCurve * (isPlaying ? 1.6 : 1.0);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
      }

      ctx.stroke();

      // Reset transforms and shadow configuration
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-[54px] rounded-xl overflow-hidden border border-gray-900/40 bg-[#090d16] p-[1px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
      {/* Decorative subtle overlay grid to simulate high-tech synth display */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.015)_1px,transparent_1px)] bg-[size:10px_8px] pointer-events-none" />
      
      {/* Inner status text */}
      <div className="absolute right-2 top-1.5 pointer-events-none flex items-center gap-1">
        <span className="text-[6.5px] font-mono uppercase tracking-widest text-gray-600">
          {isPlaying ? "Engine Live" : "Engine Standby"}
        </span>
        <div className={`w-1 h-1 rounded-full ${isPlaying ? "bg-amber-500 animate-ping" : "bg-gray-700"}`} />
      </div>

      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
        style={{ contentVisibility: "auto" }}
      />
    </div>
  );
};
