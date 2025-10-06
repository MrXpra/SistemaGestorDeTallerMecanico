import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WeatherWidget from '../../components/WeatherWidget';

describe('WeatherWidget - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should render loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {}));
    
    render(<WeatherWidget location="Santo Domingo,DO" apiKey="test-key" />);
    
    expect(screen.getByText(/cargando clima/i)).toBeInTheDocument();
  });

  it('should fetch and display weather data', async () => {
    const mockWeatherData = {
      main: {
        temp: 28,
        temp_min: 25,
        temp_max: 30,
        humidity: 70,
        feels_like: 29,
      },
      weather: [
        {
          description: 'cielo despejado',
          main: 'Clear',
        },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<WeatherWidget location="Santo Domingo,DO" apiKey="test-key" />);

    await waitFor(() => {
      expect(screen.getByText(/28°/)).toBeInTheDocument();
      expect(screen.getByText(/25° \/ 30°/)).toBeInTheDocument();
      expect(screen.getByText(/cielo despejado/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

    const { container } = render(
      <WeatherWidget location="Santo Domingo,DO" apiKey="test-key" />
    );

    await waitFor(() => {
      // Widget should not render on error
      expect(container.firstChild).toBeNull();
    });
  });

  it('should not render without API key', () => {
    const { container } = render(
      <WeatherWidget location="Santo Domingo,DO" apiKey="" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should encode location properly', async () => {
    const mockWeatherData = {
      main: { temp: 28, temp_min: 25, temp_max: 30, humidity: 70, feels_like: 29 },
      weather: [{ description: 'soleado', main: 'Clear' }],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<WeatherWidget location="Gaspar Hernández, DO" apiKey="test-key" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('Gaspar%20Hern%C3%A1ndez')
      );
    });
  });

  it('should have refresh button', async () => {
    const mockWeatherData = {
      main: { temp: 28, temp_min: 25, temp_max: 30, humidity: 70, feels_like: 29 },
      weather: [{ description: 'soleado', main: 'Clear' }],
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<WeatherWidget location="Santo Domingo,DO" apiKey="test-key" />);

    await waitFor(() => {
      const refreshButton = screen.getByTitle(/actualizar clima/i);
      expect(refreshButton).toBeInTheDocument();
    });
  });
});
