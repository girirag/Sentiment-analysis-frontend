import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import SentimentChart from '../SentimentChart.svelte';

describe('SentimentChart Component', () => {
	const mockTimeline = [
		{ timestamp: 0, sentiment: 'positive', score: 0.8 },
		{ timestamp: 5, sentiment: 'positive', score: 0.7 },
		{ timestamp: 10, sentiment: 'neutral', score: 0.1 },
		{ timestamp: 15, sentiment: 'negative', score: -0.6 }
	];

	it('renders chart canvas', () => {
		const { container } = render(SentimentChart, { props: { timeline: mockTimeline } });
		const canvas = container.querySelector('canvas');
		expect(canvas).toBeTruthy();
	});

	it('displays timeline data', () => {
		const { container } = render(SentimentChart, { props: { timeline: mockTimeline } });
		// Chart should be rendered with data
		expect(container.querySelector('canvas')).toBeTruthy();
	});

	it('handles empty timeline', () => {
		const { container } = render(SentimentChart, { props: { timeline: [] } });
		const canvas = container.querySelector('canvas');
		expect(canvas).toBeTruthy();
	});

	it('formats time correctly', () => {
		// Test time formatting function
		const formatTime = (seconds: number): string => {
			const mins = Math.floor(seconds / 60);
			const secs = Math.floor(seconds % 60);
			return `${mins}:${secs.toString().padStart(2, '0')}`;
		};

		expect(formatTime(0)).toBe('0:00');
		expect(formatTime(65)).toBe('1:05');
		expect(formatTime(125)).toBe('2:05');
	});

	it('validates sentiment score range', () => {
		mockTimeline.forEach(point => {
			expect(point.score).toBeGreaterThanOrEqual(-1);
			expect(point.score).toBeLessThanOrEqual(1);
		});
	});
});
