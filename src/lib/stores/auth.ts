import { writable } from 'svelte/store';

interface AuthState {
	token: string | null;
	user: any | null;
	isAuthenticated: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		token: null,
		user: null,
		isAuthenticated: false
	});

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
		init: () => {
			if (typeof window !== 'undefined') {
				const token = localStorage.getItem('auth_token');
				const userStr = localStorage.getItem('user');
				if (token && userStr) {
					const user = JSON.parse(userStr);
					set({ token, user, isAuthenticated: true });
				}
			}
		}
	};
}

export const authStore = createAuthStore();
