<script lang="ts">
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth';
	import { websocketManager } from '$lib/stores/websocket';
	import { onMount, onDestroy } from 'svelte';
	import SentimentChart from '$lib/components/SentimentChart.svelte';
	import KeywordList from '$lib/components/KeywordList.svelte';
	
	let videoId = $page.params.id;
	let loading = true;
	let error = '';
	let analysis: any = null;
	let timeline: any[] = [];
	let keywords: any[] = [];
	let pollingInterval: any;
	let wsConnected = false;
	
	onMount(() => {
		fetchAnalysis();
		
		// Connect to WebSocket for real-time updates
		websocketManager.connect(videoId);
		
		// Listen for WebSocket messages
		const handleWSMessage = (event: any) => {
			const message = event.detail;
			console.log('Received WS message:', message);
			
			if (message.type === 'status_update') {
				// Update status in real-time
				if (analysis) {
					analysis.status = message.status;
				}
			} else if (message.type === 'completion') {
				// Refresh analysis when complete
				fetchAnalysis();
			} else if (message.type === 'connected') {
				wsConnected = true;
			}
		};
		
		window.addEventListener('ws-message', handleWSMessage);
		
		// Fallback polling if WebSocket fails
		pollingInterval = setInterval(() => {
			if (!wsConnected && (analysis?.status === 'processing' || analysis?.status === 'queued')) {
				fetchAnalysis();
			}
		}, 5000);
		
		return () => {
			window.removeEventListener('ws-message', handleWSMessage);
			if (pollingInterval) clearInterval(pollingInterval);
		};
	});
	
	onDestroy(() => {
		websocketManager.disconnect();
	});
	
	async function fetchAnalysis() {
		try {
			const response = await fetch(`http://localhost:8000/api/analysis/${videoId}`, {
				headers: {
					'Authorization': `Bearer ${$authStore.token}`
				}
			});
			
			if (!response.ok) {
				throw new Error('Failed to fetch analysis');
			}
			
			analysis = await response.json();
			
			// Fetch timeline and keywords if completed
			if (analysis.status === 'completed') {
				await Promise.all([
					fetchTimeline(),
					fetchKeywords()
				]);
			}
			
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load analysis';
			loading = false;
		}
	}
	
	async function fetchTimeline() {
		try {
			const response = await fetch(`http://localhost:8000/api/analysis/${videoId}/timeline`, {
				headers: {
					'Authorization': `Bearer ${$authStore.token}`
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				timeline = data.timeline || [];
			}
		} catch (err) {
			console.error('Failed to fetch timeline:', err);
		}
	}
	
	async function fetchKeywords() {
		try {
			const response = await fetch(`http://localhost:8000/api/analysis/${videoId}/keywords`, {
				headers: {
					'Authorization': `Bearer ${$authStore.token}`
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				keywords = data.keywords || [];
			}
		} catch (err) {
			console.error('Failed to fetch keywords:', err);
		}
	}
	
	async function exportAnalysis(format: 'json' | 'csv') {
		try {
			const response = await fetch(`http://localhost:8000/api/analysis/${videoId}/export?format=${format}`, {
				headers: {
					'Authorization': `Bearer ${$authStore.token}`
				}
			});
			
			if (!response.ok) {
				throw new Error('Export failed');
			}
			
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `analysis-${videoId}.${format}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (err) {
			alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
		}
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'completed': return 'bg-green-100 text-green-800';
			case 'processing': return 'bg-yellow-100 text-yellow-800';
			case 'failed': return 'bg-red-100 text-red-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
	function getSentimentColor(sentiment: string) {
		switch (sentiment) {
			case 'positive': return 'text-green-600';
			case 'negative': return 'text-red-600';
			default: return 'text-gray-600';
		}
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{:else if analysis}
		<div class="mb-8">
			<div class="flex justify-between items-start">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">{analysis.title || 'Video Analysis'}</h1>
					<p class="mt-2 text-gray-600">Video ID: {videoId}</p>
				</div>
				<span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(analysis.status)}">
					{analysis.status}
				</span>
			</div>
		</div>
		
		{#if analysis.status === 'processing' || analysis.status === 'queued'}
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
				<div class="flex items-center">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mr-4"></div>
					<div>
						<h3 class="text-lg font-semibold text-yellow-900">Processing Video</h3>
						<p class="text-yellow-800">Your video is being analyzed. This page will update automatically.</p>
					</div>
				</div>
			</div>
		{:else if analysis.status === 'completed'}
			<!-- Overall Sentiment -->
			<div class="bg-white shadow rounded-lg p-6 mb-8">
				<h2 class="text-xl font-semibold mb-4">Overall Sentiment</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div class="text-center">
						<p class="text-sm text-gray-600 mb-2">Sentiment</p>
						<p class="text-2xl font-bold {getSentimentColor(analysis.overall_sentiment)}">
							{analysis.overall_sentiment || 'N/A'}
						</p>
					</div>
					<div class="text-center">
						<p class="text-sm text-gray-600 mb-2">Score</p>
						<p class="text-2xl font-bold text-gray-900">
							{analysis.sentiment_score?.toFixed(2) || 'N/A'}
						</p>
					</div>
					<div class="text-center">
						<p class="text-sm text-gray-600 mb-2">Confidence</p>
						<p class="text-2xl font-bold text-gray-900">
							{analysis.confidence ? (analysis.confidence * 100).toFixed(1) + '%' : 'N/A'}
						</p>
					</div>
				</div>
			</div>
			
			<!-- Sentiment Timeline -->
			{#if timeline.length > 0}
				<div class="bg-white shadow rounded-lg p-6 mb-8">
					<h2 class="text-xl font-semibold mb-4">Sentiment Timeline</h2>
					<SentimentChart {timeline} />
				</div>
			{/if}
			
			<!-- Transcription -->
			{#if analysis.transcription}
				<div class="bg-white shadow rounded-lg p-6 mb-8">
					<h2 class="text-xl font-semibold mb-4">Transcription</h2>
					<div class="prose max-w-none">
						<p class="text-gray-700 whitespace-pre-wrap">{analysis.transcription}</p>
					</div>
				</div>
			{/if}
			
			<!-- Keywords -->
			{#if keywords.length > 0}
				<div class="bg-white shadow rounded-lg p-6 mb-8">
					<h2 class="text-xl font-semibold mb-4">Keywords</h2>
					<KeywordList {keywords} />
				</div>
			{/if}
			
			<!-- Export Options -->
			<div class="bg-white shadow rounded-lg p-6">
				<h2 class="text-xl font-semibold mb-4">Export Analysis</h2>
				<div class="flex gap-4">
					<button 
						on:click={() => exportAnalysis('json')}
						class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
					>
						Export as JSON
					</button>
					<button 
						on:click={() => exportAnalysis('csv')}
						class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
					>
						Export as CSV
					</button>
				</div>
			</div>
		{:else if analysis.status === 'failed'}
			<div class="bg-red-50 border border-red-200 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-red-900 mb-2">Processing Failed</h3>
				<p class="text-red-800">{analysis.error || 'An error occurred during processing'}</p>
			</div>
		{/if}
	{/if}
</div>
