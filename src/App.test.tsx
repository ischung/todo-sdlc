import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('<App />', () => {
  it('renders the bootstrap heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Hello, Calendar Todo/i })).toBeInTheDocument();
  });

  it('applies the brand-tinted heading style', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).toMatch(/text-2xl/);
    expect(heading.className).toMatch(/text-brand-700/);
  });
});
