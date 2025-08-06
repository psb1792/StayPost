import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { supabase } from "../lib/supabase";
import { generateSeoMeta } from "../utils/generateSeoMeta";

function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line); // 마지막 줄

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
}

interface EmotionCanvasProps {
  imageUrl: string | null;
  caption: string | null;
  filter?: string | null;
}

const EmotionCanvas = forwardRef<HTMLCanvasElement, EmotionCanvasProps>(
  ({ imageUrl, caption, filter }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement, []);

    useEffect(() => {
      console.log('🎨 EmotionCanvas useEffect triggered');
      console.log('🎨 imageUrl:', imageUrl);
      console.log('🎨 caption:', caption);
      console.log('🎨 filter:', filter);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      
      console.log('🎨 canvas element:', canvas);
      console.log('🎨 canvas context:', ctx);
      
      if (!canvas || !ctx) {
        console.log('❌ Canvas or context not available');
        return;
      }

      console.log('✅ Canvas loaded successfully');

      // Set default size
      const width = 800;
      const height = 800;
      canvas.width = width;
      canvas.height = height;

      console.log('🎨 Canvas size set to:', width, 'x', height);

      // Fill background
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);

      if (!imageUrl) {
        console.log('❌ No imageUrl provided');
        return;
      }
      
      console.log('🖼️ Loading image from URL:', imageUrl);
      
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.src = imageUrl;
      
      image.onload = () => {
        console.log('✅ Image loaded successfully');
        console.log('🎨 Drawing image with filter:', filter);
        
        // Draw image (cover)
        ctx.save();
        if (filter && filter !== "none") {
          ctx.filter = filter;
          console.log('🎨 Applied filter:', filter);
        }
        ctx.drawImage(image, 0, 0, width, height);
        ctx.restore();

        // Draw overlay for text readability
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, height - 200, width, 200);

        // Draw caption
        if (caption) {
          console.log('📝 Drawing caption:', caption);
          ctx.font = "bold 40px Nanum Gothic, sans-serif";
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Word wrap
          const maxWidth = width * 0.8;
          const lines: string[] = [];
          let line = "";
          const words = caption.split(" ");
          for (let i = 0; i < words.length; i++) {
            const testLine = line + (line ? " " : "") + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line) {
              lines.push(line);
              line = words[i];
            } else {
              line = testLine;
            }
          }
          if (line) lines.push(line);
          lines.forEach((l, idx) => {
            ctx.fillText(l, width / 2, height - 150 + idx * 48);
          });
          console.log('✅ Caption drawn successfully');
        } else {
          console.log('❌ No caption to draw');
        }
        
        console.log('🎨 Canvas drawing completed');
      };
      
      image.onerror = (error) => {
        console.error('❌ Image loading failed:', error);
      };
    }, [imageUrl, caption, filter]);

    return <canvas ref={canvasRef} className="w-full h-auto rounded-xl shadow-lg" />;
  }
);

export default EmotionCanvas;