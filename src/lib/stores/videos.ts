import { writable } from 'svelte/store';

interface Video {
	video_id: string;
	title: string;
	status: string;
	created_at: string;
	duration?: number;
}

function createVideosStore() {
	const { subscribe, set, update } = writable<Video[]>([]);

	return {
		subscribe,
		set,
		add: (video: Video) => update(videos => [video, ...videos]),
		updateStatus: (videoId: string, status: string) => 
			update(videos => videos.map(v => 
				v.video_id === videoId ? { ...v, status } : v
			))
	};
}

export const videosStore = createVideosStore();
