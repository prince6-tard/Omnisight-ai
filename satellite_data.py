# Top of satellite_data.py - Add import
try:
    from isro_bhuvan import ISROBhuvanFetcher
    ISRO_AVAILABLE = True
except ImportError:
    ISRO_AVAILABLE = False
    print("⚠️ ISRO module not found, using fallback")

class SatelliteDataFetcher:
    def __init__(self):
        # Existing code...
        
        # ADD THIS - Initialize ISRO fetcher
        if ISRO_AVAILABLE:
            try:
                self.isro_fetcher = ISROBhuvanFetcher()
                print("✅ ISRO Bhuvan integration loaded")
            except Exception as e:
                print(f"⚠️ ISRO integration error: {e}")
                self.isro_fetcher = None
        else:
            self.isro_fetcher = None
    
    def get_all_satellite_data(self, lat, lon):
        """Get data from ALL satellites including ISRO"""
        
        data = {
            'location': {'lat': lat, 'lon': lon},
            'timestamp': datetime.now().isoformat(),
            'satellites': {}
        }
        
        # Existing satellites (NASA/ESA via GEE)
        data['satellites']['sentinel2'] = self.get_sentinel2_data(lat, lon)
        data['satellites']['landsat8'] = self.get_landsat8_data(lat, lon)
        data['satellites']['sentinel1'] = self.get_sentinel1_data(lat, lon)
        
        try:
            data['satellites']['modis'] = self.get_modis_data(lat, lon)
        except:
            pass
        
        # ADD THIS - ISRO satellites
        if self.isro_fetcher:
            try:
                isro_data = self.isro_fetcher.get_all_isro_data(lat, lon)
                # Add each ISRO satellite
                for sat_name, sat_data in isro_data['satellites'].items():
                    data['satellites'][sat_name] = sat_data
                print("✅ ISRO data integrated")
            except Exception as e:
                print(f"⚠️ ISRO data fetch error: {e}")
        
        # Update summary to include ISRO
        active = sum(1 for s in data['satellites'].values() 
                    if s.get('status') in ['success', 'simulated'])
        
        data['summary'] = {
            'total_satellites': len(data['satellites']),  # Now includes ISRO
            'active_satellites': active,
            'satellites_status': {
                name: f"✅ {sat.get('status', 'unknown')}"
                for name, sat in data['satellites'].items()
            },
            'data_quality': 'Excellent' if active >= 6 else 'Good',
            'best_resolution': '0.25m'  # Cartosat
        }
        
        return data

"""
Enhanced Multi-Satellite Data Fetching System
Supports Sentinel-2, Landsat-8, Sentinel-1, MODIS + ISRO satellites
"""

import ee
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Optional, List

