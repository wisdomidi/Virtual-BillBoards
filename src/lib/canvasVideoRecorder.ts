/**
 * Canvas Video Clip Recorder
 * Captures 15-second high-definition WebM/MP4 video clips of the 3D billboard with the active ad
 * for viral sharing across X (Twitter), TikTok, YouTube Shorts, and Instagram Reels.
 */

export interface VideoRecordingResult {
  blob: Blob;
  url: string;
  downloadFilename: string;
  durationSeconds: number;
}

export class BillboardVideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;

  /**
   * Start recording the billboard canvas
   * @param canvas HTMLCanvasElement (The Three.js rendering canvas or ad preview)
   * @param durationMs Duration to record (default 15,000ms / 15 seconds)
   * @param onProgress Callback receiving percentage progress (0 to 100)
   */
  public async recordCanvas(
    canvas: HTMLCanvasElement,
    durationMs: number = 15000,
    onProgress?: (progressPct: number) => void
  ): Promise<VideoRecordingResult> {
    return new Promise((resolve, reject) => {
      try {
        if (!canvas) {
          throw new Error('Canvas element not found for recording');
        }

        const stream = canvas.captureStream ? canvas.captureStream(30) : (canvas as any).mozCaptureStream?.(30);
        if (!stream) {
          throw new Error('Browser does not support canvas stream capture');
        }

        // Determine supported mime type
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
        }

        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
          videoBitsPerSecond: 4000000 // 4 Mbps high definition
        });

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        const startTime = Date.now();
        const intervalId = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(100, Math.round((elapsed / durationMs) * 100));
          onProgress?.(progress);
        }, 200);

        this.mediaRecorder.onstop = () => {
          clearInterval(intervalId);
          this.isRecording = false;
          const blob = new Blob(this.recordedChunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const downloadFilename = `livebillboard-takeover-${Date.now()}.webm`;

          resolve({
            blob,
            url,
            downloadFilename,
            durationSeconds: Math.round(durationMs / 1000)
          });
        };

        this.isRecording = true;
        this.mediaRecorder.start(500); // 500ms chunks

        // Auto-stop at duration
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
          }
        }, durationMs);

      } catch (err) {
        this.isRecording = false;
        reject(err);
      }
    });
  }

  public stopEarly(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  public get recordingStatus(): boolean {
    return this.isRecording;
  }
}

export const billboardRecorder = new BillboardVideoRecorder();
