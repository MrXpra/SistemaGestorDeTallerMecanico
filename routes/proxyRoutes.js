/**
 * @file proxyRoutes.js
 * @description Rutas proxy para servicios externos (evitar CORS y proteger API keys)
 * 
 * Endpoints:
 * - GET /api/proxy/image - Cargar imágenes externas (evita CORS)
 * - GET /api/proxy/weather - Obtener datos de clima desde OpenWeatherMap
 * 
 * Middleware:
 * - Sin autenticación (público)
 * 
 * Query Params:
 * - GET /image: url (URL de la imagen a cargar)
 * - GET /weather: ninguno (usa configuración desde Settings)
 * 
 * Propósito:
 * - Permite al frontend cargar imágenes de URLs externas sin problemas de CORS
 * - Protege API keys del clima al hacer las llamadas desde el backend
 * - Añade headers de caché para optimizar rendimiento
 * - Usa User-Agent para evitar bloqueos de algunos servidores
 * 
 * Seguridad:
 * - Valida formato de URL
 * - Verifica content-type sea image/*
 * - API keys permanecen en el servidor (no se exponen al cliente)
 * - Maneja errores de fetch
 */

import express from 'express';
import fetch from 'node-fetch';
import Settings from '../models/Settings.js';

const router = express.Router();

// Proxy para cargar imágenes externas y evitar CORS
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ message: 'URL es requerida' });
    }

    // Validar que sea una URL válida
    let imageUrl;
    try {
      imageUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({ message: 'URL inválida' });
    }

    // Fetch de la imagen
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        message: `Error al cargar imagen: ${response.statusText}` 
      });
    }

    // Obtener el content-type
    const contentType = response.headers.get('content-type');
    
    // Verificar que sea una imagen
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({ message: 'La URL no apunta a una imagen válida' });
    }

    // Obtener el buffer de la imagen
    const buffer = await response.buffer();

    // Enviar la imagen con los headers correctos
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache por 1 día
    res.send(buffer);

  } catch (error) {
    console.error('Error en proxy de imagen:', error);
    res.status(500).json({ message: 'Error al procesar la imagen', error: error.message });
  }
});

// Proxy para obtener datos de clima desde OpenWeatherMap
router.get('/weather', async (req, res) => {
  try {
    // Obtener configuración del sistema
    const settings = await Settings.getInstance();
    
    // Validar que la configuración de clima esté disponible
    if (!settings.weatherLocation || !settings.weatherApiKey) {
      return res.status(400).json({ 
        message: 'Configuración de clima no disponible. Por favor configure la ubicación y API key en Configuración.' 
      });
    }

    // Construir URL para OpenWeatherMap API
    const timestamp = new Date().getTime();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(settings.weatherLocation)}&units=metric&lang=es&appid=${settings.weatherApiKey}&_t=${timestamp}`;
    
    // Llamar a OpenWeatherMap API
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        message: errorData.message || 'Error al obtener datos del clima',
        error: errorData
      });
    }
    
    const data = await response.json();
    
    // Formatear respuesta con la información relevante
    const weatherData = {
      temp: Math.round(data.main.temp),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      description: data.weather[0].description,
      icon: data.weather[0].main.toLowerCase(),
      humidity: data.main.humidity,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind?.speed || 0),
      cloudiness: data.clouds?.all || 0,
      visibility: Math.round((data.visibility || 0) / 1000), // convertir a km
      sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
      sunset: new Date(data.sys.sunset * 1000).toISOString(),
      lastUpdate: new Date().toISOString(),
      cityName: data.name,
      location: settings.weatherLocation
    };

    // Enviar respuesta con caché de 10 minutos
    res.set('Cache-Control', 'public, max-age=600'); // Cache por 10 minutos
    res.json(weatherData);

  } catch (error) {
    console.error('Error en proxy de clima:', error);
    res.status(500).json({ 
      message: 'Error al obtener datos del clima', 
      error: error.message 
    });
  }
});

export default router;
