import { useState } from 'react';
import axios from 'axios';
import { Link2, ShieldCheck, Database, GitMerge, Loader2 } from 'lucide-react';

const DataFusion = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090 });

    const handleFusion = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/fusion', location);
            setResult(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Data Fusion Hub</h2>
                    <p className="text-gray-400 mt-2">Combine multi-satellite data sources for high-confidence insights</p>
                </div>
                <button
                    onClick={handleFusion}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <GitMerge className="w-5 h-5 mr-2" />}
                    Fuse Data Sources
                </button>
            </div>

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    <div className="lg:col-span-3 grid grid-cols-4 gap-4">
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                            <ShieldCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{(result.overall_confidence * 100).toFixed(0)}%</div>
                            <div className="text-sm text-gray-400">Confidence Score</div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                            <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{result.data_sources?.length || 0}</div>
                            <div className="text-sm text-gray-400">Active Sources</div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                            <div className="text-2xl font-bold mt-2">{result.consensus_level}</div>
                            <div className="text-sm text-gray-400">Consensus</div>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                            <div className="text-2xl font-bold mt-2">{result.overall_quality}</div>
                            <div className="text-sm text-gray-400">Data Quality</div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="font-bold mb-4">Cross-Validation Metrics</h3>
                        <div className="space-y-4">
                            {Object.entries(result.cross_validation || {}).map(([key, val]) => (
                                <div key={key} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono text-blue-300 capitalize">{key.replace('_', ' ')}</span>
                                        <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                                            {val.agreement} Agreement
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Fused: <b className="text-white">{val.fused.toFixed(3)}</b></span>
                                        <span>Variance: {val.variance.toFixed(4)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="font-bold mb-4">Fused Metrics</h3>
                        <div className="space-y-4">
                            {Object.entries(result.fused_metrics || {}).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                                    <span className="text-gray-300 capitalize">{key.replace('_', ' ')}</span>
                                    <span className="font-mono text-xl">{val.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!result && !loading && (
                <div className="bg-gray-800/50 border border-dashed border-gray-600 rounded-xl p-12 text-center text-gray-500">
                    <p>Ready to process multi-spectral data fusion.</p>
                </div>
            )}
        </div>
    );
};

export default DataFusion;
