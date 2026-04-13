<script lang="ts">
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
	const videoId = $page.params.id;

	let datasetFile: File | null = null;
	let threshold = 0.45;
	let jobId = '';
	let jobStatus = '';
	let clips: any[] = [];
	let error = '';
	let uploading = false;
	let polling = false;
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	let view: 'upload' | 'processing' | 'results' = 'upload';

	onMount(() => {
		if (!$authStore.isAuthenticated) goto('/login');
	});

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		datasetFile = input.files?.[0] ?? null;
	}

	async function submitDataset() {
		if (!datasetFile) return;
		uploading = true;
		error = '';

		try {
			const form = new FormData();
			form.append('file', datasetFile);
			form.append('similarity_threshold', String(threshold));

			const res = await fetch(`${API_URL}/api/videos/${videoId}/clips/generate`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${$authStore.token}` },
				body: form
			});

			if (!res.ok) {
				const d = await res.json();
				throw new Error(d.detail || 'Failed to start clipping');
			}

			const data = await res.json();
			jobId = data.job_id;
			view = 'processing';
			startPolling();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			uploading = false;
		}
	}

	function startPolling() {
		polling = true;
		pollTimer = setInterval(checkStatus, 3000);
	}

	async function checkStatus() {
		try {
			const res = await fetch(`${API_URL}/api/videos/${videoId}/clips/status/${jobId}`, {
				headers: { Authorization: `Bearer ${$authStore.token}` }
			});
			if (res.status === 404) {
				clearInterval(pollTimer!);
				polling = false;
				error = 'Job not found — the server may have restarted. Please try again.';
				view = 'upload';
				return;
			}
			const data = await res.json();
			jobStatus = data.status;

			if (data.status === 'completed') {
				clearInterval(pollTimer!);
				polling = false;
				await loadClips();
				view = 'results';
			} else if (data.status === 'failed') {
				clearInterval(pollTimer!);
				polling = false;
				error = data.error || 'Processing failed';
				view = 'upload';
			}
		} catch {}
	}

	async function loadClips() {
		const res = await fetch(`${API_URL}/api/videos/${videoId}/clips/`, {
			headers: { Authorization: `Bearer ${$authStore.token}` }
		});
		const data = await res.json();
		// endpoint returns array directly
		clips = Array.isArray(data) ? data : (data.clips || []);
	}

	async function downloadClip(clipId: string) {
		try {
			const res = await fetch(`${API_URL}/api/videos/${videoId}/clips/${clipId}/download`, {
				headers: { Authorization: `Bearer ${$authStore.token}` }
			});
			const data = await res.json();
			// Open directly — avoids CORS on the static file fetch
			window.open(data.download_url, '_blank');
		} catch (err) {
			error = 'Failed to get download link';
		}
	}

	function formatTime(s: number) {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function reset() {
		view = 'upload';
		datasetFile = null;
		jobId = '';
		jobStatus = '';
		clips = [];
		error = '';
	}
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
	<div class="mb-6 flex items-center gap-3">
		<a href="/videos" class="text-gray-500 hover:text-gray-700">
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</a>
		<h1 class="text-2xl font-bold text-gray-900">Clip Highlights</h1>
	</div>

	{#if error}
		<div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
			<span>{error}</span>
			<button on:click={() => error = ''} class="text-red-500 hover:text-red-700">✕</button>
		</div>
	{/if}

	<!-- Upload View -->
	{#if view === 'upload'}
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-semibold text-gray-800 mb-2">Upload News Dataset</h2>
			<p class="text-sm text-gray-500 mb-6">
				Upload a JSON, CSV, or plain text file containing news headlines, summaries, or keywords.
				The system will find matching segments in your video and extract them as clips.
			</p>

			<div class="space-y-5">
				<div>
					<label for="dataset-file" class="block text-sm font-medium text-gray-700 mb-1">Dataset File</label>
					<input
						id="dataset-file"
						type="file"
						accept=".json,.csv,.txt"
						on:change={handleFileChange}
						class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
					/>
					{#if datasetFile}
						<p class="mt-1 text-xs text-gray-500">{datasetFile.name} ({(datasetFile.size / 1024).toFixed(1)} KB)</p>
					{/if}
				</div>

				<div>
					<label for="threshold" class="block text-sm font-medium text-gray-700 mb-1">
						Similarity Threshold: <span class="font-bold text-purple-600">{threshold.toFixed(2)}</span>
					</label>
					<input
						id="threshold"
						type="range"
						min="0.1"
						max="1.0"
						step="0.05"
						bind:value={threshold}
						class="w-full accent-purple-600"
					/>
					<div class="flex justify-between text-xs text-gray-400 mt-1">
						<span>0.1 (loose)</span>
						<span>1.0 (strict)</span>
					</div>
				</div>

				<button
					on:click={submitDataset}
					disabled={!datasetFile || uploading}
					class="w-full py-2 px-4 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{uploading ? 'Uploading...' : 'Generate Clips'}
				</button>
			</div>
		</div>

	<!-- Processing View -->
	{:else if view === 'processing'}
		<div class="bg-white rounded-lg shadow p-10 text-center">
			<div class="animate-spin rounded-full h-14 w-14 border-b-2 border-purple-600 mx-auto mb-4"></div>
			<h2 class="text-lg font-semibold text-gray-800 mb-1">Generating Clips...</h2>
			<p class="text-sm text-gray-500">Matching your dataset against the video transcript and cutting clips. This may take a few minutes.</p>
			<p class="mt-3 text-xs text-gray-400">Status: {jobStatus || 'queued'}</p>
		</div>

	<!-- Results View -->
	{:else if view === 'results'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-gray-600">{clips.length} highlight clip{clips.length !== 1 ? 's' : ''} found</p>
			<button on:click={reset} class="text-sm text-purple-600 hover:text-purple-800">Try another dataset</button>
		</div>

		{#if clips.length === 0}
			<div class="bg-white rounded-lg shadow p-10 text-center text-gray-500">
				<svg class="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<p class="font-medium">No matching segments found</p>
				<p class="text-sm mt-1">Try lowering the similarity threshold or using a different dataset.</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each clips as clip}
					<div class="bg-white rounded-lg shadow p-5">
						<div class="flex items-start justify-between gap-4 mb-3">
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-gray-800 mb-1">{clip.matched_text}</p>
								<p class="text-xs text-gray-500 italic">Matched: "{clip.dataset_entry}"</p>
							</div>
							<div class="flex-shrink-0 text-right">
								<span class="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
									{(clip.similarity_score * 100).toFixed(0)}% match
								</span>
								<p class="text-xs text-gray-400 mt-1">{formatTime(clip.start_time)} – {formatTime(clip.end_time)}</p>
							</div>
						</div>
						<div class="flex gap-2">
							<button
								on:click={() => downloadClip(clip.clip_id)}
								class="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								Download
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
