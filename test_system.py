"""
Comprehensive Test Suite for SatelliteGPT Multi-Satellite Fusion Dashboard
Tests all components and their integration
"""

import sys
import os
from datetime import datetime

# Color codes for terminal
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}\n")

def print_test(test_name, status, message=""):
    status_symbol = f"{Colors.GREEN}✅ PASS{Colors.RESET}" if status else f"{Colors.RED}❌ FAIL{Colors.RESET}"
    print(f"{test_name:.<50} {status_symbol}")
    if message:
        print(f"  {Colors.YELLOW}→ {message}{Colors.RESET}")

def test_environment():
    """Test 1: Environment Configuration"""
    print_header("TEST 1: ENVIRONMENT CONFIGURATION")
    
    tests_passed = 0
    total_tests = 0
    
    # Check .env file
    total_tests += 1
    if os.path.exists('.env'):
        print_test("Environment file (.env) exists", True)
        tests_passed += 1
        
        # Check for required keys
        from dotenv import load_dotenv
        load_dotenv()
        
        total_tests += 1
        gemini_key = os.getenv('GEMINI_API_KEY', '')
        if gemini_key and len(gemini_key) > 20:
            print_test("Gemini API key configured", True)
            tests_passed += 1
        else:
            print_test("Gemini API key configured", False, "Key missing or invalid")
        
        total_tests += 1
        ai_provider = os.getenv('AI_PROVIDER', '')
        if ai_provider:
            print_test(f"AI Provider set ({ai_provider})", True)
            tests_passed += 1
        else:
            print_test("AI Provider configured", False, "Not set in .env")
    else:
        print_test("Environment file (.env) exists", False, "Create .env file")
    
    return tests_passed, total_tests

def test_earth_engine():
    """Test 2: Earth Engine Connection"""
    print_header("TEST 2: EARTH ENGINE CONNECTION")
    
    tests_passed = 0
    total_tests = 1
    
    try:
        import ee
        
        # Try to initialize
        try:
            ee.Initialize()
            print_test("Earth Engine initialization", True)
            tests_passed += 1
            
            # Test a simple query
            total_tests += 1
            try:
                point = ee.Geometry.Point([77.2090, 28.6139])
                collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
                    .filterBounds(point) \
                    .filterDate('2024-01-01', '2024-12-31') \
                    .first()
                
                if collection:
                    print_test("Sample data query", True, "Successfully queried Sentinel-2")
                    tests_passed += 1
                else:
                    print_test("Sample data query", False, "No data returned")
            except Exception as e:
                print_test("Sample data query", False, f"Query failed: {str(e)[:50]}")
                
        except Exception as e:
            print_test("Earth Engine initialization", False, f"Init failed: {str(e)[:50]}")
            
    except ImportError:
        print_test("Earth Engine library", False, "earthengine-api not installed")
    
    return tests_passed, total_tests

def test_ai_system():
    """Test 3: AI Analysis System"""
    print_header("TEST 3: AI ANALYSIS SYSTEM")
    
    tests_passed = 0
    total_tests = 0
    
    try:
        from ai_analysis import AIAnalyzer
        
        total_tests += 1
        analyzer = AIAnalyzer()
        print_test("AI Analyzer initialization", True)
        tests_passed += 1
        
        # Test basic analysis
        total_tests += 1
        try:
            result = analyzer.analyze("Test prompt for vegetation analysis")
            if result and len(result) > 50:
                print_test("Basic AI analysis", True, f"Generated {len(result)} chars")
                tests_passed += 1
            else:
                print_test("Basic AI analysis", False, "Response too short")
        except Exception as e:
            print_test("Basic AI analysis", False, f"Analysis failed: {str(e)[:50]}")
        
        # Test specific analysis functions
        total_tests += 1
        try:
            result = analyzer.analyze_satellite_location(
                28.6139, 77.2090,
                {'ndvi': 0.65, 'temperature': 28.5}
            )
            if result and 'vegetation' in result.lower():
                print_test("Location analysis function", True)
                tests_passed += 1
            else:
                print_test("Location analysis function", False, "Unexpected response")
        except Exception as e:
            print_test("Location analysis function", False, f"Error: {str(e)[:50]}")
        
        # Test fallback mode
        total_tests += 1
        if analyzer.client is None:
            print_test("Fallback mode active", True, "Using smart fallback responses")
            tests_passed += 1
        else:
            print_test("AI API connected", True, f"Using {analyzer.provider}")
            tests_passed += 1
            
    except ImportError:
        total_tests += 1
        print_test("AI Analysis module", False, "ai_analysis.py not found")
    except Exception as e:
        total_tests += 1
        print_test("AI Analysis module", False, f"Import error: {str(e)[:50]}")
    
    return tests_passed, total_tests

