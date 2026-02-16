<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	
	export let videoUrl: string = '';
	export let currentTime: number = 0;
	
	let videoElement: HTMLVideoElement;
	let playing = false;
	let duration = 0;
	let volume = 1;
	let muted = false;
	
	const dispatch = createEventDispatcher();
	
	onMount(() => {
		// Listen for seek events from timeline/keywords
		const handleSeek = (event: any) => {
			if (videoElement && event.detail !== undefined) {
				seekTo(event.detail);
			}
		};
		
		window.addEventListener('seek', handleSeek);
		
		return () => {
			window.removeEventListener('seek', handleSeek);
		};
	});
	
	function togglePlay() {
		if (videoElement.paused) {
			videoElement.play();
			playing = true;
		} else {
			videoElement.pause();
			playing = false;
		}
	}
	
	function seekTo(time: number) {
		if (videoElement) {
			videoElement.currentTime = time;
			dispatch('timeupdate', time);
		}
	}
	
	function handleTimeUpdate() {
		currentTime = videoElement.currentTime;
		dispatch('timeupdate', currentTime);
	}
	
	function handleLoadedMetadata() {
		duration = videoElement.duration;
		dispatch('durationchange', duration);
	}
	
	function handleSeekBar(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const percent = (event.clientX - rect.left) / rect.width;
		seekTo(percent * duration);
	}
	
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
	
	function toggleMute() {
		muted = !muted;
		videoElement.muted = muted;
	}
	
	function handleVolumeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		volume = parseFloat(target.value);
		videoElement.volume = volume;
		muted = volume === 0;
	}
</script>

<div class="video-player bg-black rounded-lg overflow-hidden">
	{#if videoUrl}
		<video
			bind:this={videoElement}
			src={videoUrl}
			class="w-full"
			on:timeupdate={handleTimeUpdate}
			on:loadedmetadata={handleLoadedMetadata}
			on:play={() => playing = true}
			on:pause={() => playing = false}
		>
			<track kind="captions" />
		</video>
		
		<div class="controls bg-gray-900 p-4">
			<!-- Progress bar -->
			<div 
				class="progress-bar bg-gray-700 h-2 rounded-full cursor-pointer mb-4"
				on:click={handleSeekBar}
			>
				<div 
					class="progress bg-indigo-600 h-full rounded-full"
					style="width: {duration > 0 ? (currentTime / duration) * 100 : 0}%"
				></div>
			</div>
			
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<!-- Play/Pause button -->
					<button 
						on:click={togglePlay}
						class="text-white hover:text-indigo-400 transition-colors"
					>
						{#if playing}
							<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
							</svg>
						{:else}
							<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
							</svg>
						{/if}
					</button>
					
					<!-- Time display -->
					<div class="text-white text-sm">
						{formatTime(currentTime)} / {formatTime(duration)}
					</div>
				</div>
				
				<div class="flex items-center gap-4">
					<!-- Volume control -->
					<div class="flex items-center gap-2">
						<button 
							on:click={toggleMute}
							class="text-white hover:text-indigo-400 transition-colors"
						>
							{#if muted || volume === 0}
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd" />
								</svg>
							{:else}
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
								</svg>
							{/if}
						</button>
						<input 
							type="range" 
							min="0" 
							max="1" 
							step="0.1"
							value={volume}
							on:input={handleVolumeChange}
							class="w-20"
						/>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="flex items-center justify-center h-64 bg-gray-800 text-gray-400">
			<p>No video available</p>
		</div>
	{/if}
</div>

<style>
	.progress-bar {
		position: relative;
	}
	
	.progress {
		transition: width 0.1s linear;
	}
	
	input[type="range"] {
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		cursor: pointer;
	}
	
	input[type="range"]::-webkit-slider-track {
		background: #4B5563;
		height: 0.5rem;
		border-radius: 0.25rem;
	}
	
	input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		background: #6366F1;
		height: 1rem;
		width: 1rem;
		border-radius: 50%;
		margin-top: -0.25rem;
	}
	
	input[type="range"]::-moz-range-track {
		background: #4B5563;
		height: 0.5rem;
		border-radius: 0.25rem;
	}
	
	input[type="range"]::-moz-range-thumb {
		background: #6366F1;
		height: 1rem;
		width: 1rem;
		border-radius: 50%;
		border: none;
	}
</style>
