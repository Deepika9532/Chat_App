// Advanced Media Stream Management
export class MediaManager {
  private static readonly MediaConstraints = {
    highQuality: {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user'
      },
      audio: {
        sampleRate: 48000,
        channelCount: 2,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    },
    
    lowBandwidth: {
      video: {
        width: { max: 640 },
        height: { max: 480 },
        frameRate: { max: 15 },
        bitrate: 500000
      },
      audio: {
        sampleRate: 24000,
        channelCount: 1
      }
    }
  };

  static async getMediaStream(
    quality: 'high' | 'low' = 'high',
    includeVideo: boolean = true
  ): Promise<MediaStream> {
    const constraints = this.MediaConstraints[quality === 'high' ? 'highQuality' : 'lowBandwidth'];
    
    // Remove video if not needed
    const finalConstraints: any = { ...constraints };
    if (!includeVideo) {
      delete finalConstraints.video;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  static async getDeviceCapabilities(): Promise<any> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      // Get constraints from first video device
      if (videoDevices.length > 0) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities();
          stream.getTracks().forEach(track => track.stop());
          
          return {
            maxWidth: capabilities.width?.max || 1920,
            maxHeight: capabilities.height?.max || 1080,
            maxFrameRate: capabilities.frameRate?.max || 60,
            videoDevices: videoDevices.length,
            audioDevices: audioDevices.length
          };
        }
      }
    } catch (error) {
      console.error('Error getting device capabilities:', error);
    }
    
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      maxFrameRate: 60,
      videoDevices: 1,
      audioDevices: 1
    };
  }

  static adjustBitrate(sender: any, bitrate: number) {
    if (!sender) return;
    
    const parameters = sender.getParameters();
    if (parameters.encodings && parameters.encodings.length > 0) {
      parameters.encodings[0].maxBitrate = bitrate;
      sender.setParameters(parameters);
    }
  }
}