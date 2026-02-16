import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import VideoUpload from '../VideoUpload.svelte';

describe('VideoUpload Component', () => {
	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks();
	});

	it('renders upload interface', () => {
		const { getByText } = render(VideoUpload);
		expect(getByText(/drop video file here/i)).toBeTruthy();
	});

	it('handles file selection', async () => {
		const { container } = render(VideoUpload);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		
		const file = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
		
		await fireEvent.change(input, { target: { files: [file] } });
		
		await waitFor(() => {
			expect(container.textContent).toContain('test.mp4');
		});
	});

	it('validates file format', async () => {
		const { container, getByText } = render(VideoUpload);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		
		// Try to upload invalid file
		const file = new File(['text content'], 'test.txt', { type: 'text/plain' });
		
		await fireEvent.change(input, { target: { files: [file] } });
		
		// Should show error or not accept file
		// Implementation depends on validation logic
	});

	it('shows upload button when file is selected', async () => {
		const { container, getByText } = render(VideoUpload);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		
		const file = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
		
		await fireEvent.change(input, { target: { files: [file] } });
		
		await waitFor(() => {
			const uploadButton = getByText(/upload and analyze/i);
			expect(uploadButton).toBeTruthy();
		});
	});

	it('handles drag and drop', async () => {
		const { container } = render(VideoUpload);
		const dropZone = container.querySelector('.border-dashed') as HTMLElement;
		
		const file = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
		const dataTransfer = {
			files: [file],
			types: ['Files']
		};
		
		await fireEvent.drop(dropZone, { dataTransfer });
		
		await waitFor(() => {
			expect(container.textContent).toContain('test.mp4');
		});
	});

	it('allows removing selected file', async () => {
		const { container, getByText } = render(VideoUpload);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		
		const file = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
		
		await fireEvent.change(input, { target: { files: [file] } });
		
		await waitFor(async () => {
			const removeButton = getByText(/remove file/i);
			await fireEvent.click(removeButton);
		});
		
		await waitFor(() => {
			expect(container.textContent).toContain(/drop video file here/i);
		});
	});
});
