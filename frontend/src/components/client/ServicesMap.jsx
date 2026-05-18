// frontend/src/components/client/ServicesMap.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Navigation, X, Star, DollarSign, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to center map
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const defaultCenter = { lat: 33.9716, lng: -6.8498 };

const ServicesMap = ({ categoryId = null, searchTerm = '', onServiceSelect = null }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [locationError, setLocationError] = useState(null);
  const [mapZoom, setMapZoom] = useState(12);

  // جلب الخدمات من API العادي (بدل map)
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:8000/api/services';
      
      const params = new URLSearchParams();
      if (categoryId) params.append('category_id', categoryId);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        }
      });
      
      // Extraction des données
      let servicesData = [];
      if (response.data?.data?.data) {
        servicesData = response.data.data.data;
      } else if (response.data?.data) {
        servicesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        servicesData = response.data;
      }
      
      // فلترة الخدمات اللي عندها إحداثيات
      const servicesWithLocation = servicesData.filter(service => 
        service.latitude && service.longitude &&
        service.latitude !== null && service.longitude !== null
      );
      
      setServices(servicesWithLocation);
      
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('تعذر تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  }, [categoryId, searchTerm]);

  // جلب موقع المستخدم
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('متصفحك لا يدعم تحديد الموقع');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
        setMapZoom(13);
      },
      (error) => {
        console.log('Geolocation error:', error);
        setLocationError('الرجاء السماح بتحديد الموقع');
      }
    );
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const centerOnUserLocation = () => {
    setUserLocation({ ...userLocation });
    setMapZoom(14);
  };

  if (loading) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[500px] bg-red-50 rounded-xl flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button 
            onClick={fetchServices}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {locationError && (
        <div className="absolute top-2 left-2 right-2 z-10 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-md flex items-center justify-between">
          <span className="text-sm">{locationError}</span>
          <button onClick={() => setLocationError(null)} className="text-yellow-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <button
        onClick={centerOnUserLocation}
        className="absolute bottom-4 right-4 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition z-20"
      >
        <Navigation className="w-5 h-5 text-blue-600" />
      </button>

      <div className="absolute top-2 left-2 z-10 bg-white px-3 py-1 rounded-full shadow-md text-sm">
        📍 {services.length} خدمة على الخريطة
      </div>

      {services.length === 0 ? (
        <div className="w-full h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">لا توجد خدمات مع إحداثيات على الخريطة</p>
            <p className="text-sm text-gray-400 mt-2">أضف خدمات مع تحديد الموقع</p>
          </div>
        </div>
      ) : (
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={mapZoom}
          style={{ height: '500px', width: '100%', borderRadius: '12px' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={userLocation} zoom={mapZoom} />
          
          {services.map((service) => (
            <Marker
              key={service.id}
              position={[parseFloat(service.latitude), parseFloat(service.longitude)]}
              eventHandlers={{
                click: () => {
                  setSelectedService(service);
                  if (onServiceSelect) onServiceSelect(service);
                }
              }}
            >
              {selectedService?.id === service.id && (
                <Popup>
                  <div className="min-w-[200px] p-2">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {service.title}
                    </h3>
                    {service.price && (
                      <div className="flex items-center gap-1 text-green-600 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{service.price} DH</span>
                      </div>
                    )}
                    {service.location && (
                      <p className="text-sm text-gray-500 mb-2">📍 {service.location}</p>
                    )}
                    <button 
                      onClick={() => window.location.href = `/services/${service.id}`}
                      className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default ServicesMap;