import { Map, Image, Wrench, Link2, Home, Satellite, Activity } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Satellite Explorer', href: '/map', icon: Map },
        { name: 'Image Analyzer', href: '/image', icon: Image },
        { name: 'Smart Solutions', href: '/solutions', icon: Wrench },
        { name: 'Data Fusion', href: '/fusion', icon: Link2 },
    ];

    return (
        <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-[#1e293b]/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <Satellite className="w-8 h-8 text-blue-500" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">

                        </h1>
                    </div>
                    <div className="text-4xl font-bold text-blue-500 leading-none -mt-2 mb-2">OmniSight AI</div>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">Satellite Intelligence</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-4 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-500'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                                    }`}
                            >
                                <item.icon
                                    className={`w-5 h-5 mr-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                                        }`}
                                />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Activity className="w-8 h-8 text-blue-400" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-200">System Online</p>
                                <p className="text-xs text-slate-500">v2.4.0 Stable</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[#0f172a] p-10 relative">
                {/* Background glow effect */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
