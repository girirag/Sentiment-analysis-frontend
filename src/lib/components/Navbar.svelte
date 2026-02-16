<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { page } from '$app/stores';
	
	$: isAuthenticated = $authStore.isAuthenticated;
</script>

<nav class="bg-white shadow-lg">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<div class="flex">
				<a href="/" class="flex items-center">
					<span class="text-xl font-bold text-indigo-600">Video Sentiment Analysis</span>
				</a>
				
				<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
					<a 
						href="/" 
						class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {$page.url.pathname === '/' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						Dashboard
					</a>
					<a 
						href="/upload" 
						class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {$page.url.pathname === '/upload' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						Upload
					</a>
					<a 
						href="/live" 
						class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {$page.url.pathname === '/live' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						Live Stream
					</a>
					<a 
						href="/videos" 
						class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {$page.url.pathname === '/videos' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						My Videos
					</a>
				</div>
			</div>
			
			<div class="flex items-center">
				{#if isAuthenticated}
					<span class="text-sm text-gray-700 mr-4">Welcome, {$authStore.user?.email || 'User'}</span>
					<button 
						on:click={() => authStore.logout()}
						class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
					>
						Logout
					</button>
				{:else}
					<a 
						href="/login" 
						class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
					>
						Login
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>
