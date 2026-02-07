import { Link } from 'react-router-dom';
import Galaxy from './Galaxy';
import { ArrowRight, Satellite, Globe, Zap } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <Galaxy
                    mouseRepulsion
                    mouseInteraction
                    density={1}
                    glowIntensity={0.3}
                    saturation={0}
                    hueShift={140}
                    twinkleIntensity={0.3}
                    rotationSpeed={0.1}
                    repulsionStrength={2}
                    autoCenterRepulsion={0}
                    starSpeed={0.5}
                    speed={1}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-5xl mx-auto">

                <div className="mb-6 animate-fade-in-down">
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-blue-300 text-xs font-medium uppercase tracking-wider">
                        <Satellite className="w-3 h-3 mr-2" />
                        Next Gen Satellite Intelligence
                    </div>
                </div>

                <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
                    OmniSight AI
                </h1>

                <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-12 leading-relaxed font-light text-shadow-sm">
                    Planetary-scale observation at your fingertips.
                    <span className="block mt-2 text-slate-400 text-lg">
                        Monitor disaster risks, analyze urban heat islands, and visualize satellite metrics in real-time.
                    </span>
                </p>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <Link
                        to="/dashboard"
                        className="group relative px-8 py-4 bg-white text-slate-900 hover:bg-blue-50 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 flex items-center"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors font-medium flex items-center">
                        Documentation
                    </a>
                </div>

                {/* Feature Highlights (Bottom) */}
                <div className="absolute bottom-10 left-0 width-full grid grid-cols-1 md:grid-cols-3 gap-8 px-10 w-full text-left opacity-60">
                    <div className="flex items-center gap-3">
                        <Globe className="w-8 h-8 text-blue-400" />
                        <div>
                            <h3 className="text-white font-semibold">Global Coverage</h3>
                            <p className="text-xs text-slate-400">Multi-satellite data fusion</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-purple-400" />
                        <div>
                            <h3 className="text-white font-semibold">Real-time Analysis</h3>
                            <p className="text-xs text-slate-400">AI-powered insights</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-slate-500">System Status</p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-green-400 text-sm font-mono">OPERATIONAL</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
