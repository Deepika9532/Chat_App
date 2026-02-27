// Advanced WebRTC Hooks
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { MediaManager } from '@/lib/webrtc/media';
import { WebRTCSignaling } from '@/lib/webrtc/signaling';

interface CallState {
  isCalling: boolean;
  isReceiving: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: 'audio' | 'video' | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'failed';
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useWebRTC = (conversationId: string) => {
  const { getToken } = useAuth();
  const [callState, setCallState] = useState<CallState>({
    isCalling: false,
    isReceiving: false,
    localStream: null,
    remoteStream: null,
    callType: null,
    connectionStatus: 'disconnected',
    networkQuality: 'good'
  });
  
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [signaling, setSignaling] = useState<WebRTCSignaling | null>(null);

  // Initialize signaling
  useEffect(() => {
    const initSignaling = async () => {
      const token = await getToken();
      if (!token) return;
      
      const signal = new WebRTCSignaling('ws://localhost:8080');
      await signal.connect(token);
      setSignaling(signal);
    };
    
    initSignaling();
    
    return () => {
      signaling?.close();
    };
  }, [conversationId, getToken]);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers for production
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && signaling) {
        signaling.send({
          type: 'ice-candidate',
          candidate: event.candidate,
          conversationId
        });
      }
    };

    pc.ontrack = (event) => {
      setCallState(prev => ({
        ...prev,
        remoteStream: event.streams[0]
      }));
    };

    pc.onconnectionstatechange = () => {
      const statusMap: Record<string, CallState['connectionStatus']> = {
        'new': 'disconnected',
        'connecting': 'connecting',
        'connected': 'connected',
        'disconnected': 'disconnected',
        'failed': 'failed',
        'closed': 'disconnected'
      };
      
      setCallState(prev => ({
        ...prev,
        connectionStatus: statusMap[pc.connectionState] || 'disconnected'
      }));
    };

    setPeerConnection(pc);
    return pc;
  }, [signaling, conversationId]);

  // Start call
  const startCall = async (type: 'audio' | 'video') => {
    try {
      setCallState(prev => ({
        ...prev,
        isCalling: true,
        callType: type,
        connectionStatus: 'connecting'
      }));

      // Get media stream
      const stream = await MediaManager.getMediaStream(
        'high',
        type === 'video'
      );
      
      setCallState(prev => ({
        ...prev,
        localStream: stream
      }));

      // Create peer connection
      const pc = createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send offer via signaling
      signaling?.send({
        type: 'offer',
        offer,
        conversationId,
        callType: type
      });

    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
  };

  // Handle incoming call
  const handleIncomingCall = async (offer: any, type: 'audio' | 'video') => {
    try {
      setCallState(prev => ({
        ...prev,
        isReceiving: true,
        callType: type,
        connectionStatus: 'connecting'
      }));

      // Get media stream
      const stream = await MediaManager.getMediaStream(
        'high',
        type === 'video'
      );
      
      setCallState(prev => ({
        ...prev,
        localStream: stream
      }));

      // Create peer connection
      const pc = createPeerConnection();
      
      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      await pc.setRemoteDescription(offer);
      
      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      // Send answer via signaling
      signaling?.send({
        type: 'answer',
        answer,
        conversationId
      });

    } catch (error) {
      console.error('Error handling incoming call:', error);
      endCall();
    }
  };

  // End call
  const endCall = useCallback(() => {
    // Stop media tracks
    callState.localStream?.getTracks().forEach(track => track.stop());
    callState.remoteStream?.getTracks().forEach(track => track.stop());
    
    // Close peer connection
    peerConnection?.close();
    
    // Reset state
    setCallState({
      isCalling: false,
      isReceiving: false,
      localStream: null,
      remoteStream: null,
      callType: null,
      connectionStatus: 'disconnected',
      networkQuality: 'good'
    });
    
    setPeerConnection(null);
  }, [callState.localStream, callState.remoteStream, peerConnection]);

  // Monitor network quality
  useEffect(() => {
    if (!peerConnection) return;
    
    const monitorQuality = () => {
      peerConnection.getStats().then(stats => {
        let packetLoss = 0;
        let jitter = 0;
        
        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            packetLoss = report.packetsLost / (report.packetsReceived + report.packetsLost);
            jitter = report.jitter || 0;
          }
        });
        
        // Determine quality based on metrics
        let quality: CallState['networkQuality'] = 'good';
        if (packetLoss > 0.1 || jitter > 100) {
          quality = 'poor';
        } else if (packetLoss > 0.05 || jitter > 50) {
          quality = 'fair';
        } else if (packetLoss < 0.01) {
          quality = 'excellent';
        }
        
        setCallState(prev => ({
          ...prev,
          networkQuality: quality
        }));
        
        // Adjust bitrate based on quality
        if (quality === 'poor') {
          const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            MediaManager.adjustBitrate(sender, 500000); // 500kbps
          }
        }
      });
    };
    
    const interval = setInterval(monitorQuality, 2000);
    return () => clearInterval(interval);
  }, [peerConnection]);

  return {
    ...callState,
    startCall,
    handleIncomingCall,
    endCall,
    peerConnection
  };
};