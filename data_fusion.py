"""
Multi-Satellite Data Fusion Engine
Combines data from multiple satellites with validation and conflict resolution
"""

import numpy as np
from datetime import datetime
from typing import Dict, List, Any
import statistics

class DataFusionEngine:
    """
    Advanced data fusion for multi-satellite inputs
    Combines Sentinel-2, Landsat-8, Sentinel-1, MODIS, and ISRO satellites
    """
    
    def __init__(self):
        self.fusion_methods = {
            'weighted_average': self._weighted_average_fusion,
            'max_confidence': self._max_confidence_fusion,
            'consensus': self._consensus_fusion
        }
        
        # Satellite weights based on resolution and reliability
        self.satellite_weights = {
            'cartosat': 1.0,      # Highest resolution (0.25m)
            'sentinel2': 0.95,    # Excellent optical (10m)
            'irs': 0.90,          # Good optical (23.5m)
            'landsat8': 0.85,     # Good optical (30m)
            'sentinel1': 0.80,    # SAR (10m)
            'risat': 0.80,        # SAR (25m)
            'modis': 0.60,        # Coarse (1km)
            'oceansat': 0.70      # Ocean specific (360m)
        }
    
    # =========================================================================
    # MAIN FUSION METHOD
    # =========================================================================
    
    def fuse_satellite_data(self, satellite_data: Dict) -> Dict:
        """
        Main fusion function - combines data from all satellites
        
        Args:
            satellite_data: Dict with 'satellites' key containing individual sat data
            
        Returns:
            Dict with fused data, confidence scores, and cross-validation
        """
        
        if not satellite_data or 'satellites' not in satellite_data:
            return {
                'status': 'error',
                'message': 'Invalid input data'
            }
        
        satellites = satellite_data['satellites']
        
        # Initialize fusion result
        fused = {
            'timestamp': datetime.now().isoformat(),
            'location': satellite_data.get('location', {}),
            'fused_metrics': {},
            'cross_validation': {},
            'confidence_scores': {},
            'data_sources': [],
            'consensus_level': 'Unknown',
            'overall_quality': 'Unknown'
        }
        
        # Extract and validate data
        valid_satellites = self._filter_valid_satellites(satellites)
        
        if not valid_satellites:
            fused['status'] = 'no_valid_data'
            fused['message'] = 'No valid satellite data available for fusion'
            return fused
        
        fused['data_sources'] = list(valid_satellites.keys())
        
        # Fuse NDVI from optical satellites
        fused_ndvi = self._fuse_ndvi(valid_satellites)
        if fused_ndvi:
            fused['fused_metrics']['ndvi'] = fused_ndvi['value']
            fused['confidence_scores']['ndvi'] = fused_ndvi['confidence']
            fused['cross_validation']['ndvi'] = fused_ndvi['cross_val']
        
        # Fuse temperature data
        fused_temp = self._fuse_temperature(valid_satellites)
        if fused_temp:
            fused['fused_metrics']['temperature'] = fused_temp['value']
            fused['confidence_scores']['temperature'] = fused_temp['confidence']
            fused['cross_validation']['temperature'] = fused_temp['cross_val']
        
        # Fuse SAR/moisture data
        fused_moisture = self._fuse_moisture(valid_satellites)
        if fused_moisture:
            fused['fused_metrics']['soil_moisture'] = fused_moisture['value']
            fused['confidence_scores']['soil_moisture'] = fused_moisture['confidence']
            fused['cross_validation']['soil_moisture'] = fused_moisture['cross_val']
        
        # Fuse EVI (Enhanced Vegetation Index)
        fused_evi = self._fuse_evi(valid_satellites)
        if fused_evi:
            fused['fused_metrics']['evi'] = fused_evi['value']
            fused['confidence_scores']['evi'] = fused_evi['confidence']
            fused['cross_validation']['evi'] = fused_evi['cross_val']
        
        # Calculate overall metrics
        fused['overall_confidence'] = self._calculate_overall_confidence(
            fused['confidence_scores']
        )
        
        fused['consensus_level'] = self._calculate_consensus_level(
            fused['cross_validation']
        )
        
        fused['overall_quality'] = self._determine_quality(
            fused['overall_confidence'],
            len(valid_satellites)
        )
        
        fused['status'] = 'success'
        
        return fused
    
    # =========================================================================
    # VALIDATION AND FILTERING
    # =========================================================================
    
    def _filter_valid_satellites(self, satellites: Dict) -> Dict:
        """Filter out satellites with errors or no data"""
        valid = {}
        
        for sat_name, sat_data in satellites.items():
            if not sat_data:
                continue
            
            status = sat_data.get('status', '')
            
            # Accept success, fallback, or simulated data
            if status in ['success', 'fallback', 'simulated']:
                valid[sat_name] = sat_data
        
        return valid
    
    # =========================================================================
    # NDVI FUSION (Normalized Difference Vegetation Index)
    # =========================================================================
    
    def _fuse_ndvi(self, satellites: Dict) -> Dict:
        """
        Fuse NDVI from multiple optical satellites
        Sources: Sentinel-2, Landsat-8, IRS
        """
        ndvi_sources = {}
        
        # Extract NDVI from each satellite
        for sat_name, sat_data in satellites.items():
            if sat_name in ['sentinel2', 'landsat8', 'irs']:
                indices = sat_data.get('indices', {})
                ndvi = indices.get('ndvi')
                
                if ndvi is not None and -1 <= ndvi <= 1:
                    weight = self.satellite_weights.get(sat_name, 0.5)
                    ndvi_sources[sat_name] = {
                        'value': ndvi,
                        'weight': weight
                    }
        
        if not ndvi_sources:
            return None
        
        # Weighted average fusion
        total_weight = sum(s['weight'] for s in ndvi_sources.values())
        fused_ndvi = sum(s['value'] * s['weight'] for s in ndvi_sources.values()) / total_weight
        
        # Calculate variance (measure of agreement)
        values = [s['value'] for s in ndvi_sources.values()]
        variance = np.var(values) if len(values) > 1 else 0.0
        
        # Confidence based on number of sources and variance
        confidence = self._calculate_confidence(len(ndvi_sources), variance, max_variance=0.04)
        
        # Agreement level
        agreement = 'High' if variance < 0.02 else 'Medium' if variance < 0.05 else 'Low'
        
        return {
            'value': float(fused_ndvi),
            'confidence': float(confidence),
            'cross_val': {
                'sources': {name: float(data['value']) for name, data in ndvi_sources.items()},
                'fused': float(fused_ndvi),
                'variance': float(variance),
                'agreement': agreement,
                'num_sources': len(ndvi_sources)
            }
        }
    
    # =========================================================================
    # TEMPERATURE FUSION
    # =========================================================================
    
    def _fuse_temperature(self, satellites: Dict) -> Dict:
        """
        Fuse temperature from multiple sources
        Sources: Landsat-8, MODIS, IRS (if available)
        """
        temp_sources = {}
        
        for sat_name, sat_data in satellites.items():
            temp = None
            
            # Extract temperature based on satellite
            if sat_name == 'landsat8':
                temp = sat_data.get('temperature')
            elif sat_name == 'modis':
                temp_data = sat_data.get('temperature', {})
                if isinstance(temp_data, dict):
                    temp = temp_data.get('land_surface', temp_data.get('mean'))
                else:
                    temp = temp_data
            elif sat_name == 'irs':
                # IRS might have thermal data
                temp = sat_data.get('temperature')
            
            if temp is not None and 0 <= temp <= 60:  # Reasonable range
                weight = self.satellite_weights.get(sat_name, 0.5)
                temp_sources[sat_name] = {
                    'value': temp,
                    'weight': weight
                }
        
        if not temp_sources:
            return None
        
        # Weighted average
        total_weight = sum(s['weight'] for s in temp_sources.values())
        fused_temp = sum(s['value'] * s['weight'] for s in temp_sources.values()) / total_weight
        
        # Variance
        values = [s['value'] for s in temp_sources.values()]
        variance = np.var(values) if len(values) > 1 else 0.0
        
        # Confidence (temp variance threshold: 2°C)
        confidence = self._calculate_confidence(len(temp_sources), variance, max_variance=4.0)
        
        agreement = 'High' if variance < 1.0 else 'Medium' if variance < 3.0 else 'Low'
        
        return {
            'value': float(fused_temp),
            'confidence': float(confidence),
            'cross_val': {
                'sources': {name: float(data['value']) for name, data in temp_sources.items()},
                'fused': float(fused_temp),
                'variance': float(variance),
                'agreement': agreement,
                'num_sources': len(temp_sources)
            }
        }
    
    # =========================================================================
    # SOIL MOISTURE FUSION (from SAR data)
    # =========================================================================
    
    def _fuse_moisture(self, satellites: Dict) -> Dict:
        """
        Fuse soil moisture from SAR satellites
        Sources: Sentinel-1, RISAT
        """
        moisture_sources = {}
        
        for sat_name, sat_data in satellites.items():
            if sat_name in ['sentinel1', 'risat']:
                moisture = sat_data.get('soil_moisture_estimate')
                
                if moisture is not None and 0 <= moisture <= 100:
                    weight = self.satellite_weights.get(sat_name, 0.5)
                    moisture_sources[sat_name] = {
                        'value': moisture,
                        'weight': weight
                    }
        
        if not moisture_sources:
            return None
        
        # Weighted average
        total_weight = sum(s['weight'] for s in moisture_sources.values())
        fused_moisture = sum(s['value'] * s['weight'] for s in moisture_sources.values()) / total_weight
        
        # Variance
        values = [s['value'] for s in moisture_sources.values()]
        variance = np.var(values) if len(values) > 1 else 0.0
        
        # Confidence
        confidence = self._calculate_confidence(len(moisture_sources), variance, max_variance=100.0)
        
        agreement = 'High' if variance < 25 else 'Medium' if variance < 50 else 'Low'
        
        return {
            'value': float(fused_moisture),
            'confidence': float(confidence),
            'cross_val': {
                'sources': {name: float(data['value']) for name, data in moisture_sources.items()},
                'fused': float(fused_moisture),
                'variance': float(variance),
                'agreement': agreement,
                'num_sources': len(moisture_sources)
            }
        }
    
    # =========================================================================
    # EVI FUSION (Enhanced Vegetation Index)
    # =========================================================================
    
    def _fuse_evi(self, satellites: Dict) -> Dict:
        """Fuse EVI from optical satellites"""
        evi_sources = {}
        
        for sat_name, sat_data in satellites.items():
            if sat_name in ['sentinel2', 'landsat8', 'irs']:
                indices = sat_data.get('indices', {})
                evi = indices.get('evi')
                
                if evi is not None and -1 <= evi <= 1:
                    weight = self.satellite_weights.get(sat_name, 0.5)
                    evi_sources[sat_name] = {
                        'value': evi,
                        'weight': weight
                    }
        
        if not evi_sources:
            return None
        
        # Weighted average
        total_weight = sum(s['weight'] for s in evi_sources.values())
        fused_evi = sum(s['value'] * s['weight'] for s in evi_sources.values()) / total_weight
        
        values = [s['value'] for s in evi_sources.values()]
        variance = np.var(values) if len(values) > 1 else 0.0
        
        confidence = self._calculate_confidence(len(evi_sources), variance, max_variance=0.04)
        
        agreement = 'High' if variance < 0.02 else 'Medium' if variance < 0.05 else 'Low'
        
        return {
            'value': float(fused_evi),
            'confidence': float(confidence),
            'cross_val': {
                'sources': {name: float(data['value']) for name, data in evi_sources.items()},
                'fused': float(fused_evi),
                'variance': float(variance),
                'agreement': agreement,
                'num_sources': len(evi_sources)
            }
        }
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    
    def _calculate_confidence(self, num_sources: int, variance: float, max_variance: float) -> float:
        """
        Calculate confidence score
        
        Args:
            num_sources: Number of data sources
            variance: Variance between sources
            max_variance: Maximum expected variance
            
        Returns:
            Confidence score (0.0 to 1.0)
        """
        # Base confidence from number of sources
        source_confidence = min(num_sources / 4.0, 1.0)
        
        # Variance penalty
        variance_confidence = max(0.0, 1.0 - (variance / max_variance))
        
        # Combined confidence
        confidence = (source_confidence * 0.6 + variance_confidence * 0.4)
        
        return min(max(confidence, 0.0), 1.0)
    
    def _calculate_overall_confidence(self, confidence_scores: Dict) -> float:
        """Calculate overall confidence from individual metric confidences"""
        if not confidence_scores:
            return 0.0
        
        scores = list(confidence_scores.values())
        return statistics.mean(scores)
    
    def _calculate_consensus_level(self, cross_validation: Dict) -> str:
        """Determine consensus level from cross-validation data"""
        if not cross_validation:
            return 'Unknown'
        
        agreements = [cv.get('agreement', 'Low') for cv in cross_validation.values()]
        
        high_count = agreements.count('High')
        medium_count = agreements.count('Medium')
        
        if high_count >= len(agreements) * 0.7:
            return 'High'
        elif high_count + medium_count >= len(agreements) * 0.7:
            return 'Medium'
        else:
            return 'Low'
    
    def _determine_quality(self, confidence: float, num_sources: int) -> str:
        """Determine overall data quality"""
        if confidence >= 0.8 and num_sources >= 4:
            return 'Excellent'
        elif confidence >= 0.7 and num_sources >= 3:
            return 'Good'
        elif confidence >= 0.5 and num_sources >= 2:
            return 'Fair'
        else:
            return 'Limited'
    
    # =========================================================================
    # FUSION ALGORITHM VARIANTS
    # =========================================================================
    
    def _weighted_average_fusion(self, values: List[float], weights: List[float]) -> float:
        """Weighted average fusion"""
        total_weight = sum(weights)
        return sum(v * w for v, w in zip(values, weights)) / total_weight
    
    def _max_confidence_fusion(self, sources: Dict) -> Any:
        """Select value from most confident source"""
        if not sources:
            return None
        
        max_source = max(sources.items(), key=lambda x: x[1]['weight'])
        return max_source[1]['value']
    
    def _consensus_fusion(self, values: List[float]) -> float:
        """Median-based consensus fusion"""
        return statistics.median(values) if values else 0.0
    
    # =========================================================================
    # ADDITIONAL FUSION METHODS (for testing compatibility)
    # =========================================================================
    
    def fuse_all(self, satellite_data: Dict) -> Dict:
        """
        Alias for fuse_satellite_data (for test compatibility)
        """
        return self.fuse_satellite_data(satellite_data)
    
    def pixel_level_fusion(self, images: List) -> Any:
        """
        Pixel-level fusion for image data
        Note: Simplified version for testing
        """
        if not images:
            return None
        
        # Simple averaging for now
        try:
            fused = np.mean(images, axis=0)
            return {
                'success': True,
                'fused_image': fused,
                'method': 'pixel_average',
                'num_sources': len(images)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def feature_level_fusion(self, features: Dict) -> Dict:
        """
        Feature-level fusion for extracted features
        Note: Simplified version for testing
        """
        if not features:
            return {}
        
        fused_features = {}
        
        # Average numerical features
        for feature_name in features.get(list(features.keys())[0], {}).keys():
            values = []
            for source_features in features.values():
                if feature_name in source_features:
                    val = source_features[feature_name]
                    if isinstance(val, (int, float)):
                        values.append(val)
            
            if values:
                fused_features[feature_name] = np.mean(values)
        
        return {
            'success': True,
            'fused_features': fused_features,
            'method': 'feature_average',
            'num_sources': len(features)
        }


# =============================================================================
# TESTING
# =============================================================================

def test_fusion_engine():
    """Test the data fusion engine"""
    print("=" * 60)
    print("TESTING DATA FUSION ENGINE")
    print("=" * 60)
    
    engine = DataFusionEngine()
    
    # Mock satellite data
    test_data = {
        'location': {'lat': 28.6139, 'lon': 77.2090},
        'satellites': {
            'sentinel2': {
                'status': 'success',
                'indices': {'ndvi': 0.65, 'evi': 0.52}
            },
            'landsat8': {
                'status': 'success',
                'temperature': 28.5,
                'indices': {'ndvi': 0.63, 'evi': 0.50}
            },
            'sentinel1': {
                'status': 'success',
                'soil_moisture_estimate': 45.0
            },
            'irs': {
                'status': 'simulated',
                'indices': {'ndvi': 0.64, 'evi': 0.51}
            }
        }
    }
    
    # Run fusion
    result = engine.fuse_satellite_data(test_data)
    
    print("\n✅ Fusion Results:")
    print(f"Status: {result.get('status')}")
    print(f"Data Sources: {result.get('data_sources')}")
    print(f"\nFused Metrics:")
    for metric, value in result.get('fused_metrics', {}).items():
        print(f"  {metric}: {value:.3f}")
    
    print(f"\nConfidence Scores:")
    for metric, conf in result.get('confidence_scores', {}).items():
        print(f"  {metric}: {conf:.2%}")
    
    print(f"\nOverall Confidence: {result.get('overall_confidence', 0):.2%}")
    print(f"Consensus Level: {result.get('consensus_level')}")
    print(f"Overall Quality: {result.get('overall_quality')}")
    
    print("\n" + "=" * 60)
    print("Fusion engine test completed! ✅")
    print("=" * 60)


if __name__ == "__main__":
    test_fusion_engine()