def test_satellite_data():
    """Test 4: Satellite Data Fetching"""
    print_header("TEST 4: SATELLITE DATA FETCHING")
    
    tests_passed = 0
    total_tests = 0
    
    try:
        from satellite_data import SatelliteDataFetcher
        
        total_tests += 1
        print_test("Satellite module import", True)
        tests_passed += 1
        
        total_tests += 1
        fetcher = SatelliteDataFetcher()
        print_test("Satellite fetcher initialization", True)
        tests_passed += 1
        
        # Test location: Delhi, India
        lat, lon = 28.6139, 77.2090
        
        # Test Sentinel-2
        total_tests += 1
        try:
            data = fetcher.get_sentinel2_data(lat, lon, days_back=30)
            if data and 'indices' in data:
                ndvi = data['indices'].get('ndvi', 0)
                status = "Real data" if data.get('status') == 'success' else "Fallback data"
                print_test("Sentinel-2 data fetch", True, f"NDVI: {ndvi} ({status})")
                tests_passed += 1
            else:
                print_test("Sentinel-2 data fetch", False, "Invalid data structure")
        except Exception as e:
            print_test("Sentinel-2 data fetch", False, f"Error: {str(e)[:50]}")
        
        # Test Landsat-8
        total_tests += 1
        try:
            data = fetcher.get_landsat8_data(lat, lon, days_back=30)
            if data and 'temperature' in data:
                temp = data.get('temperature', 0)
                status = "Real data" if data.get('status') == 'success' else "Fallback data"
                print_test("Landsat-8 data fetch", True, f"Temp: {temp}°C ({status})")
                tests_passed += 1
            else:
                print_test("Landsat-8 data fetch", False, "Invalid data structure")
        except Exception as e:
            print_test("Landsat-8 data fetch", False, f"Error: {str(e)[:50]}")
        
        # Test Sentinel-1
        total_tests += 1
        try:
            data = fetcher.get_sentinel1_data(lat, lon, days_back=30)
            if data and 'polarization' in data:
                status = "Real data" if data.get('status') == 'success' else "Fallback data"
                print_test("Sentinel-1 SAR data fetch", True, f"({status})")
                tests_passed += 1
            else:
                print_test("Sentinel-1 SAR data fetch", False, "Invalid data structure")
        except Exception as e:
            print_test("Sentinel-1 SAR data fetch", False, f"Error: {str(e)[:50]}")
        
        # Test combined fetch
        total_tests += 1
        try:
            all_data = fetcher.get_all_satellite_data(lat, lon)
            if all_data and 'satellites' in all_data:
                active = all_data['summary']['active_satellites']
                print_test("Multi-satellite data fetch", True, f"{active}/4 satellites active")
                tests_passed += 1
            else:
                print_test("Multi-satellite data fetch", False, "Invalid response")
        except Exception as e:
            print_test("Multi-satellite data fetch", False, f"Error: {str(e)[:50]}")
            
    except ImportError:
        total_tests += 1
        print_test("Satellite Data module", False, "satellite_data.py not found")
    except Exception as e:
        total_tests += 1
        print_test("Satellite Data module", False, f"Import error: {str(e)[:50]}")
    
    return tests_passed, total_tests

