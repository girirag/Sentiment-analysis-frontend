<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	
	$: isAuthenticated = $authStore.isAuthenticated;
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-gray-900 mb-4">Video Sentiment Analysis</h1>
		<p class="text-xl text-gray-600">Analyze sentiment in videos with AI-powered insights</p>
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
		<div class="bg-white p-6 rounded-lg shadow-lg">
			<div class="text-indigo-600 mb-4">
				<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
				</svg>
			</div>
			<h3 class="text-xl font-semibold mb-2">Upload Videos</h3>
			<p class="text-gray-600">Upload pre-recorded videos for comprehensive sentiment analysis</p>
		</div>
		
		<div class="bg-white p-6 rounded-lg shadow-lg">
			<div class="text-indigo-600 mb-4">
				<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
				</svg>
			</div>
			<h3 class="text-xl font-semibold mb-2">Live Streaming</h3>
			<p class="text-gray-600">Analyze live video streams in real-time with instant feedback</p>
		</div>
		
		<div class="bg-white p-6 rounded-lg shadow-lg">
			<div class="text-indigo-600 mb-4">
				<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			</div>
			<h3 class="text-xl font-semibold mb-2">Detailed Analytics</h3>
			<p class="text-gray-600">Get sentiment timelines, keyword tracking, and exportable reports</p>
		</div>
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
		<a 
			href="/upload" 
			class="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-500"
		>
			<h2 class="text-2xl font-semibold mb-4 text-gray-900">📤 Upload Video</h2>
			<p class="text-gray-600">Upload a pre-recorded video for sentiment analysis with keyword tracking</p>
		</a>
		
		<a 
			href="/live" 
			class="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-500"
		>
			<h2 class="text-2xl font-semibold mb-4 text-gray-900">🔴 Live Stream</h2>
			<p class="text-gray-600">Analyze a live video stream in real-time with continuous monitoring</p>
		</a>
	</div>
	
	{#if isAuthenticated}
		<div class="mt-8 text-center">
			<a 
				href="/videos" 
				class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
			>
				View My Videos
			</a>
		</div>
	{:else}
		<div class="mt-8 text-center">
			<p class="text-gray-600 mb-4">Please login to start analyzing videos</p>
			<a 
				href="/login" 
				class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
			>
				Login
			</a>
		</div>
	{/if}
</div>
