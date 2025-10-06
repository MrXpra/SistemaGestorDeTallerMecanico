/**
 * @file WeatherWidget.jsx
 * @description Widget de clima actual usando OpenWeatherMap API
 * 
 * Props:
 * - location: String (ej: "Santo Domingo,DO") - ubicación para consultar clima
 * - apiKey: String - API key de OpenWeatherMap
 * 
 * Responsabilidades:
 * - Obtener clima actual de OpenWeatherMap API
 * - Mostrar temperatura, descripción, humedad, sensación térmica
 * - Icono dinámico según condición climática (Cloud, Sun, Rain, etc.)
 * - Botón de refresh manual
 * - Manejo de estados: loading, error, success
 * 
 * Estados:
 * - weather: Objeto con temp, tempMin, tempMax, description, icon, humidity, feelsLike, lastUpdate
 * - loading: Boolean durante fetch
 * - error: String con mensaje de error si falla API
 * - refreshKey: Contador para forzar re-fetch manual
 * 
 * API:
 * - Endpoint: api.openweathermap.org/data/2.5/weather
 * - Parámetros: q (location), units=metric, lang=es, appid
 * - Añade timestamp para evitar caché del navegador
 * 
 * Nota:
 * - No usa fetch con headers personalizados (evita CORS)
 * - Se oculta si !location || !apiKey
 */

import { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  CloudDrizzle, 
  Wind,
  CloudFog,
  Zap,
  Loader2,
  RefreshCw
} from 'lucide-react';

const WeatherWidget = ({ location, apiKey }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!location || !apiKey) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Agregar timestamp para evitar caché del navegador
        const timestamp = new Date().getTime();
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&lang=es&appid=${apiKey}&_t=${timestamp}`;
        
        // Llamar a OpenWeatherMap API (sin headers personalizados para evitar CORS)
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al obtener clima');
        }
        
        const data = await response.json();
        
        setWeather({
          temp: Math.round(data.main.temp),
          tempMin: Math.round(data.main.temp_min),
          tempMax: Math.round(data.main.temp_max),
          description: data.weather[0].description,
          icon: data.weather[0].main.toLowerCase(),
          humidity: data.main.humidity,
          feelsLike: Math.round(data.main.feels_like),
          lastUpdate: new Date().toLocaleTimeString(),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Actualizar cada 10 minutos (cambiado de 30 a 10 para testing)
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location, apiKey, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getWeatherIcon = (iconType) => {
    const iconClass = "w-5 h-5";
    
    switch (iconType) {
      case 'clear':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'clouds':
        return <Cloud className={`${iconClass} text-gray-500 dark:text-gray-400`} />;
      case 'rain':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case 'drizzle':
        return <CloudDrizzle className={`${iconClass} text-blue-400`} />;
      case 'snow':
        return <CloudSnow className={`${iconClass} text-blue-200`} />;
      case 'thunderstorm':
        return <Zap className={`${iconClass} text-yellow-600`} />;
      case 'mist':
      case 'fog':
      case 'haze':
        return <CloudFog className={`${iconClass} text-gray-400`} />;
      default:
        return <Wind className={`${iconClass} text-gray-500`} />;
    }
  };

  // Si está cargando
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        <span className="text-xs text-gray-500 dark:text-gray-400">Cargando clima...</span>
      </div>
    );
  }

  // Si hay error o no hay configuración
  if (error || !weather) {
    return null; // No mostrar nada si hay error
  }

  return (
    <div 
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      title={`Última actualización: ${weather.lastUpdate || 'Ahora'}`}
    >
      {/* Icono del clima */}
      <div className="flex-shrink-0">
        {getWeatherIcon(weather.icon)}
      </div>
      
      {/* Información del clima */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
            {weather.temp}°
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {weather.tempMin}° / {weather.tempMax}°
          </span>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize leading-tight">
          {weather.description}
        </span>
      </div>

      {/* Botón de recarga manual */}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="ml-1 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        title="Actualizar clima"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default WeatherWidget;
