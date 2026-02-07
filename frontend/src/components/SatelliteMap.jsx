import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Loader2, TrendingUp, Droplets, Thermometer, Map as MapIcon, Activity, Layers, Play } from 'lucide-react';

// Fix Leaflet marker icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ setLocation }) => {
    useMapEvents({
        click(e) {
            setLocation(e.latlng);
        },
    });
    return null;
};

const SatelliteMap = () => {
    const [location, setLocation] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!location) return;
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const response = await axios.post('/api/satellite-data', {
                lat: location.lat,
                lon: location.lng
            });
            setData(response.data.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to fetch data. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when location changes
    useEffect(() => {
        if (location) {
            fetchData();
        }
    }, [location]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            <div className="lg:col-span-2 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative">
                <MapContainer center={[28.6139, 77.2090]} zoom={6} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker setLocation={setLocation} />
                    {location && <Marker position={location}><Popup>Selected Location</Popup></Marker>}
                </MapContainer>

                {location && (
                    <div className="absolute bottom-6 left-6 right-6 bg-gray-900/90 p-4 rounded-lg backdrop-blur-sm border border-gray-600 flex justify-between items-center shadow-lg z-[9999]">
                        <div>
                            <p className="text-sm text-gray-400">Selected Coordinates</p>
                            <p className="font-mono text-white font-medium">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {loading ? (
                                <span className="text-blue-400 text-sm animate-pulse flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Acquiring signal...
                                </span>
                            ) : (
                                <button
                                    onClick={fetchData}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                                >
                                    <Play className="w-3 h-3 mr-2" fill="currentColor" />
                                    Run Analysis
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                    Satellite Data
                </h2>

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-800/50 text-red-200 rounded-lg mb-4 text-sm">
                        <p className="font-bold mb-1">Error</p>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500/30 border-b-purple-500 rounded-full animate-spin-reverse"></div>
                        </div>
                        <p className="text-gray-400 text-center text-sm animate-pulse">
                            Establishing uplink...<br />
                            Processing multi-spectral imagery
                        </p>
                    </div>
                ) : !data ? (
                    <div className="text-center text-gray-500 py-12 flex flex-col items-center">
                        <MapIcon className="w-12 h-12 mb-4 opacity-20" />
                        <p className="mb-6">Select a location on the map to begin analysis</p>
                        {location && (
                            <button
                                onClick={fetchData}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center border border-slate-600 hover:border-slate-500"
                            >
                                <Play className="w-4 h-4 mr-2" fill="currentColor" />
                                Run Analysis
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                <Activity className="w-5 h-5 text-green-400 mb-1" />
                                <p className="text-2xl font-bold text-white">{data.summary.active_satellites}/4</p>
                                <p className="text-xs text-gray-400">Active Satellites</p>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                <Layers className="w-5 h-5 text-purple-400 mb-1" />
                                <p className="text-2xl font-bold text-white">{data.summary.best_resolution}</p>
                                <p className="text-xs text-gray-400">Best Resolution</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Key Metrics</h3>

                            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                                <span className="text-gray-400 flex items-center"><TrendingUp className="w-4 h-4 mr-2" /> NDVI (Veg)</span>
                                <span className="font-mono font-medium text-white">{data.satellites.sentinel2?.indices?.ndvi?.toFixed(3) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                                <span className="text-gray-400 flex items-center"><Thermometer className="w-4 h-4 mr-2" /> Surface Temp</span>
                                <span className="font-mono font-medium text-white">{data.satellites.landsat8?.temperature?.toFixed(1) || 'N/A'}°C</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                                <span className="text-gray-400 flex items-center"><Droplets className="w-4 h-4 mr-2" /> Moisture</span>
                                <span className="font-mono font-medium text-white">{data.satellites.sentinel1?.soil_moisture_estimate?.toFixed(0) || 'N/A'}%</span>
                            </div>
                        </div>

                        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50">
                            <h4 className="font-semibold text-blue-300 mb-2 text-sm">AI Insight</h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Data quality is {data.summary.data_quality}. The region shows stable vegetation health with NDVI indices within normal range.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SatelliteMap;
