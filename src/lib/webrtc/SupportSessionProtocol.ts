import { supabase } from '../supabase';

export type SignalMessage = 
  | { type: 'offer'; data: RTCSessionDescriptionInit; sender: 'tenant' | 'admin' }
  | { type: 'answer'; data: RTCSessionDescriptionInit; sender: 'tenant' | 'admin' }
  | { type: 'ice-candidate'; data: RTCIceCandidateInit; sender: 'tenant' | 'admin' };

export class SupportSessionProtocol {
  private peerConnection: RTCPeerConnection | null = null;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private role: 'tenant' | 'admin';
  private sessionCode: string;

  public onTrack?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;

  constructor(sessionCode: string, role: 'tenant' | 'admin') {
    this.sessionCode = sessionCode;
    this.role = role;
  }

  public async initialize(localStream?: MediaStream) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // 1. Setup Data/Track Listeners
    if (this.role === 'admin') {
      this.peerConnection.ontrack = (event) => {
        if (this.onTrack) {
          this.onTrack(event.streams[0]);
        }
      };
    }

    if (localStream && this.role === 'tenant') {
      localStream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, localStream);
        }
      });
    }

    // 2. Setup ICE Candidate Broadcasting
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          sender: this.role,
          data: event.candidate.toJSON()
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange && this.peerConnection) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    // 3. Setup Supabase Realtime Signaling Channel
    this.channel = supabase.channel(`support_session_${this.sessionCode}`);

    this.channel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
      const signal = payload as SignalMessage;
      
      // Ignore echoes from self
      if (signal.sender === this.role) return;

      if (!this.peerConnection) return;

      try {
        if (signal.type === 'offer' && this.role === 'admin') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.sendSignal({ type: 'answer', sender: 'admin', data: answer });
        } 
        else if (signal.type === 'answer' && this.role === 'tenant') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data));
        } 
        else if (signal.type === 'ice-candidate') {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.data));
        }
      } catch (err) {
        console.error('WebRTC Signaling Error:', err);
      }
    });

    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && this.role === 'tenant') {
        // Tenant initiates the offer once channel is locked
        this.createOffer();
      }
    });
  }

  private async createOffer() {
    if (!this.peerConnection) return;
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });
      await this.peerConnection.setLocalDescription(offer);
      this.sendSignal({ type: 'offer', sender: 'tenant', data: offer });
    } catch (err) {
      console.error('Failed to create Offer:', err);
    }
  }

  private sendSignal(message: SignalMessage) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: message
      });
    }
  }

  public disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
