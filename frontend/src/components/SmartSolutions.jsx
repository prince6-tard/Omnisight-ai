import { useState } from 'react';
import axios from 'axios';
import { Sprout, AlertTriangle, ThermometerSun, Loader2, ArrowRight } from 'lucide-react';

const SmartSolutions = () => {
    const [activeTab, setActiveTab] = useState('crop');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        lat: 28.6139,
        lon: 77.2090,
        elevation: 216,
        rainfall: 50,
        cropType: 'Wheat'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            let endpoint = '';
            if (activeTab === 'crop') endpoint = '/api/crop-health';
            else if (activeTab === 'disaster') endpoint = '/api/disaster-risk';
            else endpoint = '/api/urban-heat';

            const response = await axios.post(endpoint, formData);
            setResult(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'crop', label: 'Crop Health Monitor', icon: Sprout, color: 'text-green-400' },
        { id: 'disaster', label: 'Disaster Risk Checker', icon: AlertTriangle, color: 'text-yellow-400' },
        { id: 'heat', label: 'Urban Heat Mapper', icon: ThermometerSun, color: 'text-red-400' }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Smart Solutions</h2>

            <div className="flex space-x-4 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setResult(null); }}
                        className={`flex items-center px-6 py-4 rounded-xl border transition-all ${activeTab === tab.id
                                ? 'bg-gray-800 border-blue-500 shadow-lg shadow-blue-500/20'
                                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700'
                            }`}
                    >
                        <tab.icon className={`w-6 h-6 mr-3 ${tab.color}`} />
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                        Configuration
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Latitude</label>
                            <input
                                type="number"
                                name="lat"
                                value={formData.lat}
                                onChange={handleChange}
                                step="any"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Longitude</label>
                            <input
                                type="number"
                                name="lon"
                                value={formData.lon}
                                onChange={handleChange}
                                step="any"
                                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {activeTab === 'crop' && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Crop Type</label>
                                <select
                                    name="cropType"
                                    value={formData.cropType}
                                    onChange={handleChange}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                >
                                    <option>Wheat</option>
                                    <option>Rice</option>
                                    <option>Corn</option>
                                    <option>Soybean</option>
                                </select>
                            </div>
                        )}

                        {activeTab === 'disaster' && (
                            <>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Elevation (m)</label>
                                    <input
                                        type="number"
                                        name="elevation"
                                        value={formData.elevation}
                                        onChange={handleChange}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Rainfall (mm)</label>
                                    <input
                                        type="number"
                                        name="rainfall"
                                        value={formData.rainfall}
                                        onChange={handleChange}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg mt-4 transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Run Analysis'}
                        </button>
                    </form>
                </div>

                <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-6">Analysis Report</h3>

                    {result ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                {result.ndvi && (
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                                        <p className="text-gray-400 text-sm">NDVI Index</p>
                                        <p className="text-2xl font-bold text-green-400">{result.ndvi.toFixed(3)}</p>
                                    </div>
                                )}
                                {result.temperature && (
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                                        <p className="text-gray-400 text-sm">Temperature</p>
                                        <p className="text-2xl font-bold text-red-400">{result.temperature.toFixed(1)}°C</p>
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-invert max-w-none bg-gray-900/30 p-6 rounded-lg border border-gray-600">
                                <div className="whitespace-pre-line text-gray-300">
                                    {result.analysis}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <ArrowRight className="w-12 h-12 mb-4 opacity-20" />
                            <p>Configure parameters and run analysis to see results</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartSolutions;
