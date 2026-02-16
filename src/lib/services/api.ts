const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
	async uploadVideo(file: File, token: string) {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(`${API_URL}/api/videos/upload`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`
			},
			body: formData
		});

		if (!response.ok) {
			throw new Error('Upload failed');
		}

		return response.json();
	},

	async startStream(streamUrl: string, title: string, token: string) {
		const response = await fetch(`${API_URL}/api/videos/stream/start`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ stream_url: streamUrl, title })
		});

		if (!response.ok) {
			throw new Error('Failed to start stream');
		}

		return response.json();
	},

	async getAnalysis(videoId: string, token: string) {
		const response = await fetch(`${API_URL}/api/analysis/${videoId}`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch analysis');
		}

		return response.json();
	},

	async getTimeline(videoId: string, token: string) {
		const response = await fetch(`${API_URL}/api/analysis/${videoId}/timeline`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch timeline');
		}

		return response.json();
	},

	async getKeywords(videoId: string, token: string) {
		const response = await fetch(`${API_URL}/api/analysis/${videoId}/keywords`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch keywords');
		}

		return response.json();
	},

	async exportAnalysis(videoId: string, format: 'json' | 'csv', token: string) {
		const response = await fetch(`${API_URL}/api/analysis/${videoId}/export?format=${format}`, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to export analysis');
		}

		return response.blob();
	}
};
