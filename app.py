"""
SatelliteGPT - Multi-Satellite Data Fusion Dashboard
Complete working version with all features - FIXED
"""

import streamlit as st
import folium
from streamlit_folium import st_folium
from datetime import datetime
import json

# Import our modules
try:
    from satellite_data import SatelliteDataFetcher
    SATELLITE_MODULE = True
except ImportError as e:
    st.error(f"❌ Cannot import satellite_data: {e}")
    SATELLITE_MODULE = False

try:
    from ai_analysis import AIAnalyzer
    AI_MODULE = True
except ImportError as e:
    st.error(f"❌ Cannot import ai_analysis: {e}")
    AI_MODULE = False

# Import data fusion if available
try:
    from data_fusion import DataFusionEngine
    FUSION_AVAILABLE = True
except ImportError:
    FUSION_AVAILABLE = False

# Page configuration
st.set_page_config(
    page_title="🛰️ SatelliteGPT",
    page_icon="🛰️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        padding: 1rem 0;
        margin-bottom: 0.5rem;
    }
    
    .sub-header {
        text-align: center;
        color: #666;
        font-size: 1.2rem;
        margin-bottom: 2rem;
    }
    
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        margin: 0.5rem 0;
        text-align: center;
    }
    
    .satellite-badge {
        display: inline-block;
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        margin: 0.3rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .badge-success {
        background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
        color: #155724;
    }
    
    .badge-warning {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        color: #856404;
    }
    
    .badge-info {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #0c5460;
    }
    
    .badge-danger {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #721c24;
    }
    
    .info-box {
        background: linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%);
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid #0288d1;
        margin: 1rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .success-box {
        background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid #4caf50;
        margin: 1rem 0;
    }
    
    .warning-box {
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid #ff9800;
        margin: 1rem 0;
    }
    
    .section-header {
        font-size: 1.8rem;
        font-weight: 600;
        color: #667eea;
        margin: 2rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 3px solid #667eea;
    }
    
    .stacked-metric {
        background: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin: 0.5rem 0;
        border-left: 4px solid #667eea;
    }
    
    .stButton>button {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        border-radius: 10px;
        border: none;
        padding: 0.7rem 2rem;
        transition: all 0.3s;
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
</style>
""", unsafe_allow_html=True)

# Check if modules are available
if not SATELLITE_MODULE or not AI_MODULE:
    st.error("⚠️ Critical modules missing! Please ensure satellite_data.py and ai_analysis.py are in the project folder.")
    st.stop()

# Initialize session state
if 'satellite_fetcher' not in st.session_state:
    st.session_state.satellite_fetcher = SatelliteDataFetcher()

if 'ai_analyzer' not in st.session_state:
    st.session_state.ai_analyzer = AIAnalyzer()

if 'fusion_engine' not in st.session_state and FUSION_AVAILABLE:
    st.session_state.fusion_engine = DataFusionEngine()

if 'selected_location' not in st.session_state:
    st.session_state.selected_location = None

if 'satellite_data' not in st.session_state:
    st.session_state.satellite_data = None

# Main header
st.markdown('<div class="main-header">🛰️ SatelliteGPT</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Advanced Multi-Satellite Data Fusion Dashboard</div>', unsafe_allow_html=True)

# Sidebar navigation
with st.sidebar:
    st.markdown("## 🧭 Navigation")
    
    module = st.radio(
        "Select Module:",
        [
            "🗺️ Satellite Explorer",
            "🖼️ Image Analyzer", 
            "🔧 Smart Solutions",
            "🔗 Data Fusion Hub"
        ],
        index=0
    )
    
    st.markdown("---")
    
    st.markdown("## 📊 System Status")
    
    if st.session_state.ai_analyzer.client:
        ai_status_text = "🟢 AI Active"
        ai_provider = st.session_state.ai_analyzer.provider.title()
        st.success(f"**AI:** {ai_status_text}")
        st.caption(f"Provider: {ai_provider}")
    else:
        st.warning("**AI:** 🟡 Fallback Mode")
        st.caption("Using smart fallback responses")
    
    try:
        import ee
        ee.Initialize()
        st.success("**Earth Engine:** 🟢 Connected")
    except Exception as e:
        st.error("**Earth Engine:** 🔴 Not Connected")
        st.caption("Run: earthengine authenticate")
    
    if FUSION_AVAILABLE:
        st.success("**Data Fusion:** 🟢 Available")
    else:
        st.info("**Data Fusion:** 🔵 Not Loaded")
    
    st.markdown("---")
    
    st.markdown("## 🛰️ Active Satellites")
    st.markdown("""
    <div style='font-size: 0.9rem;'>
    <b>Optical:</b><br/>
    • Sentinel-2 (10m)<br/>
    • Landsat-8 (30m)<br/>
    <br/>
    <b>Radar:</b><br/>
    • Sentinel-1 SAR (10m)<br/>
    <br/>
    <b>Thermal:</b><br/>
    • MODIS (1km)<br/>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    st.markdown("## 📈 Quick Stats")
    if st.session_state.satellite_data:
        data = st.session_state.satellite_data
        st.metric("Data Points", f"{data['summary']['active_satellites']}/4")
        st.metric("Quality", data['summary']['data_quality'])
    else:
        st.caption("Select a location to view stats")


# =============================================================================
# MODULE 1: SATELLITE EXPLORER
# =============================================================================
if module == "🗺️ Satellite Explorer":
    st.markdown("## 🗺️ Satellite Explorer")
    st.markdown("Click anywhere on the map to analyze that location with multiple satellites")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("### 🌍 Interactive Map")
        
        # Create Folium map - FIXED VERSION
        m = folium.Map(
            location=[28.6139, 77.2090],
            zoom_start=6,
            tiles='OpenStreetMap'
        )
        
        # Add layer control with proper attributions - FIXED
        folium.TileLayer(
            tiles='https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.jpg',
            attr='Map tiles by Stadia Maps, under CC BY 3.0',
            name='Terrain'
        ).add_to(m)
        
        folium.TileLayer(
            tiles='CartoDB positron',
            name='Light',
            attr='© OpenStreetMap © CARTO'
        ).add_to(m)
        
        folium.TileLayer(
            tiles='CartoDB dark_matter',
            name='Dark',
            attr='© OpenStreetMap © CARTO'
        ).add_to(m)
        
        folium.LayerControl().add_to(m)
        
        # Display map and get clicks - FIXED INDENTATION
        map_data = st_folium(m, width=700, height=500, key="main_map")
        
        # Handle map clicks - FIXED INDENTATION
        if map_data and map_data.get('last_clicked'):
            lat = map_data['last_clicked']['lat']
            lon = map_data['last_clicked']['lng']
            
            st.session_state.selected_location = {'lat': lat, 'lon': lon}
            
            with st.spinner('🛰️ Fetching multi-satellite data...'):
                try:
                    satellite_data = st.session_state.satellite_fetcher.get_all_satellite_data(lat, lon)
                    st.session_state.satellite_data = satellite_data
                    st.success(f"✅ Data fetched for ({lat:.4f}, {lon:.4f})")
                except Exception as e:
                    st.error(f"Error fetching data: {e}")
    
    with col2:
        st.markdown("### 📍 Location Info")
        
        if st.session_state.selected_location:
            loc = st.session_state.selected_location
            
            st.markdown(f"""
            <div class='info-box'>
            <b>Coordinates:</b><br/>
            Latitude: {loc['lat']:.6f}<br/>
            Longitude: {loc['lon']:.6f}
            </div>
            """, unsafe_allow_html=True)
            
            if st.session_state.satellite_data:
                data = st.session_state.satellite_data
                summary = data['summary']
                
                st.markdown("### 📊 Data Summary")
                
                col_a, col_b = st.columns(2)
                with col_a:
                    st.metric(
                        "Active Satellites",
                        f"{summary['active_satellites']}",
                        f"of {summary['total_satellites']}"
                    )
                
                with col_b:
                    st.metric(
                        "Resolution",
                        summary['best_resolution']
                    )
                
                st.metric("Data Quality", summary['data_quality'])
                
                st.markdown("### 🛰️ Status")
                for sat_name, status in summary['satellites_status'].items():
                    if '✅' in status:
                        badge_class = 'badge-success'
                    elif '⚠️' in status:
                        badge_class = 'badge-warning'
                    elif '❌' in status:
                        badge_class = 'badge-danger'
                    else:
                        badge_class = 'badge-info'
                    
                    st.markdown(
                        f'<span class="satellite-badge {badge_class}">{sat_name}</span>',
                        unsafe_allow_html=True
                    )
        else:
            st.info("👆 Click on the map to select a location and fetch satellite data")
    
    # Display detailed satellite data if available
    if st.session_state.satellite_data:
        st.markdown("---")
        st.markdown('<div class="section-header">📊 Detailed Satellite Analysis</div>', unsafe_allow_html=True)
        
        data = st.session_state.satellite_data
        satellites = data['satellites']
        
        tab_list = [f"📡 {name.replace('_', '-').upper()}" for name in satellites.keys()]
        tabs = st.tabs(tab_list)
        
        for i, (sat_name, sat_data) in enumerate(satellites.items()):
            with tabs[i]:
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.markdown("#### Basic Info")
                    st.markdown(f"**Satellite:** {sat_data.get('satellite', 'N/A')}")
                    st.markdown(f"**Resolution:** {sat_data.get('resolution', 'N/A')}")
                    st.markdown(f"**Type:** {sat_data.get('type', 'Optical')}")
                    
                    status = sat_data.get('status', 'unknown')
                    if status == 'success':
                        st.success(f"Status: ✅ {status}")
                    elif status == 'fallback':
                        st.warning(f"Status: ⚠️ {status}")
                    else:
                        st.info(f"Status: {status}")
                
                with col2:
                    if 'indices' in sat_data:
                        st.markdown("#### Vegetation Indices")
                        indices = sat_data['indices']
                        for key, value in indices.items():
                            if isinstance(value, (int, float)):
                                st.metric(key.upper(), f"{value:.3f}")
                
                with col3:
                    if 'temperature' in sat_data:
                        st.markdown("#### Temperature")
                        temp = sat_data['temperature']
                        if isinstance(temp, dict):
                            for key, value in temp.items():
                                st.metric(key.title(), f"{value:.1f}°C")
                        else:
                            st.metric("Surface Temp", f"{temp:.1f}°C")
                    
                    if 'soil_moisture_estimate' in sat_data:
                        st.markdown("#### Soil Data")
                        moisture = sat_data['soil_moisture_estimate']
                        st.metric("Moisture", f"{moisture:.1f}%")
                
                if 'quality' in sat_data:
                    st.markdown("#### Data Quality Metrics")
                    quality = sat_data['quality']
                    
                    q_cols = st.columns(len(quality))
                    for idx, (key, value) in enumerate(quality.items()):
                        with q_cols[idx]:
                            st.metric(
                                key.replace('_', ' ').title(),
                                value if isinstance(value, str) else f"{value:.1f}"
                            )
                
                if 'polarization' in sat_data:
                    st.markdown("#### Polarization Data")
                    pol_data = sat_data['polarization']
                    
                    p_cols = st.columns(len(pol_data))
                    for idx, (key, value) in enumerate(pol_data.items()):
                        with p_cols[idx]:
                            st.metric(key, f"{value:.2f}")
                
                with st.expander("🔍 View Raw Data (JSON)"):
                    st.json(sat_data)
        
        st.markdown("---")
        st.markdown('<div class="section-header">🤖 AI-Powered Analysis</div>', unsafe_allow_html=True)
        
        col1, col2 = st.columns([3, 1])
        
        with col1:
            st.markdown("Generate comprehensive AI analysis of the selected location using satellite data.")
        
        with col2:
            analyze_btn = st.button("🚀 Generate Analysis", type="primary", use_container_width=True)
        
        if analyze_btn:
            with st.spinner("🤖 AI is analyzing satellite data..."):
                try:
                    loc = st.session_state.selected_location
                    ndvi = satellites.get('sentinel2', {}).get('indices', {}).get('ndvi', 0.5)
                    temp = satellites.get('landsat8', {}).get('temperature', 25.0)
                    
                    analysis = st.session_state.ai_analyzer.analyze_satellite_location(
                        loc['lat'],
                        loc['lon'],
                        {'ndvi': ndvi, 'temperature': temp}
                    )
                    
                    st.markdown('<div class="success-box">', unsafe_allow_html=True)
                    st.markdown("### 📝 Analysis Results")
                    st.markdown(analysis)
                    st.markdown('</div>', unsafe_allow_html=True)
                    
                except Exception as e:
                    st.error(f"Analysis error: {e}")


# =============================================================================
# MODULE 2: IMAGE ANALYZER
# =============================================================================
elif module == "🖼️ Image Analyzer":
    st.markdown("## 🖼️ Satellite Image Analyzer")
    st.markdown("Upload satellite images for instant AI-powered analysis")
    
    uploaded_file = st.file_uploader(
        "📤 Upload Satellite Image",
        type=['png', 'jpg', 'jpeg', 'tif', 'tiff'],
        help="Supported formats: PNG, JPG, JPEG, TIF, TIFF"
    )
    
    if uploaded_file:
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.markdown("### 📷 Uploaded Image")
            st.image(uploaded_file, caption=uploaded_file.name, use_container_width=True)
        
        with col2:
            st.markdown("### 📄 File Details")
            st.markdown(f"""
            <div class='info-box'>
            <b>Filename:</b> {uploaded_file.name}<br/>
            <b>Size:</b> {uploaded_file.size / 1024:.2f} KB<br/>
            <b>Type:</b> {uploaded_file.type}
            </div>
            """, unsafe_allow_html=True)
            
            analyze_btn = st.button("🔍 Analyze Image", type="primary", use_container_width=True)
        
        if analyze_btn:
            with st.spinner("🤖 Analyzing image with AI..."):
                try:
                    analysis = st.session_state.ai_analyzer.analyze_satellite_image(uploaded_file.name)
                    
                    st.markdown("---")
                    st.markdown('<div class="section-header">📊 Analysis Results</div>', unsafe_allow_html=True)
                    st.markdown('<div class="success-box">', unsafe_allow_html=True)
                    st.markdown(analysis)
                    st.markdown('</div>', unsafe_allow_html=True)
                    
                except Exception as e:
                    st.error(f"Analysis error: {e}")
    else:
        st.info("👆 Please upload a satellite image to begin analysis")


# =============================================================================
# MODULE 3: SMART SOLUTIONS
# =============================================================================
elif module == "🔧 Smart Solutions":
    st.markdown("## 🔧 Smart Solutions")
    st.markdown("Specialized tools for agriculture, disaster management, and urban planning")
    
    solution = st.selectbox(
        "🎯 Choose a Solution:",
        ["🌾 Crop Health Monitor", "⚠️ Disaster Risk Checker", "🌡️ Urban Heat Mapper"]
    )
    
    st.markdown("---")
    
    if solution == "🌾 Crop Health Monitor":
        st.markdown('<div class="section-header">🌾 Crop Health Monitor</div>', unsafe_allow_html=True)
        st.markdown("Monitor crop health using multi-satellite vegetation analysis")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### 📍 Farm Location")
            farm_lat = st.number_input("Latitude", value=28.6139, format="%.6f", key="crop_lat")
            farm_lon = st.number_input("Longitude", value=77.2090, format="%.6f", key="crop_lon")
        
        with col2:
            st.markdown("#### 🌾 Crop Details")
            crop_type = st.selectbox(
                "Crop Type",
                ["Wheat", "Rice", "Corn", "Soybean", "Cotton", "Sugarcane", "Pulses"]
            )
            season = st.selectbox("Season", ["Kharif (Monsoon)", "Rabi (Winter)", "Zaid (Summer)"])
        
        if st.button("🔍 Analyze Crop Health", type="primary", use_container_width=True):
            with st.spinner("Analyzing crop health from satellite data..."):
                try:
                    data = st.session_state.satellite_fetcher.get_all_satellite_data(farm_lat, farm_lon)
                    
                    ndvi = data['satellites'].get('sentinel2', {}).get('indices', {}).get('ndvi', 0.5)
                    evi = data['satellites'].get('sentinel2', {}).get('indices', {}).get('evi', 0.3)
                    temp = data['satellites'].get('landsat8', {}).get('temperature', 25.0)
                    moisture = data['satellites'].get('sentinel1', {}).get('soil_moisture_estimate', 50.0)
                    
                    st.markdown("---")
                    st.markdown("### 📊 Health Metrics")
                    
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        health_score = int(ndvi * 100)
                        st.metric("Health Score", f"{health_score}/100", 
                                 delta="Good" if health_score > 60 else "Needs Attention")
                    
                    with col2:
                        st.metric("NDVI", f"{ndvi:.3f}",
                                 delta="Healthy" if ndvi > 0.6 else "Stressed")
                    
                    with col3:
                        st.metric("Temperature", f"{temp:.1f}°C",
                                 delta="Normal" if 20 <= temp <= 35 else "Alert")
                    
                    with col4:
                        st.metric("Soil Moisture", f"{moisture:.0f}%",
                                 delta="Good" if moisture > 40 else "Low")
                    
                    st.markdown("### 🤖 Detailed Analysis")
                    analysis = st.session_state.ai_analyzer.crop_health_analysis(
                        farm_lat, farm_lon, ndvi, temp
                    )
                    st.markdown('<div class="success-box">', unsafe_allow_html=True)
                    st.markdown(analysis)
                    st.markdown('</div>', unsafe_allow_html=True)
                    
                except Exception as e:
                    st.error(f"Error: {e}")
    
    elif solution == "⚠️ Disaster Risk Checker":
        st.markdown('<div class="section-header">⚠️ Disaster Risk Assessment</div>', unsafe_allow_html=True)
        st.markdown("Assess flood, landslide, and fire risks using satellite data")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### 📍 Location")
            risk_lat = st.number_input("Latitude", value=28.6139, format="%.6f", key="risk_lat")
            risk_lon = st.number_input("Longitude", value=77.2090, format="%.6f", key="risk_lon")
            elevation = st.number_input("Elevation (meters)", value=216, min_value=0, max_value=9000)
        
        with col2:
            st.markdown("#### 🌧️ Weather Data")
            rainfall = st.number_input("Recent Rainfall (mm)", value=50.0, min_value=0.0, max_value=500.0)
            area_type = st.selectbox("Area Type", ["Urban", "Rural", "Forest", "Coastal", "Mountainous"])
        
        if st.button("⚠️ Assess Risk", type="primary", use_container_width=True):
            with st.spinner("Assessing disaster risks..."):
                try:
                    data = st.session_state.satellite_fetcher.get_all_satellite_data(risk_lat, risk_lon)
                    ndvi = data['satellites'].get('sentinel2', {}).get('indices', {}).get('ndvi', 0.5)
                    temp = data['satellites'].get('landsat8', {}).get('temperature', 28.0)
                    
                    analysis = st.session_state.ai_analyzer.disaster_risk_analysis(
                        risk_lat, risk_lon, elevation, rainfall, ndvi
                    )
                    
                    st.markdown("---")
                    st.markdown("### ⚠️ Risk Assessment")
                    st.markdown('<div class="warning-box">', unsafe_allow_html=True)
                    st.markdown(analysis)
                    st.markdown('</div>', unsafe_allow_html=True)
                    
                except Exception as e:
                    st.error(f"Error: {e}")
    
    else:
        st.markdown('<div class="section-header">🌡️ Urban Heat Island Mapper</div>', unsafe_allow_html=True)
        st.markdown("Identify and analyze urban heat islands using thermal satellite data")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### 📍 City Location")
            city_lat = st.number_input("Latitude", value=28.6139, format="%.6f", key="heat_lat")
            city_lon = st.number_input("Longitude", value=77.2090, format="%.6f", key="heat_lon")
        
        with col2:
            st.markdown("#### 🏙️ City Details")
            city_name = st.text_input("City Name", value="Delhi")
            population = st.selectbox("Population", 
                                     ["< 100K", "100K - 500K", "500K - 1M", "1M - 5M", "> 5M"])
        
        if st.button("🌡️ Map Heat Islands", type="primary", use_container_width=True):
            with st.spinner("Mapping urban heat distribution..."):
                try:
                    data = st.session_state.satellite_fetcher.get_all_satellite_data(city_lat, city_lon)
                    
                    temp = data['satellites'].get('landsat8', {}).get('temperature', 28.0)
                    ndvi = data['satellites'].get('sentinel2', {}).get('indices', {}).get('ndvi', 0.5)
                    
                    st.markdown("---")
                    st.markdown("### 🌡️ Thermal Analysis")
                    
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        st.metric("Surface Temperature", f"{temp:.1f}°C",
                                 delta=f"+{temp-25:.1f}°C from normal")
                    
                    with col2:
                        st.metric("Vegetation Cover", f"{ndvi:.2f}",
                                 delta="Good" if ndvi > 0.4 else "Low")
                    
                    with col3:
                        heat_stress = "High" if temp > 35 else "Moderate" if temp > 30 else "Low"
                        st.metric("Heat Stress Level", heat_stress)
                    
                    analysis = st.session_state.ai_analyzer.urban_heat_analysis(
                        city_lat, city_lon, temp, ndvi
                    )
                    
                    st.markdown("### 🏙️ Heat Island Analysis")
                    st.markdown('<div class="warning-box">', unsafe_allow_html=True)
                    st.markdown(analysis)
                    st.markdown('</div>', unsafe_allow_html=True)
                    
                except Exception as e:
                    st.error(f"Error: {e}")


# =============================================================================
# MODULE 4: DATA FUSION HUB - COMPLETE SECTION
# =============================================================================
# Paste this AFTER line starting with "else:" for Module 4

else:
    st.markdown('<div class="section-header">🔗 Data Fusion Hub</div>', unsafe_allow_html=True)
    st.markdown("Combine and cross-validate data from multiple satellite sources")
    
    if not FUSION_AVAILABLE:
        st.warning("⚠️ Data Fusion module not loaded. Please ensure data_fusion.py is available.")
        st.info("💡 You can still explore individual satellite data in the Satellite Explorer module.")
    else:
        col1, col2, col3 = st.columns([2, 2, 1])
        
        with col1:
            fusion_lat = st.number_input("Latitude", value=28.6139, format="%.6f", key="fusion_lat")
        
        with col2:
            fusion_lon = st.number_input("Longitude", value=77.2090, format="%.6f", key="fusion_lon")
        
        with col3:
            st.markdown("<br>", unsafe_allow_html=True)
            fusion_btn = st.button("🔗 Fuse Data", type="primary", use_container_width=True)
        
        if fusion_btn:
            with st.spinner("🔗 Fusing data from multiple satellites..."):
                try:
                    # Fetch data from all satellites
                    data = st.session_state.satellite_fetcher.get_all_satellite_data(fusion_lat, fusion_lon)
                    
                    # Run data fusion
                    fused_data = st.session_state.fusion_engine.fuse_satellite_data(data)
                    
                    # Display fusion results
                    st.markdown("---")
                    st.markdown("### 🎯 Fusion Results")
                    
                    # Key metrics from fusion
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        confidence = fused_data.get('overall_confidence', 0.85)
                        st.metric("Confidence Score", f"{confidence:.1%}",
                                 delta="High" if confidence > 0.8 else "Medium")
                    
                    with col2:
                        sources = len(fused_data.get('data_sources', []))
                        st.metric("Active Sources", sources, delta=f"{sources} satellites")
                    
                    with col3:
                        consensus = fused_data.get('consensus_level', 'High')
                        st.metric("Data Consensus", consensus)
                    
                    with col4:
                        quality = fused_data.get('overall_quality', 'Good')
                        st.metric("Fused Quality", quality)
                    
                    # Display fused metrics
                    st.markdown("### 📊 Fused Metrics")
                    
                    fused_metrics = fused_data.get('fused_metrics', {})
                    if fused_metrics:
                        metric_cols = st.columns(len(fused_metrics))
                        
                        for idx, (metric_name, metric_value) in enumerate(fused_metrics.items()):
                            with metric_cols[idx]:
                                # Get confidence for this metric
                                conf = fused_data.get('confidence_scores', {}).get(metric_name, 0.5)
                                st.metric(
                                    metric_name.upper().replace('_', ' '),
                                    f"{metric_value:.3f}",
                                    delta=f"{conf:.0%} confidence"
                                )
                    
                    # Cross-validation results
                    st.markdown("### ✅ Cross-Validation")
                    
                    cross_val = fused_data.get('cross_validation', {})
                    if cross_val:
                        for metric, result in cross_val.items():
                            with st.expander(f"📊 {metric.replace('_', ' ').title()}"):
                                col_a, col_b = st.columns(2)
                                
                                with col_a:
                                    st.markdown("**Source Values:**")
                                    sources = result.get('sources', {})
                                    for source, value in sources.items():
                                        st.markdown(f"• **{source.upper()}**: `{value:.3f}`")
                                
                                with col_b:
                                    st.markdown("**Fusion Output:**")
                                    st.markdown(f"• **Fused Value**: `{result.get('fused', 0):.3f}`")
                                    st.markdown(f"• **Variance**: `{result.get('variance', 0):.4f}`")
                                    st.markdown(f"• **Agreement**: `{result.get('agreement', 'N/A')}`")
                                    st.markdown(f"• **Sources**: `{result.get('num_sources', 0)}`")
                    
                    # Comprehensive analysis
                    st.markdown("### 🤖 Comprehensive Analysis")
                    
                    try:
                        # Create summary for AI
                        analysis_input = {
                            'location': {'lat': fusion_lat, 'lon': fusion_lon},
                            'fused_metrics': fused_metrics,
                            'confidence': fused_data.get('overall_confidence', 0),
                            'quality': quality,
                            'consensus': consensus,
                            'num_sources': len(fused_data.get('data_sources', []))
                        }
                        
                        # Get AI analysis
                        analysis = st.session_state.ai_analyzer.analyze_satellite_location(
                            fusion_lat,
                            fusion_lon,
                            fused_metrics
                        )
                        
                        st.markdown('<div class="success-box">', unsafe_allow_html=True)
                        st.markdown(analysis)
                        st.markdown('</div>', unsafe_allow_html=True)
                        
                    except Exception as e:
                        st.warning(f"AI analysis unavailable: {e}")
                    
                    # Raw fusion data
                    with st.expander("🔍 View Complete Fusion Data (JSON)"):
                        st.json(fused_data)
                    
                    # Download option
                    st.markdown("### 💾 Export Data")
                    
                    col_dl1, col_dl2 = st.columns(2)
                    
                    with col_dl1:
                        # Create JSON download
                        json_str = json.dumps(fused_data, indent=2)
                        st.download_button(
                            label="📥 Download Fusion Results (JSON)",
                            data=json_str,
                            file_name=f"fusion_results_{fusion_lat}_{fusion_lon}.json",
                            mime="application/json"
                        )
                    
                    with col_dl2:
                        # Create CSV summary
                        csv_data = "Metric,Value,Confidence\n"
                        for metric, value in fused_metrics.items():
                            conf = fused_data.get('confidence_scores', {}).get(metric, 0)
                            csv_data += f"{metric},{value:.6f},{conf:.4f}\n"
                        
                        st.download_button(
                            label="📥 Download Metrics (CSV)",
                            data=csv_data,
                            file_name=f"fusion_metrics_{fusion_lat}_{fusion_lon}.csv",
                            mime="text/csv"
                        )
                    
                except Exception as e:
                    st.error(f"Fusion error: {e}")
                    st.info("Try selecting a different location or check satellite availability.")
                    
                    # Show error details in expander
                    with st.expander("🔍 Error Details"):
                        st.code(str(e))


# =============================================================================
# FOOTER
# =============================================================================
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666; padding: 2rem 0;'>
    <p style='font-size: 0.9rem;'>
        🛰️ <b>SatelliteGPT</b> | Multi-Satellite Data Fusion Platform<br/>
        Powered by Sentinel-2, Landsat-8, Sentinel-1 SAR, MODIS, and ISRO Satellites<br/>
        <small>Built with Streamlit • Google Earth Engine • AI Analysis</small>
    </p>
    <p style='font-size: 0.8rem; margin-top: 1rem;'>
        Data Sources: ESA Copernicus, NASA, ISRO<br/>
        <small>© 2026 SatelliteGPT - Advanced Remote Sensing Platform</small>
    </p>
</div>
""", unsafe_allow_html=True)


# =============================================================================
# SESSION STATE MANAGEMENT & HELPER FUNCTIONS
# =============================================================================

def clear_session_data():
    """Clear satellite data from session"""
    if 'satellite_data' in st.session_state:
        st.session_state.satellite_data = None
    if 'selected_location' in st.session_state:
        st.session_state.selected_location = None


# Add clear button in sidebar
with st.sidebar:
    st.markdown("---")
    if st.button("🗑️ Clear Data", use_container_width=True):
        clear_session_data()
        st.success("Data cleared!")
        st.rerun()
    
    # About section
    with st.expander("ℹ️ About SatelliteGPT"):
        st.markdown("""
        **SatelliteGPT** is an advanced multi-satellite data fusion platform that combines:
        
        - **Optical satellites** (Sentinel-2, Landsat-8, IRS)
        - **Radar satellites** (Sentinel-1, RISAT)
        - **Thermal satellites** (MODIS)
        - **High-resolution** (Cartosat)
        
        **Features:**
        - Real-time satellite data access
        - AI-powered analysis
        - Data fusion algorithms
        - Cross-validation
        - Export capabilities
        
        **Version:** 1.0.0  
        **Last Updated:** January 2026
        """)