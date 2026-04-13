<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	
	onMount(() => {
		if (!$authStore.isAuthenticated) {
			goto('/login');
		} else {
			// Redirect to YouTube import page
			goto('/twitter');
		}
	});
</script>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="text-center">
		<p class="text-gray-600">Redirecting to YouTube imports...</p>
	</div>
</div>
