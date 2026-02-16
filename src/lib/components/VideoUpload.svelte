<script lang="ts">
	import { api } from '$lib/services/api';
	import { authStore } from '$lib/stores/auth';
	import { videosStore } from '$lib/stores/videos';
	import { goto } from '$app/navigation';
	
	let file: File | null = null;
	let keywords = '';
	let uploading = false;
	let error = '';
	let dragOver = false;
	
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
	
	async function handleUpload() {
		if (!file) {
			error = 'Please select a file';
			return;
		}
		
		if (!$authStore.token) {
			error = 'Please login first';
			return;
		}
		
		uploading = true;
		error = '';
		
		try {
			const formData = new FormData();
			formData.append('file', file);
			if (keywords) {
				formData.append('keywords', keywords);
			}
			
			const response = await fetch('http://localhost:8000/api/videos/upload', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${$authStore.token}`
				},
				body: formData
			});
			
			if (!response.ok) {
				throw new Error('Upload failed');
			}
			
			const result = await response.json();
			videosStore.add({
				video_id: result.video_id,
				title: file.name,
				status: result.status,
				created_at: new Date().toISOString()
			});
			
			goto(`/analysis/${result.video_id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			uploading = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto">
	<div 
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
				<label for="file-upload" class="cursor-pointer">
					<span class="mt-2 block text-sm font-medium text-gray-900">
						Drop video file here or click to browse
					</span>
					<input 
						id="file-upload" 
						type="file" 
						class="sr-only" 
						accept="video/*"
						on:change={handleFileSelect}
					/>
				</label>
			</div>
			<p class="mt-1 text-xs text-gray-500">MP4, AVI, MOV, MKV up to 500MB</p>
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
	
	<button 
		on:click={handleUpload}
		disabled={!file || uploading}
		class="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
	>
		{uploading ? 'Uploading...' : 'Upload and Analyze'}
	</button>
</div>
