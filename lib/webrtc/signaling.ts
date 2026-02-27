// WebSocket Signaling Server for WebRTC
export class WebRTCSignaling {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private messageQueue: any[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor(private serverUrl: string) {}
  
  connect(authToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.serverUrl);
      
      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Authenticate immediately
        this.send({
          type: 'authenticate',
          token: authToken
        });
        
        // Process queued messages
        this.messageQueue.forEach(msg => this.send(msg));
        this.messageQueue = [];
        
        resolve();
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing signaling message:', error);
        }
      };
      
      this.socket.onclose = () => {
        this.isConnected = false;
        this.handleReconnection();
      };
      
      this.socket.onerror = (error) => {
        reject(error);
      };
    });
  }
  
  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        // Reconnection logic would go here
      }, delay);
    }
  }
  
  send(message: any) {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }
  
  private handleMessage(message: any) {
    // Message handling logic
    console.log('Received signaling message:', message);
  }
  
  close() {
    this.socket?.close();
    this.isConnected = false;
  }
}