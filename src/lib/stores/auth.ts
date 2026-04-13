import { writable } from 'svelte/store';

interface AuthState {
	token: string | null;
	user: any | null;
	isAuthenticated: boolean;
}

// Initialise synchronously from localStorage so auth state is ready
// before any component's onMount runs — prevents redirect-to-login race condition
function loadInitialState(): AuthState {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('auth_token');
		const userStr = localStorage.getItem('user');
		if (token && userStr) {
			try {
				return { token, user: JSON.parse(userStr), isAuthenticated: true };
			} catch {}
		}
	}
	return { token: null, user: null, isAuthenticated: false };
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(loadInitialState());

	return {
		subscribe,
		login: (token: string, user: any) => {
			set({ token, user, isAuthenticated: true });
			if (typeof window !== 'undefined') {
				localStorage.setItem('auth_token', token);
				localStorage.setItem('user', JSON.stringify(user));
			}
		},
		logout: () => {
			set({ token: null, user: null, isAuthenticated: false });
			if (typeof window !== 'undefined') {
				localStorage.removeItem('auth_token');
				localStorage.removeItem('user');
			}
		},
		// kept for backward compatibility — state is already loaded at construction
		init: () => {
			if (typeof window !== 'undefined') {
				const token = localStorage.getItem('auth_token');
				const userStr = localStorage.getItem('user');
				if (token && userStr) {
					try {
						set({ token, user: JSON.parse(userStr), isAuthenticated: true });
					} catch {}
				}
			}
		}
	};
}

export const authStore = createAuthStore();
