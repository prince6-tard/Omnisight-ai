"""
SatelliteGPT - Flask Web Application
Multi-Satellite Data Fusion API
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json

# Import existing modules (NO CHANGES NEEDED!)
from satellite_data import SatelliteDataFetcher
from ai_analysis import AIAnalyzer
from data_fusion import DataFusionEngine

app = Flask(__name__)
CORS(app)

# Initialize (same as Streamlit)
satellite_fetcher = SatelliteDataFetcher()
ai_analyzer = AIAnalyzer()
fusion_engine = DataFusionEngine()

# =============================================================================
# API ROUTES
# =============================================================================

@app.route('/')
def index():
    """Main dashboard"""
    return render_template('index.html')

@app.route('/api/satellite-data', methods=['POST'])
def get_satellite_data():
    """Fetch satellite data for location"""
    try:
        data = request.get_json()
        lat = float(data.get('lat'))
        lon = float(data.get('lon'))
        
        # Use EXACT SAME CODE as Streamlit
        satellite_data = satellite_fetcher.get_all_satellite_data(lat, lon)
        
        return jsonify({
            'success': True,
            'data': satellite_data
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/fusion', methods=['POST'])
def fusion_data():
    """Data fusion endpoint"""
    try:
        data = request.get_json()
        lat = float(data.get('lat'))
        lon = float(data.get('lon'))
        
        # Use EXACT SAME CODE
        satellite_data = satellite_fetcher.get_all_satellite_data(lat, lon)
        fused_data = fusion_engine.fuse_satellite_data(satellite_data)
        
        return jsonify({
            'success': True,
            'data': fused_data
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/crop-health', methods=['POST'])
def crop_health():
    """Crop health analysis"""
    try:
        data = request.get_json()
        lat = float(data.get('lat'))
        lon = float(data.get('lon'))
        
        sat_data = satellite_fetcher.get_all_satellite_data(lat, lon)
        ndvi = sat_data['satellites'].get('sentinel2', {}).get('indices', {}).get('ndvi', 0.5)
        temp = sat_data['satellites'].get('landsat8', {}).get('temperature', 25.0)
        
        analysis = ai_analyzer.crop_health_analysis(lat, lon, ndvi, temp)
        
        return jsonify({
            'success': True,
            'ndvi': ndvi,
            'temperature': temp,
            'analysis': analysis
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Analyze satellite image"""
    try:
        # In a real app, we would handle file upload here
        # For now, we simulate with filename to match current backend logic
        data = request.get_json()
        filename = data.get('filename', 'satellite_image.jpg')
        
        analysis = ai_analyzer.analyze_satellite_image(filename)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/disaster-risk', methods=['POST'])
def disaster_risk():
    """Disaster risk assessment"""
    try:
        data = request.get_json()
        lat = float(data.get('lat'))
        lon = float(data.get('lon'))
        elevation = float(data.get('elevation', 0))
        rainfall = float(data.get('rainfall', 0))
        
        # Fetch satellite data for real-time analysis
        sat_data = satellite_fetcher.get_all_satellite_data(lat, lon)
        ndvi = sat_data['satellites'].get('sentinel2', {}).get('indices', {}).get('ndvi', 0.5)
        
        analysis = ai_analyzer.disaster_risk_analysis(
            lat, lon, elevation, rainfall, ndvi
        )
        
        return jsonify({
            'success': True,
            'ndvi': ndvi,
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/urban-heat', methods=['POST'])
def urban_heat():
    """Urban heat island analysis"""
    try:
        data = request.get_json()
        lat = float(data.get('lat'))
        lon = float(data.get('lon'))
        
        # Fetch satellite data
        sat_data = satellite_fetcher.get_all_satellite_data(lat, lon)
        ndvi = sat_data['satellites'].get('sentinel2', {}).get('indices', {}).get('ndvi', 0.5)
        temp = sat_data['satellites'].get('landsat8', {}).get('temperature', 25.0)
        
        analysis = ai_analyzer.urban_heat_analysis(lat, lon, temp, ndvi)
        
        return jsonify({
            'success': True,
            'temperature': temp,
            'ndvi': ndvi,
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
def health_check():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'services': {
            'earth_engine': 'connected',
            'ai': 'active',
            'fusion': 'ready'
        }
    })

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )