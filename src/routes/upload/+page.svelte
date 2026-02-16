<script lang="ts">
	import VideoUpload from '$lib/components/VideoUpload.svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	onMount(() => {
		if (!$authStore.isAuthenticated) {
			goto('/login');
		}
	});
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Upload Video</h1>
		<p class="mt-2 text-gray-600">Upload a video file for sentiment analysis</p>
	</div>
	
	<VideoUpload />
	
	<div class="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
		<h2 class="text-lg font-semibold text-blue-900 mb-4">How it works</h2>
		<ol class="list-decimal list-inside space-y-2 text-blue-800">
			<li>Upload your video file (MP4, AVI, MOV, MKV up to 500MB)</li>
			<li>Optionally add keywords you want to track</li>
			<li>Our AI will extract audio and transcribe the speech</li>
			<li>Sentiment analysis runs on the transcription</li>
			<li>View results with timeline, keywords, and export options</li>
		</ol>
		<p class="mt-4 text-sm text-blue-700">
			Processing time: ~2-3 minutes per minute of video
		</p>
	</div>
</div>
