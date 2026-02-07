import { Activity, MapPin, Layers, CloudRain } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, color, glow }) => (
    <div className={`relative overflow-hidden bg-[#1e293b]/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl ${glow ? 'ring-1 ring-blue-500/50' : ''}`}>
        {glow && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
        )}
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                        color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                            color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-green-500/10 text-green-400'
                    }`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {glow && (
                <div className="w-full bg-slate-700/50 h-1 mt-4 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-3/4 rounded-full animate-pulse" />
                </div>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Satellites"
                    value="4/4"
                    icon={Activity}
                    color="green"
                    glow={true}
                />
                <MetricCard
                    title="Data Points"
                    value="1,284"
                    icon={Layers}
                    color="blue"
                />
                <MetricCard
                    title="Areas Monitored"
                    value="12"
                    icon={MapPin}
                    color="purple"
                />
                <MetricCard
                    title="Weather Alerts"
                    value="0"
                    icon={CloudRain}
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#1e293b]/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <p className="text-slate-400">System initialization complete. Select a module from the sidebar to begin analysis.</p>
                </div>

                <div className="bg-[#1e293b]/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
                    <p className="text-slate-400">No critical alerts at this time. All systems functioning normally.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