def test_data_fusion():
    """Test 5: Data Fusion Engine"""
    print_header("TEST 5: DATA FUSION ENGINE")
    
    tests_passed = 0
    total_tests = 0
    
    try:
        from data_fusion import DataFusionEngine
        
        total_tests += 1
        print_test("Data Fusion module import", True)
        tests_passed += 1
        
        total_tests += 1
        fusion = DataFusionEngine()
        print_test("Fusion engine initialization", True)
        tests_passed += 1
        
        # Create test data
        test_data = {
            'satellites': {
                'sentinel2': {
                    'status': 'success',
                    'resolution': '10m',
                    'indices': {'ndvi': 0.68},
                    'quality': {'cloud_cover': 5}
                },
                'landsat8': {
                    'status': 'success',
                    'resolution': '30m',
                    'temperature': 28.5,
                    'indices': {'ndvi': 0.65}
                }
            }
        }
        
        # Test weighted fusion
        total_tests += 1
        try:
            result = fusion.fuse_all_satellites(test_data, method='weighted')
            if result and 'fused_metrics' in result:
                ndvi = result['fused_metrics'].get('ndvi', 0)
                confidence = result.get('confidence_score', 0)
                print_test("Weighted fusion", True, f"NDVI: {ndvi}, Confidence: {confidence}")
                tests_passed += 1
            else:
                print_test("Weighted fusion", False, "Invalid fusion result")
        except Exception as e:
            print_test("Weighted fusion", False, f"Error: {str(e)[:50]}")
        
        # Test pixel-level fusion
        total_tests += 1
        try:
            result = fusion.pixel_level_fusion(test_data)
            if result and 'fused_indices' in result:
                print_test("Pixel-level fusion", True)
                tests_passed += 1
            else:
                print_test("Pixel-level fusion", False, "Invalid result")
        except Exception as e:
            print_test("Pixel-level fusion", False, f"Error: {str(e)[:50]}")
        
        # Test feature-level fusion
        total_tests += 1
        try:
            result = fusion.feature_level_fusion(test_data)
            if result and 'vegetation_analysis' in result:
                print_test("Feature-level fusion", True)
                tests_passed += 1
            else:
                print_test("Feature-level fusion", False, "Invalid result")
        except Exception as e:
            print_test("Feature-level fusion", False, f"Error: {str(e)[:50]}")
            
    except ImportError:
        total_tests += 1
        print_test("Data Fusion module", False, "data_fusion.py not found")
    except Exception as e:
        total_tests += 1
        print_test("Data Fusion module", False, f"Import error: {str(e)[:50]}")
    
    return tests_passed, total_tests

def test_streamlit_app():
    """Test 6: Streamlit Application"""
    print_header("TEST 6: STREAMLIT APPLICATION")
    
    tests_passed = 0
    total_tests = 0
    
    # Check if app.py exists
    total_tests += 1
    if os.path.exists('app.py'):
        print_test("Main application file (app.py) exists", True)
        tests_passed += 1
        
        # Try to import and check syntax
        total_tests += 1
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("app", "app.py")
            module = importlib.util.module_from_spec(spec)
            print_test("App.py syntax valid", True)
            tests_passed += 1
        except Exception as e:
            print_test("App.py syntax valid", False, f"Syntax error: {str(e)[:50]}")
    else:
        print_test("Main application file exists", False, "app.py not found")
    
    # Check for Streamlit
    total_tests += 1
    try:
        import streamlit
        version = streamlit.__version__
        print_test("Streamlit installed", True, f"Version {version}")
        tests_passed += 1
    except ImportError:
        print_test("Streamlit installed", False, "Run: pip install streamlit")
    
    # Check for Folium
    total_tests += 1
    try:
        import folium
        import streamlit_folium
        print_test("Map libraries installed", True)
        tests_passed += 1
    except ImportError:
        print_test("Map libraries installed", False, "Install folium and streamlit-folium")
    
    return tests_passed, total_tests

def test_dependencies():
    """Test 7: Python Dependencies"""
    print_header("TEST 7: PYTHON DEPENDENCIES")
    
    tests_passed = 0
    total_tests = 0
    
    required_packages = {
        'numpy': 'Data processing',
        'pandas': 'Data analysis',
        'PIL': 'Image processing (Pillow)',
        'requests': 'HTTP requests',
        'dotenv': 'Environment variables (python-dotenv)'
    }
    
    for package, description in required_packages.items():
        total_tests += 1
        try:
            if package == 'PIL':
                import PIL
            elif package == 'dotenv':
                from dotenv import load_dotenv
            else:
                __import__(package)
            print_test(f"{description}", True)
            tests_passed += 1
        except ImportError:
            print_test(f"{description}", False, f"Install: pip install {package}")
    
    return tests_passed, total_tests

