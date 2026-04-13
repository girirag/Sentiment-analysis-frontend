<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { page } from '$app/stores';
	
	$: isAuthenticated = $authStore.isAuthenticated;
</script>

<nav class="futuristic-nav">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<div class="flex items-center">
				<a href="/" class="flex items-center group">
					<div class="neon-logo">
						<svg class="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#gradient1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M2 17L12 22L22 17" stroke="url(#gradient1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M2 12L12 17L22 12" stroke="url(#gradient1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<defs>
								<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color:#00f5ff;stop-opacity:1" />
									<stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
									<stop offset="100%" style="stop-color:#ff006e;stop-opacity:1" />
								</linearGradient>
							</defs>
						</svg>
					</div>
					<span class="text-xl font-bold neon-text">SENTIMENT AI</span>
				</a>
				
				<div class="hidden sm:ml-8 sm:flex sm:space-x-6">
					<a 
						href="/" 
						class="nav-link {$page.url.pathname === '/' ? 'active' : ''}"
					>
						<span class="nav-icon">⚡</span> Dashboard
					</a>
					<a 
						href="/upload" 
						class="nav-link {$page.url.pathname === '/upload' ? 'active' : ''}"
					>
						<span class="nav-icon">📤</span> Upload
					</a>
					<a 
						href="/twitter" 
						class="nav-link {$page.url.pathname === '/twitter' ? 'active' : ''}"
					>
						<span class="nav-icon">🎬</span> Import
					</a>
					<a 
						href="/videos" 
						class="nav-link {$page.url.pathname === '/videos' ? 'active' : ''}"
					>
						<span class="nav-icon">📊</span> Videos
					</a>
				</div>
			</div>
			
			<div class="flex items-center">
				{#if isAuthenticated}
					<span class="text-sm mr-4 user-badge">
						<span class="status-dot"></span>
						{$authStore.user?.email || 'User'}
					</span>
					<button 
						on:click={() => authStore.logout()}
						class="logout-btn"
					>
						<span class="btn-icon">🚀</span> Logout
					</button>
				{:else}
					<a 
						href="/login" 
						class="login-btn"
					>
						<span class="btn-icon">🔐</span> Login
					</a>
				{/if}
			</div>
		</div>
	</div>
</nav>

<style>
	.futuristic-nav {
		background: rgba(15, 5, 30, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 2px solid transparent;
		border-image: linear-gradient(90deg, #00f5ff 0%, #8b5cf6 50%, #ff006e 100%);
		border-image-slice: 1;
		box-shadow: 0 4px 30px rgba(139, 92, 246, 0.3);
		position: relative;
	}

	.futuristic-nav::before {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(90deg, #00f5ff 0%, #8b5cf6 50%, #ff006e 100%);
		animation: glow-pulse 2s ease-in-out infinite;
	}

	@keyframes glow-pulse {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}

	.neon-logo svg {
		filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
		transition: all 0.3s ease;
	}

	.neon-logo:hover svg {
		filter: drop-shadow(0 0 15px rgba(0, 245, 255, 0.8));
		transform: scale(1.1) rotate(5deg);
	}

	.neon-text {
		font-family: 'Orbitron', sans-serif;
		background: linear-gradient(135deg, #00f5ff 0%, #ff006e 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: 0.1em;
		text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
		transition: all 0.3s ease;
	}

	.neon-text:hover {
		letter-spacing: 0.15em;
	}

	.nav-link {
		font-family: 'Rajdhani', sans-serif;
		font-weight: 600;
		font-size: 0.95rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #a5b4fc;
		padding: 0.5rem 1rem;
		border-bottom: 2px solid transparent;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
	}

	.nav-icon {
		font-size: 1.1rem;
		filter: grayscale(1);
		transition: all 0.3s ease;
	}

	.nav-link:hover {
		color: #00f5ff;
		border-bottom-color: #00f5ff;
		text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
	}

	.nav-link:hover .nav-icon {
		filter: grayscale(0);
		transform: scale(1.2);
	}

	.nav-link.active {
		color: #ff006e;
		border-bottom-color: #ff006e;
		text-shadow: 0 0 15px rgba(255, 0, 110, 0.6);
	}

	.nav-link.active .nav-icon {
		filter: grayscale(0);
		animation: bounce 0.5s ease;
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-5px); }
	}

	.user-badge {
		font-family: 'Rajdhani', sans-serif;
		color: #c7d2fe;
		padding: 0.5rem 1rem;
		background: rgba(139, 92, 246, 0.2);
		border: 1px solid rgba(139, 92, 246, 0.4);
		border-radius: 20px;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		background: #00f5ff;
		border-radius: 50%;
		box-shadow: 0 0 10px #00f5ff;
		animation: pulse-dot 2s ease-in-out infinite;
	}

	@keyframes pulse-dot {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(1.2); }
	}

	.logout-btn, .login-btn {
		font-family: 'Orbitron', sans-serif;
		font-weight: 600;
		font-size: 0.85rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.6rem 1.5rem;
		border-radius: 8px;
		transition: all 0.3s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		overflow: hidden;
	}

	.logout-btn {
		background: linear-gradient(135deg, #ff006e 0%, #dc2626 100%);
		color: white;
		border: 1px solid rgba(255, 0, 110, 0.5);
		box-shadow: 0 4px 15px rgba(255, 0, 110, 0.3);
	}

	.logout-btn:hover {
		box-shadow: 0 6px 25px rgba(255, 0, 110, 0.5);
		transform: translateY(-2px);
	}

	.login-btn {
		background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
		color: white;
		border: 1px solid rgba(139, 92, 246, 0.5);
		box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
	}

	.login-btn:hover {
		box-shadow: 0 6px 25px rgba(139, 92, 246, 0.5);
		transform: translateY(-2px);
	}

	.btn-icon {
		font-size: 1.1rem;
		transition: transform 0.3s ease;
	}

	.logout-btn:hover .btn-icon,
	.login-btn:hover .btn-icon {
		transform: scale(1.2) rotate(10deg);
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.neon-text {
			font-size: 1rem;
		}
		
		.nav-link {
			font-size: 0.85rem;
			padding: 0.4rem 0.8rem;
		}
	}
</style>
