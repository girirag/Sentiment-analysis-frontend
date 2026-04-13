<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	
	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
	
	let videos: any[] = [];
	let loading = true;
	let error = '';
	let deleting: Set<string> = new Set();
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let processingVideos: Set<string> = new Set();
	let processingStartTimes: Map<string, number> = new Map();
	
	onMount(() => {
		if (!$authStore.isAuthenticated) {
			goto('/login');
			return;
		}
		fetchVideos();
		
		// Start polling for processing videos
		pollInterval = setInterval(() => {
			if (processingVideos.size > 0) {
				fetchVideos();
			}
		}, 3000);
	});
	
	onDestroy(() => {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
	});
	
	async function fetchVideos() {
		try {
			// Add timeout to prevent infinite loading
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
			
			const response = await fetch(`${API_URL}/api/videos/`, {
				headers: {
					'Authorization': `Bearer ${$authStore.token}`
				},
				signal: controller.signal
			});
			
			clearTimeout(timeoutId);
			
			if (!response.ok) {
				throw new Error('Failed to fetch videos');
			}
			
			const data = await response.json();
			videos = data.videos || [];
			
			// Track processing videos
			const newProcessingVideos = new Set<string>();
			videos.forEach(video => {
				if (video.status === 'processing' || video.status === 'queued') {
					newProcessingVideos.add(video.video_id);
					if (!processingStartTimes.has(video.video_id)) {
						processingStartTimes.set(video.video_id, Date.now());
					}
				} else {
					processingStartTimes.delete(video.video_id);
				}
			});
			processingVideos = newProcessingVideos;
			
			loading = false;
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				error = 'Request timed out. The backend may be slow or not responding. Please try refreshing the page.';
			} else {
				error = err instanceof Error ? err.message : 'Failed to load videos';
			}
			loading = false;
		}
	}
	
	async function deleteVideo(videoId: string, event: Event) {
		event.preventDefault();
		event.stopPropagation();
		
		if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
			return;
		}
		
		deleting.add(videoId);
		deleting = deleting;
		
		try {
			const response = await fetch(`${API_URL}/api/videos/${videoId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${$authStore.token}`
				}
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.detail || 'Failed to delete video');
			}
			
			// Remove from list
			videos = videos.filter(v => v.video_id !== videoId);
			processingVideos.delete(videoId);
			processingStartTimes.delete(videoId);
		} catch (err) {
			alert(`Failed to delete video: ${err instanceof Error ? err.message : 'Unknown error'}`);
		} finally {
			deleting.delete(videoId);
			deleting = deleting;
		}
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'completed': return 'bg-green-100 text-green-800';
			case 'processing': return 'bg-yellow-100 text-yellow-800';
			case 'failed': return 'bg-red-100 text-red-800';
			case 'queued': return 'bg-blue-100 text-blue-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}
	
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}
	
	function getElapsedTime(videoId: string): string {
		const startTime = processingStartTimes.get(videoId);
		if (!startTime) return '0s';
		
		const elapsed = Math.floor((Date.now() - startTime) / 1000);
		const minutes = Math.floor(elapsed / 60);
		const seconds = elapsed % 60;
		
		if (minutes > 0) {
			return `${minutes}m ${seconds}s`;
		}
		return `${seconds}s`;
	}
	
	function getEstimatedTime(video: any): string {
		// More realistic estimate: 
		// - Small videos (<5MB): ~2 seconds per MB
		// - Medium videos (5-20MB): ~5 seconds per MB  
		// - Large videos (>20MB): ~8 seconds per MB
		const sizeMB = (video.size || 0) / (1024 * 1024);
		let estimatedSeconds;
		
		if (sizeMB < 5) {
			estimatedSeconds = Math.ceil(sizeMB * 2);
		} else if (sizeMB < 20) {
			estimatedSeconds = Math.ceil(sizeMB * 5);
		} else {
			estimatedSeconds = Math.ceil(sizeMB * 8);
		}
		
		const minutes = Math.floor(estimatedSeconds / 60);
		const seconds = estimatedSeconds % 60;
		
		if (minutes > 0) {
			return `~${minutes}m ${seconds}s`;
		}
		return `~${seconds}s`;
	}
	
	function getProgress(videoId: string, video: any): number {
		if (video.status === 'completed') return 100;
		if (video.status === 'failed') return 0;
		if (video.status === 'queued') return 5;
		
		const startTime = processingStartTimes.get(videoId);
		if (!startTime) return 10;
		
		const elapsed = (Date.now() - startTime) / 1000;
		const sizeMB = (video.size || 0) / (1024 * 1024);
		const estimatedTotal = sizeMB * 2;
		
		const progress = Math.min(95, Math.floor((elapsed / estimatedTotal) * 100));
		return Math.max(10, progress);
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">My Videos</h1>
		<p class="mt-2 text-gray-600">View and manage your analyzed videos</p>
	</div>
	
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-6">
			<div class="flex items-start">
				<svg class="h-6 w-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<div class="flex-1">
					<h3 class="text-lg font-medium text-red-800 mb-2">Error Loading Videos</h3>
					<p class="text-red-700 mb-4">{error}</p>
					<div class="flex gap-3">
						<button
							on:click={() => { loading = true; error = ''; fetchVideos(); }}
							class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
						>
							Retry
						</button>
						<button
							on:click={() => goto('/')}
							class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
						>
							Go to Dashboard
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else if videos.length === 0}
		<div class="text-center py-12">
			<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">No videos</h3>
			<p class="mt-1 text-sm text-gray-500">Get started by uploading a video</p>
			<div class="mt-6">
				<a 
					href="/upload" 
					class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
				>
					Upload Video
				</a>
			</div>
		</div>
	{:else}
		<div class="bg-white shadow overflow-hidden sm:rounded-md">
			<ul class="divide-y divide-gray-200">
				{#each videos as video}
					<li>
						<div class="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
							<a href="/analysis/{video.video_id}" class="flex-1 min-w-0">
								<div class="flex items-center justify-between">
									<div class="flex-1 min-w-0">
										<p class="text-lg font-medium text-indigo-600 truncate">
											{video.title || video.video_id}
										</p>
										<p class="mt-1 text-sm text-gray-500">
											Uploaded: {formatDate(video.created_at)}
										</p>
										{#if video.duration}
											<p class="mt-1 text-sm text-gray-500">
												Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
											</p>
										{/if}
										
										<!-- Progress bar for processing/queued videos -->
										{#if video.status === 'processing' || video.status === 'queued'}
											<div class="mt-3">
												<div class="flex items-center justify-between text-xs text-gray-600 mb-1">
													<span>
														{video.status === 'queued' ? 'Waiting to process...' : 'Processing...'}
													</span>
													<span class="flex items-center gap-2">
														<span>Elapsed: {getElapsedTime(video.video_id)}</span>
														<span class="text-gray-400">|</span>
														<span>Est: {getEstimatedTime(video)}</span>
													</span>
												</div>
												<div class="w-full bg-gray-200 rounded-full h-2">
													<div 
														class="bg-indigo-600 h-2 rounded-full transition-all duration-500 {video.status === 'queued' ? 'animate-pulse' : ''}"
														style="width: {getProgress(video.video_id, video)}%"
													></div>
												</div>
												<p class="text-xs text-gray-500 mt-1">
													{getProgress(video.video_id, video)}% complete
												</p>
											</div>
										{/if}
									</div>
									<div class="ml-4 flex-shrink-0">
										<span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(video.status)}">
											{video.status}
										</span>
									</div>
								</div>
								{#if video.overall_sentiment}
									<div class="mt-2">
										<span class="text-sm text-gray-600">
											Sentiment: <span class="font-medium">{video.overall_sentiment}</span>
										</span>
									</div>
								{/if}
							</a>
							{#if video.status === 'completed'}
								<a
									href="/videos/{video.video_id}/clips"
									on:click|stopPropagation
									class="ml-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors flex items-center gap-1"
									title="Clip Highlights"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Clip Highlights
								</a>
							{/if}
							<button
								on:click={(e) => deleteVideo(video.video_id, e)}
								disabled={deleting.has(video.video_id)}
								class="ml-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								title="Delete video"
							>
								{#if deleting.has(video.video_id)}
									<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								{:else}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								{/if}
							</button>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
