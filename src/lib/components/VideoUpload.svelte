<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	
	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
	
	let file: File | null = null;
	let keywords = '';
	let uploading = false;
	let processing = false;
	let error = '';
	let dragOver = false;
	let uploadedVideoId = '';
	let processingStatus = '';
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	
	onDestroy(() => {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
	});
	
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			file = target.files[0];
			error = '';
		}
	}
	
	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		
		if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
			file = event.dataTransfer.files[0];
			error = '';
		}
	}
	
	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}
	
	function handleDragLeave() {
		dragOver = false;
	}
	
	async function checkProcessingStatus(videoId: string) {
		try {
			const token = $authStore.token || 'dev-token';
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
			
			try {
				const response = await fetch(`${API_URL}/api/videos/${videoId}`, {
					headers: {
						'Authorization': `Bearer ${token}`
					},
					signal: controller.signal
				});
				
				clearTimeout(timeoutId);
				
				if (response.ok) {
					const video = await response.json();
					processingStatus = video.status;
					
					if (video.status === 'completed') {
						// Stop polling
						if (pollInterval) {
							clearInterval(pollInterval);
							pollInterval = null;
						}
						
						processing = false;
						
						// Redirect to analysis page
						setTimeout(() => {
							goto(`/analysis/${videoId}`);
						}, 1000);
					} else if (video.status === 'failed') {
						// Stop polling
						if (pollInterval) {
							clearInterval(pollInterval);
							pollInterval = null;
						}
						
						processing = false;
						error = video.error || 'Processing failed';
					}
				}
			} catch (fetchErr) {
				clearTimeout(timeoutId);
				if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
					console.warn('Status check timed out - retrying...');
					// Continue polling, don't show error
				} else {
					throw fetchErr;
				}
			}
		} catch (err) {
			console.error('Error checking status:', err);
		}
	}
	
	async function handleUpload() {
		if (!file) {
			error = 'Please select a file';
			return;
		}
		
		// Use development token if not authenticated
		const token = $authStore.token || 'dev-token';
		
		uploading = true;
		error = '';
		
		try {
			const formData = new FormData();
			formData.append('file', file);
			if (keywords) {
				formData.append('keywords', keywords);
			}
			
			const response = await fetch(`${API_URL}/api/videos/upload`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
				},
				body: formData
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
				throw new Error(errorData.detail || 'Upload failed');
			}
			
			const result = await response.json();
			uploadedVideoId = result.video_id;
			processingStatus = result.status;
			
			uploading = false;
			processing = true;
			
			// Start polling for status updates every 3 seconds
			pollInterval = setInterval(() => {
				checkProcessingStatus(uploadedVideoId);
			}, 3000);
			
			// Check immediately
			checkProcessingStatus(uploadedVideoId);
			
		} catch (err) {
			error = err instanceof Error ? err.message : 'Upload failed';
			console.error('Upload error:', err);
			uploading = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto">
	<div 
		role="button"
		tabindex="0"
		class="border-2 border-dashed rounded-lg p-8 text-center {dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}"
		on:drop={handleDrop}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
	>
		{#if file}
			<div class="mb-4">
				<p class="text-lg font-medium text-gray-900">{file.name}</p>
				<p class="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
			</div>
			<button 
				on:click={() => file = null}
				class="text-sm text-red-600 hover:text-red-700"
			>
				Remove file
			</button>
		{:else}
			<svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
				<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<div class="mt-4">
				<p class="text-sm font-medium text-gray-700 mb-3">
					Drop video file here or
				</p>
				<label for="file-upload" class="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
					</svg>
					Choose Video File
				</label>
				<input 
					id="file-upload" 
					type="file" 
					class="hidden" 
					accept="video/*"
					on:change={handleFileSelect}
				/>
			</div>
			<p class="mt-3 text-xs text-gray-500">MP4, AVI, MOV, MKV up to 500MB</p>
		{/if}
	</div>
	
	<div class="mt-6">
		<label for="keywords" class="block text-sm font-medium text-gray-700">
			Keywords to Track (optional)
		</label>
		<input 
			id="keywords"
			type="text" 
			bind:value={keywords}
			placeholder="e.g., important, urgent, deadline"
			class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
		/>
		<p class="mt-1 text-xs text-gray-500">Comma-separated keywords</p>
	</div>
	
	{#if error}
		<div class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{/if}
	
	{#if processing}
		<div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-6">
			<div class="flex items-center justify-center mb-4">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
			<h3 class="text-lg font-semibold text-blue-900 text-center mb-2">Processing Video</h3>
			<p class="text-blue-800 text-center mb-2">
				Status: <span class="font-medium capitalize">{processingStatus}</span>
			</p>
			<p class="text-sm text-blue-700 text-center">
				This may take a few minutes depending on video length...
			</p>
			<p class="text-xs text-blue-600 text-center mt-2">
				You will be automatically redirected when processing is complete.
			</p>
		</div>
	{/if}
	
	<button 
		on:click={handleUpload}
		disabled={!file || uploading || processing}
		class="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
	>
		{uploading ? 'Uploading...' : processing ? 'Processing...' : 'Upload and Analyze'}
	</button>
</div>
