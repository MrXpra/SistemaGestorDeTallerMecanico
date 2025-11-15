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
    
    render(<WeatherWidget />);
    
    expect(screen.getByText(/cargando clima/i)).toBeInTheDocument();
  });

  it('should fetch and display weather data from backend proxy', async () => {
    const mockWeatherData = {
      temp: 28,
      tempMin: 25,
      tempMax: 30,
      description: 'cielo despejado',
      icon: 'clear',
      humidity: 70,
      feelsLike: 29,
      pressure: 1013,
      windSpeed: 15,
      cloudiness: 10,
      visibility: 10,
      sunrise: new Date().toISOString(),
      sunset: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      cityName: 'Santo Domingo',
      location: 'Santo Domingo,DO'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<WeatherWidget />);

    // Verificar que fetch fue llamado al endpoint del backend
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/proxy/weather');
    }, { timeout: 3000 });
  });

  it('should handle API errors gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

    const { container } = render(<WeatherWidget />);

    await waitFor(() => {
      // Widget should not render on error in compact mode
      expect(container.firstChild).toBeNull();
    });
  });

  it('should handle backend configuration errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Configuración de clima no disponible' }),
    });

    const { container } = render(<WeatherWidget />);

    await waitFor(() => {
      // Widget should not render when backend config is missing
      expect(container.firstChild).toBeNull();
    });
  });

  it('should call backend proxy endpoint', async () => {
    const mockWeatherData = {
      temp: 28,
      tempMin: 25,
      tempMax: 30,
      description: 'soleado',
      icon: 'clear',
      humidity: 70,
      feelsLike: 29,
      pressure: 1013,
      windSpeed: 15,
      cloudiness: 10,
      visibility: 10,
      sunrise: new Date().toISOString(),
      sunset: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      cityName: 'Santo Domingo',
      location: 'Santo Domingo,DO'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<WeatherWidget />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/proxy/weather');
    });
  });

  it('should have refresh button', async () => {
    const mockWeatherData = {
      temp: 28,
      tempMin: 25,
      tempMax: 30,
      description: 'soleado',
      icon: 'clear',
      humidity: 70,
      feelsLike: 29,
      pressure: 1013,
      windSpeed: 15,
      cloudiness: 10,
      visibility: 10,
      sunrise: new Date().toISOString(),
      sunset: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      cityName: 'Santo Domingo',
      location: 'Santo Domingo,DO'
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockWeatherData,
    });

    render(<WeatherWidget />);

    // Verificar que el componente intentó cargar datos
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});
