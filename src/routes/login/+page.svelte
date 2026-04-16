<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please enter email and password';
			return;
		}

		loading = true;
		error = '';

		try {
			// Try Firebase auth if config is available
			const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

			if (apiKey && browser) {
				const { auth } = await import('$lib/firebase');
				const { signInWithEmailAndPassword } = await import('firebase/auth');
				const credential = await signInWithEmailAndPassword(auth, email, password);
				const token = await credential.user.getIdToken();
				authStore.login(token, {
					email: credential.user.email,
					uid: credential.user.uid,
					name: credential.user.displayName || email.split('@')[0]
				});
			} else {
				// Dev fallback
				authStore.login('dev-token', {
					email,
					uid: 'dev-user-123',
					name: email.split('@')[0]
				});
			}

			goto('/');
		} catch (err: any) {
			if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
				error = 'Invalid email or password';
			} else if (err.code === 'auth/too-many-requests') {
				error = 'Too many attempts. Please try again later.';
			} else {
				error = err.message || 'Login failed';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Sentiment AI</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Sign in to your account
			</h2>
		</div>

		<form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label for="email" class="sr-only">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Email address"
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						bind:value={password}
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
	</div>
</div>
