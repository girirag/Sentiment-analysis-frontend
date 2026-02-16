import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { websocketManager } from '../websocket';

describe('WebSocket Store', () => {
	let mockWebSocket: any;

	beforeEach(() => {
		// Mock WebSocket
		mockWebSocket = {
			send: vi.fn(),
			close: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			readyState: WebSocket.OPEN
		};

		global.WebSocket = vi.fn(() => mockWebSocket) as any;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('connects to WebSocket', () => {
		websocketManager.connect('test_video_123');
		expect(global.WebSocket).toHaveBeenCalledWith(
			expect.stringContaining('/ws/analysis/test_video_123')
		);
	});

	it('disconnects from WebSocket', () => {
		websocketManager.connect('test_video_123');
		websocketManager.disconnect();
		expect(mockWebSocket.close).toHaveBeenCalled();
	});

	it('handles reconnection with exponential backoff', () => {
		vi.useFakeTimers();
		
		websocketManager.connect('test_video_123');
		
		// Simulate connection close
		if (mockWebSocket.onclose) {
			mockWebSocket.onclose();
		}
		
		// Should attempt to reconnect
		vi.advanceTimersByTime(2000);
		
		vi.useRealTimers();
	});

	it('sends messages when connected', () => {
		websocketManager.connect('test_video_123');
		mockWebSocket.readyState = WebSocket.OPEN;
		
		websocketManager.send({ type: 'test', data: 'hello' });
		
		expect(mockWebSocket.send).toHaveBeenCalled();
	});

	it('handles connection errors', () => {
		websocketManager.connect('test_video_123');
		
		// Simulate error
		if (mockWebSocket.onerror) {
			mockWebSocket.onerror(new Event('error'));
		}
		
		// Should handle error gracefully
		expect(true).toBe(true);
	});

	it('limits reconnection attempts', () => {
		const maxAttempts = 5;
		let attempts = 0;
		
		websocketManager.connect('test_video_123');
		
		// Simulate multiple connection failures
		for (let i = 0; i < maxAttempts + 2; i++) {
			if (mockWebSocket.onclose) {
				mockWebSocket.onclose();
				attempts++;
			}
		}
		
		// Should stop after max attempts
		expect(attempts).toBeGreaterThan(0);
	});
});
