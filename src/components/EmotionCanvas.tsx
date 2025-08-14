import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { supabase } from "@/lib/supabase";
import { generateSeoMeta } from "@/utils/generateSeoMeta";
import { CanvasTextBlock } from "@/types/CanvasText";
import { wrapText, drawOutlinedText } from "@/utils/textLayout";

function fitOneLine(ctx: CanvasRenderingContext2D, text: string, maxW: number, fontPx: number) {
  let size = fontPx;
  ctx.font = `800 ${size}px Pretendard, system-ui`;
  if (ctx.measureText(text).width <= maxW) return { text, size };

  // 폰트 축소
  while (size > 26 && ctx.measureText(text).width > maxW) {
    size -= 2;
    ctx.font = `800 ${size}px Pretendard, system-ui`;
  }
  // 그래도 길면 말줄임
  while (ctx.measureText(text + '…').width > maxW && text.length > 2) {
    text = text.slice(0, -1);
  }
  return { text: text + '…', size };
}

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
  topText?: CanvasTextBlock;
  bottomText?: CanvasTextBlock;
}

const EmotionCanvas = forwardRef<HTMLCanvasElement, EmotionCanvasProps>(
  ({ imageUrl, caption, filter, topText, bottomText }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement, []);

    useEffect(() => {
      console.log('🎨 EmotionCanvas useEffect triggered');
      console.log('🎨 imageUrl:', imageUrl);
      console.log('🎨 caption:', caption);
      console.log('🎨 filter:', filter);
      console.log('🎨 topText:', topText);
      console.log('🎨 bottomText:', bottomText);
      
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

        // Set up text rendering context
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.textBaseline = 'top';

        // Draw top text (hook)
        if (topText?.text) {
          const t = topText;
          const maxW = (t.maxWidthPct ?? 0.9) * canvas.width / dpr;
          const fitted = fitOneLine(ctx, t.text, maxW, t.fontSize ?? 38);
          ctx.font = `800 ${fitted.size}px Pretendard, system-ui`;
          
          let x: number;
          if (t.align === 'center') {
            // 중앙 정렬: 텍스트의 실제 너비를 측정하여 정확한 중앙 위치 계산
            const textWidth = ctx.measureText(fitted.text).width;
            x = (canvas.width / dpr - textWidth) / 2;
          } else {
            // 왼쪽 정렬
            x = canvas.width / dpr * 0.05;
          }
          
          const y = 24;
          drawOutlinedText(ctx, fitted.text, x, y, t.withOutline ?? true);
          console.log('✅ Top text drawn successfully');
        }

        // Draw bottom CTA background (gradient for readability)
        if (bottomText?.text) {
          const b = bottomText;
          const linesCount = b.lineClamp ?? 3;
          const blockH = (b.fontSize ?? 26) * 1.35 * linesCount + 28;
          const y0 = canvas.height/dpr - blockH - 16;
          const grd = ctx.createLinearGradient(0, y0, 0, canvas.height/dpr);
          grd.addColorStop(0, 'rgba(0,0,0,0)');
          grd.addColorStop(1, 'rgba(0,0,0,0.38)');
          ctx.fillStyle = grd;
          ctx.fillRect(0, y0, canvas.width/dpr, blockH + 16);

          ctx.font = `${b.fontWeight ?? 600} ${b.fontSize ?? 26}px Pretendard, system-ui, sans-serif`;
          const maxW = (b.maxWidthPct ?? 0.9) * canvas.width / dpr;
          const lines = wrapText(ctx, b.text, maxW).slice(0, b.lineClamp ?? 3);
          
          let x: number;
          if (b.align === 'center') {
            // 중앙 정렬: 가장 긴 줄의 너비를 기준으로 중앙 위치 계산
            let maxLineWidth = 0;
            for (const line of lines) {
              const lineWidth = ctx.measureText(line).width;
              maxLineWidth = Math.max(maxLineWidth, lineWidth);
            }
            x = (canvas.width / dpr - maxLineWidth) / 2;
          } else {
            // 왼쪽 정렬
            x = canvas.width / dpr * 0.05;
          }
          
          let y = y0 + 16;
          for (const line of lines) {
            drawOutlinedText(ctx, line, x, y, b.withOutline ?? false);
            y += (b.fontSize ?? 26) * 1.25;
          }
          console.log('✅ Bottom text drawn successfully');
        }

        // Legacy caption support (fallback)
        if (caption && !topText?.text && !bottomText?.text) {
          console.log('📝 Drawing legacy caption:', caption);
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
          console.log('✅ Legacy caption drawn successfully');
        }
        
        console.log('🎨 Canvas drawing completed');
      };
      
      image.onerror = (error) => {
        console.error('❌ Image loading failed:', error);
      };
    }, [imageUrl, caption, filter, topText, bottomText]);

    return <canvas ref={canvasRef} className="w-full h-auto rounded-xl shadow-lg" />;
  }
);

export default EmotionCanvas;