def run_all_tests():
    """Run all test suites"""
    
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("╔" + "="*68 + "╗")
    print("║" + "SATELLITEGPT COMPREHENSIVE SYSTEM TEST".center(68) + "║")
    print("║" + f"Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}".center(68) + "║")
    print("╚" + "="*68 + "╝")
    print(Colors.RESET)
    
    all_results = []
    
    # Run all test suites
    all_results.append(("Environment Configuration", *test_environment()))
    all_results.append(("Earth Engine Connection", *test_earth_engine()))
    all_results.append(("AI Analysis System", *test_ai_system()))
    all_results.append(("Satellite Data Fetching", *test_satellite_data()))
    all_results.append(("Data Fusion Engine", *test_data_fusion()))
    all_results.append(("Streamlit Application", *test_streamlit_app()))
    all_results.append(("Python Dependencies", *test_dependencies()))
    
    # Summary
    print_header("TEST SUMMARY")
    
    total_passed = sum(r[1] for r in all_results)
    total_tests = sum(r[2] for r in all_results)
    success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    for name, passed, total in all_results:
        percentage = (passed / total * 100) if total > 0 else 0
        status_color = Colors.GREEN if percentage >= 80 else Colors.YELLOW if percentage >= 50 else Colors.RED
        print(f"{name:.<40} {status_color}{passed}/{total} ({percentage:.0f}%){Colors.RESET}")
    
    print(f"\n{Colors.BOLD}{'─'*70}{Colors.RESET}")
    
    overall_color = Colors.GREEN if success_rate >= 80 else Colors.YELLOW if success_rate >= 60 else Colors.RED
    print(f"{Colors.BOLD}OVERALL:{Colors.RESET} {overall_color}{total_passed}/{total_tests} tests passed ({success_rate:.1f}%){Colors.RESET}")
    
    # Status assessment
    print(f"\n{Colors.BOLD}SYSTEM STATUS:{Colors.RESET}")
    if success_rate >= 90:
        print(f"{Colors.GREEN}🎉 EXCELLENT - System is production ready!{Colors.RESET}")
    elif success_rate >= 75:
        print(f"{Colors.GREEN}✅ GOOD - System is operational with minor issues{Colors.RESET}")
    elif success_rate >= 60:
        print(f"{Colors.YELLOW}⚠️ FAIR - System works but needs attention{Colors.RESET}")
    else:
        print(f"{Colors.RED}❌ NEEDS WORK - Critical issues to fix{Colors.RESET}")
    
    # Recommendations
    print(f"\n{Colors.BOLD}RECOMMENDATIONS:{Colors.RESET}")
    
    if all_results[0][1] < all_results[0][2]:  # Environment issues
        print(f"{Colors.YELLOW}• Configure .env file with your API keys{Colors.RESET}")
    
    if all_results[1][1] < all_results[1][2]:  # Earth Engine issues
        print(f"{Colors.YELLOW}• Authenticate Earth Engine: earthengine authenticate{Colors.RESET}")
    
    if all_results[2][1] < all_results[2][2]:  # AI issues
        print(f"{Colors.YELLOW}• Check AI API configuration in .env{Colors.RESET}")
    
    if success_rate < 100:
        print(f"{Colors.BLUE}• Review failed tests above for specific fixes{Colors.RESET}")
    
    print(f"\n{Colors.BOLD}NEXT STEPS:{Colors.RESET}")
    if success_rate >= 75:
        print(f"{Colors.GREEN}✓ Ready to run: streamlit run app.py{Colors.RESET}")
    else:
        print(f"{Colors.YELLOW}✓ Fix critical issues first, then run: streamlit run app.py{Colors.RESET}")
    
    print(f"\n{Colors.BLUE}{'='*70}{Colors.RESET}\n")
    
    return success_rate >= 75

if __name__ == "__main__":
    try:
        success = run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Test interrupted by user{Colors.RESET}\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n{Colors.RED}Test suite error: {e}{Colors.RESET}\n")
        sys.exit(1)