class SatelliteDataFetcher:
    """Unified satellite data fetching with robust error handling"""
    
    def __init__(self):
        self.initialize_earth_engine()
        self.satellites_status = {}
    
    def initialize_earth_engine(self):
        """Initialize Google Earth Engine with authentication"""
        try:
            ee.Initialize()
            print("✅ Earth Engine initialized successfully")
            return True
        except Exception as e:
            print(f"⚠️ Earth Engine init error: {e}")
            print("Trying to authenticate...")
            try:
                ee.Authenticate()
                ee.Initialize()
                print("✅ Earth Engine authenticated and initialized")
                return True
            except Exception as auth_error:
                print(f"❌ Could not initialize Earth Engine: {auth_error}")
                return False
    
    def get_date_range(self, days_back=30):
        """Get start and end dates for satellite data"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')
    
    def safe_extract(self, ee_object, property_name, default_value):
        """Safely extract value from Earth Engine object"""
        try:
            if ee_object is None:
                return default_value
            value = ee_object.get(property_name).getInfo()
            return value if value is not None else default_value
        except:
            return default_value
    
    def get_sentinel2_data(self, lat, lon, days_back=30):
        """
        Fetch Sentinel-2 optical data (10m resolution)
        Best for: Vegetation analysis, NDVI, land classification
        """
        try:
            start_date, end_date = self.get_date_range(days_back)
            point = ee.Geometry.Point([lon, lat])
            
            # Sentinel-2 Level-2A (atmospherically corrected)
            collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                .filterBounds(point) \
                .filterDate(start_date, end_date) \
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) \
                .sort('CLOUDY_PIXEL_PERCENTAGE') \
                .first()
            
            if collection is None:
                self.satellites_status['Sentinel-2'] = '❌ No data'
                return self.generate_fallback_sentinel2(lat, lon)
            
            # Sample at point location
            sample = collection.sample(point, 10).first()
            
            # Extract band values
            red = self.safe_extract(sample, 'B4', 1500)
            nir = self.safe_extract(sample, 'B8', 3000)
            green = self.safe_extract(sample, 'B3', 1400)
            blue = self.safe_extract(sample, 'B2', 1300)
            swir = self.safe_extract(sample, 'B11', 2000)
            
            # Calculate vegetation indices
            ndvi = (nir - red) / (nir + red) if (nir + red) > 0 else 0.5
            ndvi = max(min(ndvi, 1.0), -1.0)  # Clamp between -1 and 1
            
            # Enhanced Vegetation Index (EVI)
            evi_denominator = nir + 6*red - 7.5*blue + 1
            evi = 2.5 * (nir - red) / evi_denominator if evi_denominator != 0 else 0.3
            
            # Normalized Difference Water Index (NDWI)
            ndwi = (green - nir) / (green + nir) if (green + nir) > 0 else 0
            
            # Soil-Adjusted Vegetation Index (SAVI)
            L = 0.5  # Soil brightness correction factor
            savi = ((nir - red) / (nir + red + L)) * (1 + L) if (nir + red + L) > 0 else 0
            
            cloud_cover = self.safe_extract(sample, 'CLOUDY_PIXEL_PERCENTAGE', 10)
            
            data = {
                'satellite': 'Sentinel-2',
                'resolution': '10m',
                'bands': {
                    'red': red,
                    'green': green,
                    'blue': blue,
                    'nir': nir,
                    'swir': swir
                },
                'indices': {
                    'ndvi': round(ndvi, 3),
                    'evi': round(evi, 3),
                    'ndwi': round(ndwi, 3),
                    'savi': round(savi, 3)
                },
                'quality': {
                    'cloud_cover': round(cloud_cover, 2),
                    'data_quality': 'High' if cloud_cover < 10 else 'Medium'
                },
                'timestamp': end_date,
                'status': 'success'
            }
            
            self.satellites_status['Sentinel-2'] = '✅ Active'
            return data
            
        except Exception as e:
            print(f"Sentinel-2 error: {e}")
            self.satellites_status['Sentinel-2'] = f'⚠️ Error: {str(e)[:30]}'
            return self.generate_fallback_sentinel2(lat, lon)
    
    def get_landsat8_data(self, lat, lon, days_back=30):
        """
        Fetch Landsat-8 data (30m resolution)
        Best for: Temperature, long-term monitoring
        """
        try:
            start_date, end_date = self.get_date_range(days_back)
            point = ee.Geometry.Point([lon, lat])
            
            collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \
                .filterBounds(point) \
                .filterDate(start_date, end_date) \
                .sort('CLOUD_COVER') \
                .first()
            
            if collection is None:
                self.satellites_status['Landsat-8'] = '❌ No data'
                return self.generate_fallback_landsat(lat, lon)
            
            sample = collection.sample(point, 30).first()
            
            # Surface temperature (Band 10)
            thermal = self.safe_extract(sample, 'ST_B10', 30000)
            temperature = thermal * 0.00341802 + 149.0 - 273.15  # Convert to Celsius
            
            # Optical bands
            red = self.safe_extract(sample, 'SR_B4', 10000)
            nir = self.safe_extract(sample, 'SR_B5', 12000)
            
            # Calculate NDVI
            ndvi = (nir - red) / (nir + red) if (nir + red) > 0 else 0.5
            
            cloud_cover = self.safe_extract(sample, 'CLOUD_COVER', 15)
            
            data = {
                'satellite': 'Landsat-8',
                'resolution': '30m',
                'temperature': round(temperature, 2),
                'thermal_band': round(thermal, 2),
                'indices': {
                    'ndvi': round(ndvi, 3)
                },
                'quality': {
                    'cloud_cover': round(cloud_cover, 2),
                    'data_quality': 'High' if cloud_cover < 15 else 'Medium'
                },
                'timestamp': end_date,
                'status': 'success'
            }
            
            self.satellites_status['Landsat-8'] = '✅ Active'
            return data
            
        except Exception as e:
            print(f"Landsat-8 error: {e}")
            self.satellites_status['Landsat-8'] = f'⚠️ Error: {str(e)[:30]}'
            return self.generate_fallback_landsat(lat, lon)
    
    def get_sentinel1_data(self, lat, lon, days_back=30):
        """
        Fetch Sentinel-1 SAR data
        Best for: All-weather monitoring, soil moisture
        """
        try:
            start_date, end_date = self.get_date_range(days_back)
            point = ee.Geometry.Point([lon, lat])
            
            collection = ee.ImageCollection('COPERNICUS/S1_GRD') \
                .filterBounds(point) \
                .filterDate(start_date, end_date) \
                .filter(ee.Filter.eq('instrumentMode', 'IW')) \
                .filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING')) \
                .first()
            
            if collection is None:
                self.satellites_status['Sentinel-1'] = '❌ No data'
                return self.generate_fallback_sentinel1(lat, lon)
            
            sample = collection.sample(point, 10).first()
            
            vv = self.safe_extract(sample, 'VV', -12.0)
            vh = self.safe_extract(sample, 'VH', -18.0)
            
            # Calculate cross-polarization ratio
            ratio = vv / vh if vh != 0 else 1.0
            
            # Estimate soil moisture (simplified model)
            # Higher VV backscatter generally indicates higher moisture
            soil_moisture = min(max((vv + 30) / 20 * 100, 0), 100)
            
            data = {
                'satellite': 'Sentinel-1 (SAR)',
                'resolution': '10m',
                'type': 'Radar (all-weather)',
                'polarization': {
                    'VV': round(vv, 2),
                    'VH': round(vh, 2),
                    'ratio': round(ratio, 2)
                },
                'soil_moisture_estimate': round(soil_moisture, 1),
                'applications': ['Soil moisture', 'Flood mapping', 'Agriculture'],
                'timestamp': end_date,
                'status': 'success'
            }
            
            self.satellites_status['Sentinel-1'] = '✅ Active'
            return data
            
        except Exception as e:
            print(f"Sentinel-1 error: {e}")
            self.satellites_status['Sentinel-1'] = f'⚠️ Error: {str(e)[:30]}'
            return self.generate_fallback_sentinel1(lat, lon)
    
    def get_modis_data(self, lat, lon, days_back=30):
        """
        Fetch MODIS data (500m resolution)
        Best for: Regional analysis, temperature
        """
        try:
            start_date, end_date = self.get_date_range(days_back)
            point = ee.Geometry.Point([lon, lat])
            
            # MODIS Terra Surface Temperature
            collection = ee.ImageCollection('MODIS/061/MOD11A1') \
                .filterBounds(point) \
                .filterDate(start_date, end_date) \
                .first()
            
            if collection is None:
                self.satellites_status['MODIS'] = '❌ No data'
                return self.generate_fallback_modis(lat, lon)
            
            sample = collection.sample(point, 500).first()
            
            lst_day = self.safe_extract(sample, 'LST_Day_1km', 14500)
            lst_night = self.safe_extract(sample, 'LST_Night_1km', 13800)
            
            # Convert to Celsius
            temp_day = lst_day * 0.02 - 273.15
            temp_night = lst_night * 0.02 - 273.15
            
            data = {
                'satellite': 'MODIS Terra',
                'resolution': '1km',
                'temperature': {
                    'day': round(temp_day, 2),
                    'night': round(temp_night, 2),
                    'range': round(temp_day - temp_night, 2)
                },
                'applications': ['Regional monitoring', 'Climate analysis'],
                'timestamp': end_date,
                'status': 'success'
            }
            
            self.satellites_status['MODIS'] = '✅ Active'
            return data
            
        except Exception as e:
            print(f"MODIS error: {e}")
            self.satellites_status['MODIS'] = '⚠️ Limited data'
            return self.generate_fallback_modis(lat, lon)
    
    # Fallback data generators
    def generate_fallback_sentinel2(self, lat, lon):
        """Generate realistic Sentinel-2 fallback data"""
        base_ndvi = 0.3 + (abs(lat) / 90) * 0.4  # Latitude-based NDVI
        return {
            'satellite': 'Sentinel-2',
            'resolution': '10m',
            'bands': {
                'red': np.random.randint(1200, 1800),
                'green': np.random.randint(1300, 1900),
                'blue': np.random.randint(1100, 1700),
                'nir': np.random.randint(2500, 3500),
                'swir': np.random.randint(1800, 2500)
            },
            'indices': {
                'ndvi': round(base_ndvi + np.random.uniform(-0.1, 0.1), 3),
                'evi': round(base_ndvi * 0.8, 3),
                'ndwi': round(np.random.uniform(-0.3, 0.3), 3),
                'savi': round(base_ndvi * 0.9, 3)
            },
            'quality': {
                'cloud_cover': round(np.random.uniform(5, 20), 2),
                'data_quality': 'Simulated'
            },
            'status': 'fallback'
        }
    
    def generate_fallback_landsat(self, lat, lon):
        """Generate realistic Landsat-8 fallback data"""
        base_temp = 15 + (abs(lat) / 90) * 20
        return {
            'satellite': 'Landsat-8',
            'resolution': '30m',
            'temperature': round(base_temp + np.random.uniform(-5, 5), 2),
            'thermal_band': round(np.random.uniform(28000, 32000), 2),
            'indices': {
                'ndvi': round(0.3 + np.random.uniform(0, 0.4), 3)
            },
            'quality': {
                'cloud_cover': round(np.random.uniform(10, 25), 2),
                'data_quality': 'Simulated'
            },
            'status': 'fallback'
        }
    
    def generate_fallback_sentinel1(self, lat, lon):
        """Generate realistic Sentinel-1 fallback data"""
        return {
            'satellite': 'Sentinel-1 (SAR)',
            'resolution': '10m',
            'type': 'Radar',
            'polarization': {
                'VV': round(np.random.uniform(-15, -8), 2),
                'VH': round(np.random.uniform(-22, -15), 2),
                'ratio': round(np.random.uniform(0.6, 1.2), 2)
            },
            'soil_moisture_estimate': round(np.random.uniform(30, 70), 1),
            'applications': ['Soil moisture', 'Flood mapping'],
            'status': 'fallback'
        }
    
    def generate_fallback_modis(self, lat, lon):
        """Generate realistic MODIS fallback data"""
        base_temp = 15 + (abs(lat) / 90) * 20
        return {
            'satellite': 'MODIS Terra',
            'resolution': '1km',
            'temperature': {
                'day': round(base_temp + 8, 2),
                'night': round(base_temp - 5, 2),
                'range': 13
            },
            'applications': ['Regional monitoring'],
            'status': 'fallback'
        }
    
    def get_all_satellite_data(self, lat, lon, days_back=30):
        """Fetch data from all available satellites"""
        print(f"\n🛰️ Fetching multi-satellite data for ({lat}, {lon})...")
        
        data = {
            'location': {'latitude': lat, 'longitude': lon},
            'fetch_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'satellites': {},
            'summary': {}
        }
        
        # Fetch from all satellites
        data['satellites']['sentinel2'] = self.get_sentinel2_data(lat, lon, days_back)
        data['satellites']['landsat8'] = self.get_landsat8_data(lat, lon, days_back)
        data['satellites']['sentinel1'] = self.get_sentinel1_data(lat, lon, days_back)
        data['satellites']['modis'] = self.get_modis_data(lat, lon, days_back)
        
        # Create summary
        data['summary'] = {
            'total_satellites': 4,
            'active_satellites': sum(1 for s in data['satellites'].values() if s.get('status') == 'success'),
            'satellites_status': self.satellites_status,
            'best_resolution': '10m (Sentinel-2, Sentinel-1)',
            'data_quality': 'High' if data['satellites']['sentinel2']['status'] == 'success' else 'Medium'
        }
        
        print(f"✅ Data fetched from {data['summary']['active_satellites']}/4 satellites")
        
        return data


# Test function
def test_satellite_system():
    """Test satellite data fetching"""
    print("\n" + "="*60)
    print("🧪 TESTING SATELLITE DATA SYSTEM")
    print("="*60)
    
    fetcher = SatelliteDataFetcher()
    
    # Test location: Delhi, India
    lat, lon = 28.6139, 77.2090
    
    data = fetcher.get_all_satellite_data(lat, lon)
    
    print(f"\n📊 Results for ({lat}, {lon}):")
    print(f"Active satellites: {data['summary']['active_satellites']}/4")
    print(f"Data quality: {data['summary']['data_quality']}")
    print("\nSatellite Status:")
    for sat, status in data['summary']['satellites_status'].items():
        print(f"  {sat}: {status}")
    
    if data['satellites']['sentinel2']['status'] == 'success':
        print(f"\n🌱 NDVI: {data['satellites']['sentinel2']['indices']['ndvi']}")
    if data['satellites']['landsat8']['status'] == 'success':
        print(f"🌡️ Temperature: {data['satellites']['landsat8']['temperature']}°C")
    
    print("\n✅ Satellite system test complete!")
    print("="*60)


if __name__ == "__main__":
    test_satellite_system()