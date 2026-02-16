<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	
	export let timeline: Array<{timestamp: number, sentiment: string, score: number}> = [];
	
	let canvas: HTMLCanvasElement;
	let chart: Chart;
	
	onMount(() => {
		Chart.register(...registerables);
		
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: timeline.map(t => formatTime(t.timestamp)),
				datasets: [{
					label: 'Sentiment Score',
					data: timeline.map(t => t.score),
					borderColor: 'rgb(99, 102, 241)',
					backgroundColor: 'rgba(99, 102, 241, 0.1)',
					tension: 0.4,
					fill: true
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						position: 'top'
					},
					tooltip: {
						callbacks: {
							label: function(context) {
								const item = timeline[context.dataIndex];
								return `${item.sentiment}: ${item.score.toFixed(2)}`;
							}
						}
					}
				},
				scales: {
					y: {
						min: -1,
						max: 1,
						ticks: {
							callback: function(value) {
								if (value === 1) return 'Positive';
								if (value === 0) return 'Neutral';
								if (value === -1) return 'Negative';
								return value;
							}
						}
					},
					x: {
						title: {
							display: true,
							text: 'Time'
						}
					}
				}
			}
		});
		
		return () => {
			if (chart) chart.destroy();
		};
	});
	
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="w-full h-64">
	<canvas bind:this={canvas}></canvas>
</div>
