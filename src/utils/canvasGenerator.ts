import { SimpleCaptionResult } from '../types/CanvasText';

// 레이아웃 위치 타입
export type TextPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

// 텍스트 스타일 타입
export interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  opacity: number;
  padding: number;
  maxWidth: number;
  textAlign: 'left' | 'center' | 'right';
}

// AI 레이아웃 추천 결과
export interface AILayoutRecommendation {
  textPosition: TextPosition;
  fontSize: number;
  textColor: string;
  backgroundColor?: string;
  opacity: number;
  padding: number;
  reasoning: string;
}

// Canvas 생성 옵션
export interface CanvasOptions {
  imageFile: File;
  caption: string;
  hashtags: string[];
  aiLayout?: AILayoutRecommendation;
  customStyle?: Partial<TextStyle>;
  customPosition?: TextPosition;
}

// 이미지 압축 함수
function compressImageDataURI(dataURI: string, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // 비율 유지하면서 크기 조정
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // 압축된 이미지 반환
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataURI;
  });
}

// AI 기반 레이아웃 추천
export async function getAILayoutRecommendation(
  imageDataURI: string, 
  caption: string
): Promise<AILayoutRecommendation> {
  try {
    // 이미지 압축
    const compressedImage = await compressImageDataURI(imageDataURI, 800, 0.8);
    
    const response = await fetch('/api/ai-layout-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageDataURI: compressedImage,
        caption,
        style: 'modern', // 또는 사용자 선택 스타일
        targetAudience: 'general'
      })
    });

    if (!response.ok) {
      throw new Error('AI 레이아웃 추천 실패');
    }

    const result = await response.json();
    return result.recommendation;
  } catch (error) {
    console.error('AI 레이아웃 추천 오류:', error);
    // 기본값 반환
    return {
      textPosition: 'bottom-center',
      fontSize: 36,
      textColor: '#FFFFFF',
      backgroundColor: undefined,
      opacity: 0.9,
      padding: 20,
      reasoning: '기본 설정으로 적용되었습니다.'
    };
  }
}

// 위치를 Canvas 좌표로 변환
function getPositionCoordinates(
  position: TextPosition, 
  canvasWidth: number, 
  canvasHeight: number,
  textWidth: number,
  textHeight: number,
  padding: number
): { x: number; y: number } {
  const margin = padding;
  
  switch (position) {
    case 'top-left':
      return { x: margin, y: margin };
    case 'top-center':
      return { x: (canvasWidth - textWidth) / 2, y: margin };
    case 'top-right':
      return { x: canvasWidth - textWidth - margin, y: margin };
    case 'center-left':
      return { x: margin, y: (canvasHeight - textHeight) / 2 };
    case 'center':
      return { x: (canvasWidth - textWidth) / 2, y: (canvasHeight - textHeight) / 2 };
    case 'center-right':
      return { x: canvasWidth - textWidth - margin, y: (canvasHeight - textHeight) / 2 };
    case 'bottom-left':
      return { x: margin, y: canvasHeight - textHeight - margin };
    case 'bottom-center':
      return { x: (canvasWidth - textWidth) / 2, y: canvasHeight - textHeight - margin };
    case 'bottom-right':
      return { x: canvasWidth - textWidth - margin, y: canvasHeight - textHeight - margin };
    default:
      return { x: margin, y: margin };
  }
}

// 텍스트 줄바꿈 처리
function wrapText(
  ctx: CanvasRenderingContext2D, 
  text: string, 
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Canvas 이미지 생성
export async function generateCanvasImage(options: CanvasOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context를 생성할 수 없습니다.'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Canvas 크기 설정
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 배경 이미지 그리기
      ctx.drawImage(img, 0, 0);
      
      // AI 추천 또는 기본 스타일 적용
      const aiLayout = options.aiLayout || {
        textPosition: 'bottom-center',
        fontSize: 32,
        textColor: '#FFFFFF',
        backgroundColor: '#000000',
        opacity: 0.8,
        padding: 20,
        reasoning: '기본 설정'
      };
      
      // 사용자 커스터마이징 적용
      const finalStyle: TextStyle = {
        fontSize: options.customStyle?.fontSize || aiLayout.fontSize,
        fontFamily: options.customStyle?.fontFamily || 'Arial, sans-serif',
        color: options.customStyle?.color || aiLayout.textColor,
        backgroundColor: options.customStyle?.backgroundColor || aiLayout.backgroundColor,
        opacity: options.customStyle?.opacity || aiLayout.opacity,
        padding: options.customStyle?.padding || aiLayout.padding,
        maxWidth: options.customStyle?.maxWidth || canvas.width * 0.8,
        textAlign: options.customStyle?.textAlign || 'center'
      };
      
      const finalPosition = options.customPosition || aiLayout.textPosition;
      
      // 텍스트 스타일 설정
      ctx.font = `${finalStyle.fontSize}px ${finalStyle.fontFamily}`;
      ctx.textAlign = finalStyle.textAlign;
      ctx.fillStyle = finalStyle.color;
      
      // 텍스트 줄바꿈 처리
      const lines = wrapText(ctx, options.caption, finalStyle.maxWidth);
      
      // 텍스트 배경 그리기 (선택사항)
      if (finalStyle.backgroundColor) {
        const textMetrics = ctx.measureText(options.caption);
        const textWidth = Math.min(textMetrics.width, finalStyle.maxWidth);
        const textHeight = lines.length * finalStyle.fontSize * 1.2;
        
        const position = getPositionCoordinates(
          finalPosition,
          canvas.width,
          canvas.height,
          textWidth,
          textHeight,
          finalStyle.padding
        );
        
        ctx.globalAlpha = finalStyle.opacity;
        ctx.fillStyle = finalStyle.backgroundColor;
        ctx.fillRect(
          position.x - finalStyle.padding,
          position.y - finalStyle.padding,
          textWidth + finalStyle.padding * 2,
          textHeight + finalStyle.padding * 2
        );
        ctx.globalAlpha = 1;
      }
      
      // 텍스트 그리기
      const position = getPositionCoordinates(
        finalPosition,
        canvas.width,
        canvas.height,
        finalStyle.maxWidth,
        lines.length * finalStyle.fontSize * 1.2,
        finalStyle.padding
      );
      
      ctx.fillStyle = finalStyle.color;
      lines.forEach((line, index) => {
        const y = position.y + (index * finalStyle.fontSize * 1.2);
        ctx.fillText(line, position.x, y);
      });
      
      // 해시태그 추가 (선택사항)
      if (options.hashtags.length > 0) {
        const hashtagText = options.hashtags.join(' ');
        ctx.font = `${finalStyle.fontSize * 0.8}px ${finalStyle.fontFamily}`;
        ctx.fillStyle = finalStyle.color;
        
        const hashtagPosition = getPositionCoordinates(
          finalPosition,
          canvas.width,
          canvas.height,
          finalStyle.maxWidth,
          (lines.length + 1) * finalStyle.fontSize * 1.2,
          finalStyle.padding
        );
        
        ctx.fillText(hashtagText, hashtagPosition.x, hashtagPosition.y + lines.length * finalStyle.fontSize * 1.2);
      }
      
      // Canvas를 Data URL로 변환
      const dataURL = canvas.toDataURL('image/jpeg', 0.9);
      resolve(dataURL);
    };
    
    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };
    
    // File을 Data URL로 변환
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(options.imageFile);
  });
}

// 이미지 다운로드
export function downloadCanvasImage(dataURL: string, filename: string = 'staypost-image.jpg') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
