import '@testing-library/jest-dom';

// Canvas 모킹
Object.defineProperty(window, 'HTMLCanvasElement', {
  writable: true,
  value: class HTMLCanvasElement {
    getContext() {
      return {
        measureText: () => ({ width: 100 }),
        fillText: () => {},
        strokeText: () => {},
        fillRect: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        scale: () => {},
        font: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        textBaseline: 'top',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      };
    }
    get width() { return 800; }
    set width(value) {}
    get height() { return 800; }
    set height(value) {}
    get style() { return { width: '800px', height: '800px' }; }
  }
});

// Image 모킹
Object.defineProperty(window, 'Image', {
  writable: true,
  value: class Image {
    src = '';
    crossOrigin = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    
    constructor() {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    }
  }
});

// fetch 모킹
global.fetch = vi.fn();

// console 모킹 (테스트 중 로그 출력 방지)
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};
