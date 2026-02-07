import { useState } from 'react';
import axios from 'axios';
import { Upload, FileImage, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ImageAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setAnalysis(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        try {
            // In a real app, send FormData. Here we send filename to match backend mock.
            const response = await axios.post('/api/analyze-image', {
                filename: file.name
            });
            setAnalysis(response.data.analysis);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-10 hover:border-blue-500 hover:bg-gray-700/50 transition-all"
                >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-xl font-medium text-gray-200">Upload Satellite Image</span>
                    <span className="text-sm text-gray-500 mt-2">Supports JPG, PNG, TIFF</span>
                </label>
            </div>

            {file && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                        <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-between items-center">
                            <div className="flex items-center text-sm text-gray-400">
                                <FileImage className="w-4 h-4 mr-2" />
                                <span className="truncate max-w-[200px]">{file.name}</span>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Run Analysis'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                            AI Analysis Results
                        </h3>
                        {analysis ? (
                            <div className="prose prose-invert max-w-none text-sm text-gray-300 whitespace-pre-line">
                                {analysis}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                <Loader2 className={`w-8 h-8 mb-2 ${loading ? 'animate-spin opacity-50' : 'opacity-20'}`} />
                                <p>{loading ? 'Analyzing image features...' : 'Waiting for analysis...'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageAnalyzer;
