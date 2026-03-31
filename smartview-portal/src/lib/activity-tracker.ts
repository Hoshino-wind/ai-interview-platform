"use client";

export interface CodingEvent {
  type: 'keystroke' | 'paste' | 'tab_away' | 'tab_return' | 'run_code' | 'snapshot' | 'undo' | 'redo';
  timestamp: number;
  data: Record<string, unknown>;
}

export class ActivityTracker {
  private events: CodingEvent[] = [];
  private keystrokeCount = 0;
  private keystrokeTimer: ReturnType<typeof setTimeout> | null = null;
  private tabAwayTime: number | null = null;
  private onFlush: (events: CodingEvent[]) => void;
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private visibilityHandler: (() => void) | null = null;

  constructor(onFlush: (events: CodingEvent[]) => void) {
    this.onFlush = onFlush;
  }

  // 启动追踪
  start() {
    // 每 30 秒批量上传
    this.flushInterval = setInterval(() => this.flush(), 30000);
    
    // 监听 Tab 切换
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.tabAwayTime = Date.now();
        this.addEvent('tab_away', {});
      } else {
        const duration = this.tabAwayTime ? Date.now() - this.tabAwayTime : 0;
        this.addEvent('tab_return', { duration, durationSeconds: Math.round(duration / 1000) });
        this.tabAwayTime = null;
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  // 停止追踪
  stop() {
    if (this.flushInterval) clearInterval(this.flushInterval);
    if (this.keystrokeTimer) clearTimeout(this.keystrokeTimer);
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    this.flush(); // 最后一次上传
  }

  // 记录按键（每 5 秒聚合一次）
  trackKeystroke() {
    this.keystrokeCount++;
    if (!this.keystrokeTimer) {
      this.keystrokeTimer = setTimeout(() => {
        if (this.keystrokeCount > 0) {
          this.addEvent('keystroke', { count: this.keystrokeCount });
          this.keystrokeCount = 0;
        }
        this.keystrokeTimer = null;
      }, 5000);
    }
  }

  // 记录粘贴事件
  trackPaste(content: string) {
    this.addEvent('paste', {
      length: content.length,
      contentPreview: content.substring(0, 100),
      lineCount: content.split('\n').length,
    });
  }

  // 记录代码运行
  trackRunCode(success: boolean, testsPassed: number, totalTests: number) {
    this.addEvent('run_code', { success, testsPassed, totalTests });
  }

  // 记录代码快照
  trackSnapshot(code: string) {
    this.addEvent('snapshot', {
      lineCount: code.split('\n').length,
      charCount: code.length,
      // 不存储完整代码到 events，代码已在 submission 中保存
    });
  }

  // 记录撤销/重做
  trackUndo() { this.addEvent('undo', {}); }
  trackRedo() { this.addEvent('redo', {}); }

  private addEvent(type: CodingEvent['type'], data: Record<string, unknown>) {
    this.events.push({ type, timestamp: Date.now(), data });
  }

  private flush() {
    if (this.events.length > 0) {
      this.onFlush([...this.events]);
      this.events = [];
    }
  }

  // 获取当前所有事件（用于最终提交）
  getAllEvents(): CodingEvent[] {
    return [...this.events];
  }
}
