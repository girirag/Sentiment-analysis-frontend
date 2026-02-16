<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	let videos: any[] = [];
	let loading = true;
	let error = '';
	
	onMount(() => {
		if (!$authStore.isAuthenticated) {
			goto('/login');
			return;
		}
		fetchVideos();
	});
	
	async function fetchVideos() {
		try {
			const response = await fetch('http://localhost:8000/api/videos/', {
				headers: {
					'Authorization': `Bearer ${$authStore.token}`
				}
			});
			
			if (!response.ok) {
				throw new Error('Failed to fetch videos');
			}
			
			const data = await response.json();
			videos = data.videos || [];
			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load videos';
			loading = false;
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
	
	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
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
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
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
						<a href="/analysis/{video.video_id}" class="block hover:bg-gray-50 transition-colors">
							<div class="px-4 py-4 sm:px-6">
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
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
