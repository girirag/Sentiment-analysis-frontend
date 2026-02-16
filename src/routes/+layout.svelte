<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	
	onMount(() => {
		authStore.init();
	});
</script>

<div class="min-h-screen bg-gray-50">
	<Navbar />
	<main class="py-8">
		<slot />
	</main>
</div>
