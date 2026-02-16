<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let error = '';
	let loading = false;
	
	// For demo purposes, we'll use a simple token-based auth
	// In production, integrate with Firebase Auth
	async function handleLogin() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			// Demo: Generate a simple token
			// In production, authenticate with Firebase
			const token = btoa(`${email}:${Date.now()}`);
			const user = { email, uid: Date.now().toString() };
			
			authStore.login(token, user);
			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-[80vh] flex items-center justify-center px-4">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
				Sign in to your account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Demo login - enter any email and password
			</p>
		</div>
		
		<form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
			<div class="rounded-md shadow-sm space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">
						Email address
					</label>
					<input 
						id="email"
						type="email" 
						bind:value={email}
						required
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="you@example.com"
					/>
				</div>
				
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">
						Password
					</label>
					<input 
						id="password"
						type="password" 
						bind:value={password}
						required
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Password"
					/>
				</div>
			</div>
			
			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
					{error}
				</div>
			{/if}
			
			<div>
				<button 
					type="submit"
					disabled={loading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
				>
					{loading ? 'Signing in...' : 'Sign in'}
				</button>
			</div>
		</form>
		
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
			<p class="text-sm text-blue-800">
				<strong>Demo Mode:</strong> This is a demo login. Enter any email and password to access the application.
				In production, this would integrate with Firebase Authentication.
			</p>
		</div>
	</div>
</div>
