import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const initAudio = () => {
      if (!contextRef.current) {
        // @ts-ignore - Handle webkit prefix if needed
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        contextRef.current = new AudioContextClass();
        
        analyserRef.current = contextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256; 
        
        if (audioRef.current) {
            try {
                sourceRef.current = contextRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(contextRef.current.destination);
            } catch (e) {
                console.warn("Visualizer connection issue:", e);
            }
        }
      }
    };

    if (isPlaying && !contextRef.current) {
        initAudio();
    }
    
    if (isPlaying && contextRef.current?.state === 'suspended') {
        contextRef.current.resume();
    }

    const render = () => {
      if (!analyserRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Style
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5; 

        // Gradient - Yellow to Transparent/Dark
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#FFD700'); // Agency Yellow
        gradient.addColorStop(1, '#947600'); // Darker Gold

        ctx.fillStyle = gradient;
        
        // Draw sharp bars for agency feel
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2; 
      }

      animationRef.current = requestAnimationFrame(render);
    };

    if (isPlaying) {
      render();
    } else {
        if(animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioRef]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={150} 
      className="w-full h-32 md:h-48 rounded-sm bg-agency-black/50 border border-agency-yellow/20 backdrop-blur-sm"
    />
  );
};

export default Visualizer;