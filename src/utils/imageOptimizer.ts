interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

interface OptimizedImage {
  blob: Blob;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  compressionRatio: number;
}

export class ImageOptimizer {
  private static readonly DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg'
  };

  /**
   * 이미지를 최적화합니다
   */
  static async optimizeImage(
    file: File | Blob,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // 원본 크기 저장
          const originalWidth = img.width;
          const originalHeight = img.height;
          const originalSize = file.size;
          
          // 새로운 크기 계산
          const { width, height } = this.calculateDimensions(
            originalWidth,
            originalHeight,
            opts.maxWidth,
            opts.maxHeight
          );
          
          // 캔버스 크기 설정
          canvas.width = width;
          canvas.height = height;
          
          // 이미지 그리기
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 최적화된 이미지 생성
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressionRatio = 1 - (blob.size / originalSize);
                resolve({
                  blob,
                  width,
                  height,
                  size: blob.size,
                  originalSize,
                  compressionRatio
                });
              } else {
                reject(new Error('이미지 최적화에 실패했습니다.'));
              }
            },
            `image/${opts.format}`,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('이미지를 로드할 수 없습니다.'));
      };
      
      // 이미지 로드
      const url = URL.createObjectURL(file);
      img.src = url;
      
      // 메모리 정리
      img.onload = () => {
        URL.revokeObjectURL(url);
        img.onload = null;
      };
    });
  }

  /**
   * 이미지 크기를 계산합니다
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // 비율 유지하면서 크기 조정
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * 이미지 메타데이터를 추출합니다
   */
  static async getImageMetadata(file: File | Blob): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
    lastModified?: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const metadata = {
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          lastModified: file instanceof File ? file.lastModified : undefined
        };
        
        resolve(metadata);
      };
      
      img.onerror = () => {
        reject(new Error('이미지 메타데이터를 추출할 수 없습니다.'));
      };
      
      const url = URL.createObjectURL(file);
      img.src = url;
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        img.onload = null;
      };
    });
  }

  /**
   * 이미지가 최적화가 필요한지 확인합니다
   */
  static async needsOptimization(
    file: File | Blob,
    options: ImageOptimizationOptions = {}
  ): Promise<boolean> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const metadata = await this.getImageMetadata(file);
    
    // 크기나 품질 기준을 초과하는지 확인
    const isTooLarge = metadata.width > opts.maxWidth || metadata.height > opts.maxHeight;
    const isTooHeavy = file.size > 5 * 1024 * 1024; // 5MB
    
    return isTooLarge || isTooHeavy;
  }

  /**
   * 여러 이미지를 일괄 최적화합니다
   */
  static async optimizeImages(
    files: (File | Blob)[],
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage[]> {
    const results: OptimizedImage[] = [];
    
    for (const file of files) {
      try {
        const optimized = await this.optimizeImage(file, options);
        results.push(optimized);
      } catch (error) {
        console.error('이미지 최적화 실패:', error);
        // 실패한 경우 원본 반환
        const metadata = await this.getImageMetadata(file);
        results.push({
          blob: file,
          width: metadata.width,
          height: metadata.height,
          size: metadata.size,
          originalSize: metadata.size,
          compressionRatio: 0
        });
      }
    }
    
    return results;
  }

  /**
   * 이미지 품질을 점수로 평가합니다
   */
  static async assessImageQuality(file: File | Blob): Promise<{
    score: number;
    factors: string[];
  }> {
    const metadata = await this.getImageMetadata(file);
    const factors: string[] = [];
    let score = 100;
    
    // 해상도 평가
    const megapixels = (metadata.width * metadata.height) / 1000000;
    if (megapixels < 1) {
      score -= 20;
      factors.push('해상도가 낮습니다 (1MP 미만)');
    } else if (megapixels > 12) {
      score -= 10;
      factors.push('해상도가 너무 높습니다 (12MP 초과)');
    }
    
    // 파일 크기 평가
    const sizeMB = metadata.size / (1024 * 1024);
    if (sizeMB > 10) {
      score -= 30;
      factors.push('파일 크기가 큽니다 (10MB 초과)');
    } else if (sizeMB > 5) {
      score -= 15;
      factors.push('파일 크기가 큽니다 (5MB 초과)');
    }
    
    // 종횡비 평가
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio < 0.5 || aspectRatio > 2) {
      score -= 10;
      factors.push('종횡비가 적절하지 않습니다');
    }
    
    return {
      score: Math.max(0, score),
      factors
    };
  }
}
