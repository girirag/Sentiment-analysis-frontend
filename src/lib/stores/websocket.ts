import { writable } from 'svelte/store';

interface WebSocketMessage {
	type: string;
	video_id?: string;
	status?: string;
	data?: any;
	analysis?: any;
	error?: string;
	message?: string;
}

interface WebSocketStore {
	connected: boolean;
	message: WebSocketMessage | null;
	error: string | null;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

class WebSocketManager {
	private socket: WebSocket | null = null;
	private videoId: string | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // Start with 1 second
	private reconnectTimeout: any = null;
	private store = writable<WebSocketStore>({
		connected: false,
		message: null,
		error: null
	});

	subscribe = this.store.subscribe;

	connect(videoId: string) {
		this.videoId = videoId;
		this.reconnectAttempts = 0;
		this._connect();
	}

	private _connect() {
		if (!this.videoId) return;

		try {
			this.socket = new WebSocket(`${WS_URL}/ws/analysis/${this.videoId}`);

			this.socket.onopen = () => {
				console.log('WebSocket connected');
				this.reconnectAttempts = 0;
				this.reconnectDelay = 1000;
				this.store.update(state => ({
					...state,
					connected: true,
					error: null
				}));
			};

			this.socket.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data);
					console.log('WebSocket message:', message);
					
					this.store.update(state => ({
						...state,
						message,
						error: null
					}));

					// Emit custom event for components to listen to
					window.dispatchEvent(new CustomEvent('ws-message', { detail: message }));

					// If completion message, close connection
					if (message.type === 'completion') {
						this.disconnect();
					}
				} catch (error) {
					console.error('Failed to parse WebSocket message:', error);
				}
			};

			this.socket.onerror = (error) => {
				console.error('WebSocket error:', error);
				this.store.update(state => ({
					...state,
					error: 'WebSocket connection error'
				}));
			};

			this.socket.onclose = () => {
				console.log('WebSocket disconnected');
				this.store.update(state => ({
					...state,
					connected: false
				}));

				// Attempt to reconnect with exponential backoff
				if (this.reconnectAttempts < this.maxReconnectAttempts) {
					this.reconnectAttempts++;
					const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
					
					console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
					
					this.reconnectTimeout = setTimeout(() => {
						this._connect();
					}, delay);
				} else {
					this.store.update(state => ({
						...state,
						error: 'Failed to connect after multiple attempts'
					}));
				}
			};
		} catch (error) {
			console.error('Failed to create WebSocket:', error);
			this.store.update(state => ({
				...state,
				error: 'Failed to create WebSocket connection'
			}));
		}
	}

	disconnect() {
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}

		this.videoId = null;
		this.reconnectAttempts = 0;
		
		this.store.set({
			connected: false,
			message: null,
			error: null
		});
	}

	send(data: any) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.error('WebSocket is not connected');
		}
	}
}

export const websocketManager = new WebSocketManager();
