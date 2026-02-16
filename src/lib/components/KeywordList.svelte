<script lang="ts">
	export let keywords: Array<{
		keyword: string;
		count: number;
		timestamps: number[];
	}> = [];
	
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="space-y-4">
	{#each keywords as item}
		<div class="bg-white p-4 rounded-lg shadow">
			<div class="flex justify-between items-start mb-2">
				<h3 class="text-lg font-semibold text-gray-900">{item.keyword}</h3>
				<span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
					{item.count} occurrences
				</span>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each item.timestamps as timestamp}
					<button 
						class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
						on:click={() => {
							// Emit event for video player to seek to this timestamp
							const event = new CustomEvent('seek', { detail: timestamp });
							window.dispatchEvent(event);
						}}
					>
						{formatTime(timestamp)}
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>
