<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	
	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
	
	let videoId = $page.params.id;
	let loading = true;
	let error = '';
	
	onMount(() => {
		// Check if analysis file exists
		checkAnalysis();
	});
	
	async function checkAnalysis() {
		try {
			// Try to fetch the analysis JSON file directly
			const response = await fetch(`${API_URL}/static/analysis/${videoId}_analysis.json`);
			
			if (response.ok) {
				loading = false;
			} else {
				error = 'Analysis not yet available. Please process the video first.';
				loading = false;
			}
		} catch (err) {
			error = 'Failed to load analysis. Make sure the video has been processed.';
			loading = false;
		}
	}
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
		</div>
	{:else if error}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
			<h3 class="text-lg font-semibold text-yellow-900 mb-2">Analysis Not Available</h3>
			<p class="text-yellow-800 mb-4">{error}</p>
			<p class="text-sm text-yellow-700">
				To analyze this video, run: <code class="bg-yellow-100 px-2 py-1 rounded">python process_latest_video.py</code>
			</p>
		</div>
	{:else}
		<div class="bg-white shadow rounded-lg overflow-hidden" style="height: calc(100vh - 200px);">
			<iframe 
				src="{API_URL}/viewer?video={videoId}" 
				style="width: 100%; height: 100%; border: none;"
				title="Video Analysis Viewer"
			></iframe>
		</div>
	{/if}
</div>
