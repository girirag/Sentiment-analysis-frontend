<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	let streamUrl = '';
	let title = '';
	let starting = false;
	let error = '';
	let videoId = '';
	
	onMount(() => {
		if (!$authStore.isAuthenticated) {
			goto('/login');
		}
	});
	
	async function startStream() {
		if (!streamUrl || !title) {
			error = 'Please fill in all fields';
			return;
		}
		
		starting = true;
		error = '';
		
		try {
			const response = await fetch('http://localhost:8000/api/videos/stream/start', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${$authStore.token}`
				},
				body: JSON.stringify({
					stream_url: streamUrl,
					title: title
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to start stream');
			}
			
			const result = await response.json();
			videoId = result.video_id;
			
			// Redirect to analysis page
			goto(`/analysis/${videoId}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to start stream';
		} finally {
			starting = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Live Stream Analysis</h1>
		<p class="mt-2 text-gray-600">Analyze a live video stream in real-time</p>
	</div>
	
	<div class="bg-white shadow rounded-lg p-6">
		<div class="space-y-6">
			<div>
				<label for="title" class="block text-sm font-medium text-gray-700">
					Stream Title
				</label>
				<input 
					id="title"
					type="text" 
					bind:value={title}
					placeholder="e.g., Live Conference Stream"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
				/>
			</div>
			
			<div>
				<label for="stream-url" class="block text-sm font-medium text-gray-700">
					Stream URL
				</label>
				<input 
					id="stream-url"
					type="text" 
					bind:value={streamUrl}
					placeholder="rtmp://example.com/live/stream or http://example.com/stream.m3u8"
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
				/>
				<p class="mt-1 text-xs text-gray-500">Supports RTMP, HTTP, and HTTPS streams</p>
			</div>
			
			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			{/if}
			
			<button 
				on:click={startStream}
				disabled={starting}
				class="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
			>
				{starting ? 'Starting Stream...' : '🔴 Start Live Analysis'}
			</button>
		</div>
	</div>
	
	<div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
		<h2 class="text-lg font-semibold text-yellow-900 mb-4">Live Stream Requirements</h2>
		<ul class="list-disc list-inside space-y-2 text-yellow-800">
			<li>Stream must be accessible via RTMP, HTTP, or HTTPS</li>
			<li>Stream will be processed in 10-second chunks</li>
			<li>Real-time sentiment analysis will be displayed</li>
			<li>You can stop the stream at any time</li>
			<li>All analysis data will be saved for later review</li>
		</ul>
	</div>
	
	<div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
		<h2 class="text-lg font-semibold text-blue-900 mb-4">Example Stream URLs</h2>
		<div class="space-y-2 text-sm text-blue-800">
			<p><strong>RTMP:</strong> rtmp://server.com/live/streamkey</p>
			<p><strong>HLS:</strong> http://server.com/stream.m3u8</p>
			<p><strong>HTTP:</strong> http://server.com/live/stream</p>
		</div>
	</div>
</div>
