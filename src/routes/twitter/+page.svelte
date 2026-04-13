<script lang="ts">
	import { onMount } from 'svelte';
	
	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
	
	let searchQuery = 'trending';
	let searchType: 'query' | 'hashtag' | 'user' | 'trending' | 'channel' = 'trending';
	let platform: 'twitter' | 'youtube' = 'youtube';
	let maxResults = 10;
	let loading = false;
	let videos: any[] = [];
	let error = '';
	let importing: Set<string> = new Set();
	
	async function searchVideos() {
		loading = true;
		error = '';
		videos = [];
		
		try {
			let response;
			const baseUrl = platform === 'youtube' ? `${API_URL}/api/youtube` : `${API_URL}/api/twitter`;
			
			if (platform === 'youtube') {
				if (searchType === 'trending') {
					response = await fetch(`${baseUrl}/trending?max_results=${maxResults}`);
				} else if (searchType === 'query') {
					response = await fetch(`${baseUrl}/search?query=${encodeURIComponent(searchQuery)}&max_results=${maxResults}`);
				} else if (searchType === 'channel') {
					response = await fetch(`${baseUrl}/channel/${encodeURIComponent(searchQuery)}?max_results=${maxResults}`);
				}
			} else {
				// Twitter logic
				if (searchType === 'query') {
					response = await fetch(`${baseUrl}/search?query=${encodeURIComponent(searchQuery)}&max_results=${maxResults}`);
				} else if (searchType === 'hashtag') {
					response = await fetch(`${baseUrl}/hashtag/${encodeURIComponent(searchQuery)}?max_results=${maxResults}`);
				} else if (searchType === 'user') {
					response = await fetch(`${baseUrl}/user/${encodeURIComponent(searchQuery)}?max_results=${maxResults}`);
				}
			}
			
			if (response && response.ok) {
				const data = await response.json();
				videos = data.videos || [];
				console.log('Search results:', { count: videos.length, firstVideo: videos[0] });
			} else {
				error = `Failed to fetch videos from ${platform === 'youtube' ? 'YouTube' : 'Twitter'}`;
			}
		} catch (err: any) {
			console.error('Search error:', err);
			error = err.message || `Failed to search ${platform === 'youtube' ? 'YouTube' : 'Twitter'}`;
		} finally {
			loading = false;
		}
	}
	
	async function importVideo(videoId: string) {
		if (!videoId) {
			console.error('No video ID provided');
			alert('Error: No video ID provided');
			return;
		}
		
		importing.add(videoId);
		importing = importing;
		
		try {
			const baseUrl = platform === 'youtube' ? `${API_URL}/api/youtube` : `${API_URL}/api/twitter`;
			const url = `${baseUrl}/import/${videoId}?auto_process=true`;
			
			console.log('Importing video:', { videoId, platform, url });
			
			const response = await fetch(url, {
				method: 'POST'
			});
			
			console.log('Import response:', response.status, response.statusText);
			
			if (response.ok) {
				const data = await response.json();
				console.log('Import success:', data);
				alert(`Video imported successfully! Video ID: ${data.video_id}\n\nThe video is being processed. Check the Videos page to see the status.`);
			} else {
				const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
				console.error('Import failed:', errorData);
				alert(`Failed to import video: ${errorData.detail || 'Unknown error'}`);
			}
		} catch (err: any) {
			console.error('Import error:', err);
			alert(`Error importing video: ${err.message}`);
		} finally {
			importing.delete(videoId);
			importing = importing;
		}
	}
	
	function formatNumber(num: number): string {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	}
	
	function formatDuration(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Import Videos</h1>
		<p class="text-gray-600">Search and import trending videos from YouTube or Twitter for sentiment analysis</p>
		<div class="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
			<p class="text-sm text-blue-800">
				💡 <strong>Live Stream Support:</strong> You can import YouTube live streams! Just search for and import any live video - it will be downloaded and analyzed automatically.
			</p>
		</div>
	</div>
	
	<!-- Search Form -->
	<div class="bg-white shadow rounded-lg p-6 mb-8">
		<!-- Platform Selection -->
		<div class="mb-4">
			<label class="block text-sm font-medium text-gray-700 mb-2">Platform</label>
			<div class="flex gap-4">
				<button
					on:click={() => { platform = 'youtube'; searchType = 'trending'; }}
					class="px-6 py-2 rounded-lg font-medium transition-colors {platform === 'youtube' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
				>
					YouTube
				</button>
				<button
					on:click={() => { platform = 'twitter'; searchType = 'query'; }}
					class="px-6 py-2 rounded-lg font-medium transition-colors {platform === 'twitter' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
				>
					Twitter
				</button>
			</div>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
			<div class="md:col-span-2">
				<label for="searchQuery" class="block text-sm font-medium text-gray-700 mb-2">
					Search {searchType === 'trending' ? '(Select "Search" type to enable)' : ''}
				</label>
				<input
					id="searchQuery"
					type="text"
					bind:value={searchQuery}
					placeholder={searchType === 'trending' ? 'Select "Search" type to enter query' : searchType === 'channel' ? 'Enter channel ID' : 'Enter search term'}
					disabled={searchType === 'trending'}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
					on:keypress={(e) => e.key === 'Enter' && !e.currentTarget.disabled && searchVideos()}
				/>
				{#if searchType === 'trending'}
					<p class="text-xs text-gray-500 mt-1">💡 Tip: Change "Search Type" to "Search" to enter your own query</p>
				{/if}
			</div>
			
			<div>
				<label for="searchType" class="block text-sm font-medium text-gray-700 mb-2">
					Search Type
				</label>
				<select
					id="searchType"
					bind:value={searchType}
					on:change={() => {
						if (searchType === 'trending') {
							searchQuery = 'trending';
						} else if (searchType === 'query') {
							searchQuery = '';
						} else if (searchType === 'channel') {
							searchQuery = '';
						}
					}}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				>
					{#if platform === 'youtube'}
						<option value="trending">🔥 Trending (Popular Now)</option>
						<option value="query">🔍 Search (Custom Query)</option>
						<option value="channel">📺 Channel (By Channel ID)</option>
					{:else}
						<option value="query">🔍 General Search</option>
						<option value="hashtag">#️⃣ Hashtag</option>
						<option value="user">👤 User</option>
					{/if}
				</select>
			</div>
			
			<div>
				<label for="maxResults" class="block text-sm font-medium text-gray-700 mb-2">
					Max Results
				</label>
				<input
					id="maxResults"
					type="number"
					bind:value={maxResults}
					min="1"
					max="50"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				/>
			</div>
		</div>
		
		<button
			on:click={searchVideos}
			disabled={loading}
			class="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
		>
			{loading ? 'Searching...' : `Search ${platform === 'youtube' ? 'YouTube' : 'Twitter'}`}
		</button>
	</div>
	
	<!-- Error Message -->
	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
			<p class="text-red-800">{error}</p>
		</div>
	{/if}
	
	<!-- Loading State -->
	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
		</div>
	{/if}
	
	<!-- Results -->
	{#if !loading && videos.length > 0}
		<div class="mb-4">
			<p class="text-gray-600">Found {videos.length} videos</p>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each videos as video}
				<div class="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
					<!-- Thumbnail -->
					<div class="relative">
						{#if video.thumbnail_url}
							<img
								src={video.thumbnail_url}
								alt="Video thumbnail"
								class="w-full h-48 object-cover"
							/>
						{:else}
							<div class="w-full h-48 bg-gray-200 flex items-center justify-center">
								<svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
							</div>
						{/if}
						
						{#if video.duration_ms}
							<div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
								{formatDuration(video.duration_ms)}
							</div>
						{/if}
					</div>
					
					<!-- Content -->
					<div class="p-4">
						<!-- Author/Channel -->
						<div class="flex items-center mb-2">
							<div class="flex-1">
								{#if platform === 'youtube'}
									<p class="font-semibold text-gray-900">{video.channel?.title || 'Unknown Channel'}</p>
									<p class="text-sm text-gray-500">{video.title}</p>
								{:else}
									<p class="font-semibold text-gray-900">{video.author?.name || video.author?.username}</p>
									<p class="text-sm text-gray-500">@{video.author?.username}</p>
								{/if}
							</div>
						</div>
						
						<!-- Description/Text -->
						<p class="text-sm text-gray-700 mb-3 line-clamp-3">
							{platform === 'youtube' ? video.description : video.text}
						</p>
						
						<!-- Metrics -->
						<div class="flex items-center justify-between text-xs text-gray-500 mb-4">
							{#if platform === 'youtube'}
								<span>👁️ {formatNumber(video.metrics?.views || 0)}</span>
								<span>❤️ {formatNumber(video.metrics?.likes || 0)}</span>
								<span>💬 {formatNumber(video.metrics?.comments || 0)}</span>
							{:else}
								<span>❤️ {formatNumber(video.metrics?.likes || 0)}</span>
								<span>🔄 {formatNumber(video.metrics?.retweets || 0)}</span>
								<span>💬 {formatNumber(video.metrics?.replies || 0)}</span>
							{/if}
						</div>
						
						<!-- Import Button -->
						<button
							on:click={() => importVideo(video.video_id || video.tweet_id)}
							disabled={importing.has(video.video_id || video.tweet_id)}
							class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
						>
							{importing.has(video.video_id || video.tweet_id) ? 'Importing...' : 'Import & Analyze'}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else if !loading && videos.length === 0 && searchQuery}
		<div class="text-center py-12">
			<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
			<p class="mt-1 text-sm text-gray-500">Try a different search query</p>
		</div>
	{/if}
</div>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
