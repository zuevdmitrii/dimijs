import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('app is alive', () => {
  render(<App />);
  const linkElement = screen.getByText(/playground for dimijs components/i);
  expect(linkElement).toBeInTheDocument();
});

