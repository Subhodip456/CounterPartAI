import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Google review desk and reports missing configuration', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ connected: false, configured: false }) });
  render(<App />);
  expect(screen.getByRole('heading', { name: /Your Google review desk/i })).toBeInTheDocument();
  expect(await screen.findByText(/Account setup is in progress/i)).toBeInTheDocument();
});
