import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Target, Activity, Zap, Plus, ChevronRight, BarChart3, Info } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BASELINE, INITIAL_INNINGS, Innings } from './types';
import { analyzeMatchData } from './services/geminiService';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---
const StatCard = ({ title, value, subValue, icon: Icon, colorClass, highlight }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#151619] border border-[#2d2e32] p-5 rounded-lg flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <div className="bg-[#2d2e32] p-2 rounded-md">
        <Icon size={18} className={colorClass} />
      </div>
      {highlight && (
        <span className="text-[10px] font-mono border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
          {highlight}
        </span>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-[#8e9299] text-xs font-mono uppercase tracking-widest">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-xs text-[#8e9299] font-mono">{subValue}</span>
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [innings, setInnings] = React.useState<Innings[]>(INITIAL_INNINGS);
  const [selectedMatch, setSelectedMatch] = React.useState<Innings | null>(INITIAL_INNINGS[0]);
  const [isInputOpen, setIsInputOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [rawData, setRawData] = React.useState('');

  const handleAnalysis = async () => {
    if (!rawData.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeMatchData(rawData);
      const newInning: Innings = {
        id: Date.now().toString(),
        matchDate: new Date().toISOString().split('T')[0],
        matchNumber: innings.length + 1,
        opposition: result.opposition || 'TBD',
        runs: result.runs || 0,
        balls: result.balls || 0,
        fours: result.fours || 0,
        sixes: result.sixes || 0,
        strikeRate: result.strikeRate || 0,
        dotBallPct: result.dotBallPct || 0,
        scoutingNote: result.scoutingNote || '',
        ballsData: [],
        phases: result.phases as any
      };
      setInnings([newInning, ...innings]);
      setSelectedMatch(newInning);
      setIsInputOpen(false);
      setRawData('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = innings.map(inn => ({
    name: `Match ${inn.matchNumber}`,
    sr: inn.strikeRate,
    runs: inn.runs
  })).reverse();

  const phaseData = selectedMatch ? [
    { name: 'PP', value: selectedMatch.phases.Powerplay.runs, fill: '#10b981' },
    { name: 'MID', value: selectedMatch.phases.Middle.runs, fill: '#3b82f6' },
    { name: 'DTH', value: selectedMatch.phases.Death.runs, fill: '#f59e0b' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#e1e3e6] font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-bottom border-[#1f2023] bg-[#0a0b0d]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-[#0a0b0d]">
              VS
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase leading-none">Vaibhav Suryavanshi</h1>
              <p className="text-[10px] text-[#8e9299] font-mono uppercase tracking-widest mt-1">Analytics Dashboard • PRO SCOUT V1.0</p>
            </div>
          </div>
          <button 
            onClick={() => setIsInputOpen(true)}
            className="bg-emerald-500 text-black text-xs font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-emerald-400 transition-colors"
          >
            <Plus size={16} /> NEW MATCH DATA
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-12 gap-6">
        {/* Top Baseline Cards */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Season Strike Rate" value={BASELINE.strikeRate} subValue="AVG" icon={Zap} colorClass="text-amber-400" highlight="vs League 145.2" />
          <StatCard title="Total IPL Runs" value={BASELINE.totalRuns} subValue="2025" icon={Target} colorClass="text-emerald-400" />
          <StatCard title="Dot Ball %" value="18.2" subValue="Elite" icon={Activity} colorClass="text-blue-400" />
          <StatCard title="Boundary %" value="28.4" subValue="Per Over" icon={TrendingUp} colorClass="text-rose-400" />
        </div>

        {/* Selected Match Analysis */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <motion.div 
            layout="position"
            className="bg-[#151619] border border-[#2d2e32] rounded-xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#2d2e32] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Match Review: vs {selectedMatch?.opposition}</h2>
                <p className="text-xs text-[#8e9299] font-mono mt-1">{selectedMatch?.matchDate}</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{selectedMatch?.runs} <span className="text-sm text-[#8e9299]">({selectedMatch?.balls})</span></div>
                  <div className="text-[10px] text-[#8e9299] font-mono uppercase">Total Performance</div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Chart 1: Phase SR */}
              <div className="space-y-4">
                <h3 className="text-[11px] text-[#8e9299] font-mono uppercase flex items-center gap-2">
                  <BarChart3 size={14} /> Phase-wise Strike Rate
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(selectedMatch?.phases || {}).map(([key, val]) => ({ name: key, sr: (val as any).sr }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2e32" vertical={false} />
                      <XAxis dataKey="name" stroke="#52545c" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#52545c" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#151619', border: '1px solid #2d2e32', fontSize: '12px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="sr" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Runs Distribution */}
              <div className="space-y-4">
                <h3 className="text-[11px] text-[#8e9299] font-mono uppercase flex items-center gap-2">
                  <Activity size={14} /> Runs by Over Phase
                </h3>
                <div className="h-48 relative">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={phaseData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {phaseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#151619', border: '1px solid #2d2e32', fontSize: '12px' }}
                      />
                    </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xl font-bold">{selectedMatch?.runs}</span>
                     <span className="text-[8px] text-[#8e9299] uppercase font-mono">Runs</span>
                   </div>
                </div>
              </div>

              {/* Scouting Note */}
              <div className="space-y-4">
                <h3 className="text-[11px] text-[#8e9299] font-mono uppercase flex items-center gap-2">
                  < Zap size={14} /> AI Analysis / Scouting Note
                </h3>
                <div className="bg-[#1f2023] p-4 rounded-lg border border-[#2d2e32]">
                  <p className="text-xs leading-relaxed text-emerald-100 italic">
                    "{selectedMatch?.scoutingNote || 'Awaiting deeper ball-by-ball analysis...'}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-[#2d2e32] flex justify-between items-center">
                    <span className="text-[9px] text-amber-400 uppercase font-bold tracking-tight">Status</span>
                    <span className={cn(
                      "text-[9px] font-mono px-2 py-0.5 rounded",
                      (selectedMatch?.strikeRate || 0) >= BASELINE.strikeRate ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                      {(selectedMatch?.strikeRate || 0) >= BASELINE.strikeRate ? "ABOVE BASELINE" : "BELOW BASELINE"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SR Trend Chart */}
          <div className="bg-[#151619] border border-[#2d2e32] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold tracking-tight uppercase">Strike Rate Trend</h3>
               <div className="flex items-center gap-2 text-[10px] text-[#8e9299] font-mono">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" /> Season Baseline: {BASELINE.strikeRate}
               </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2e32" vertical={false} />
                  <XAxis dataKey="name" stroke="#52545c" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#52545c" fontSize={10} axisLine={false} tickLine={false} domain={[100, 300]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151619', border: '1px solid #2d2e32', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sr" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary: Innings Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-[#151619] border border-[#2d2e32] rounded-xl overflow-hidden shrink-0">
            <div className="p-4 border-b border-[#2d2e32] bg-[#1f2023]/30">
              <h3 className="text-[11px] text-[#8e9299] font-mono uppercase tracking-widest">Innings Log</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {innings.map((inn) => (
                <button
                  key={inn.id}
                  onClick={() => setSelectedMatch(inn)}
                  className={cn(
                    "w-full p-4 flex items-center justify-between hover:bg-[#1f2023] transition-colors border-b border-[#2d2e32] group",
                    selectedMatch?.id === inn.id ? "bg-[#1f2023]" : "bg-transparent"
                  )}
                >
                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400">vs {inn.opposition}</div>
                    <div className="text-[10px] text-[#8e9299] font-mono mt-0.5">{inn.matchDate}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{inn.runs} <span className="font-normal text-[#8e9299]">({inn.balls})</span></div>
                      <div className="text-[9px] text-[#8e9299] font-mono uppercase">SR {inn.strikeRate.toFixed(1)}</div>
                    </div>
                    <ChevronRight size={14} className={cn(selectedMatch?.id === inn.id ? "text-emerald-500" : "text-[#4d4f55]")} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
             <div className="flex items-center gap-2 text-emerald-400 mb-2">
               <Info size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Scouting Tip</span>
             </div>
             <p className="text-[11px] text-[#8e9299] leading-relaxed">
               Vaibhav Suryavanshi targets the 75-95% region (Cow Corner to Long On). Monitor dot ball percentage transitions between the 4th and 7th overs.
             </p>
          </div>
        </div>
      </main>

      {/* Input Modal */}
      {isInputOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#000]/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#151619] border border-[#2d2e32] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-[#2d2e32] flex justify-between items-center">
              <div>
                 <h2 className="text-lg font-bold">Import Match Data</h2>
                 <p className="text-xs text-[#8e9299]">Paste ball-by-ball data or match summary CSV</p>
              </div>
              <button onClick={() => setIsInputOpen(false)} className="text-[#8e9299] hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <textarea 
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder="Match: vs MI&#10;1.1: 4 (Cover Drive)&#10;1.2: 0 (Dot)&#10;1.3: 6 (Long Off)..."
                className="w-full h-64 bg-[#0a0b0d] border border-[#2d2e32] rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsInputOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#8e9299] hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleAnalysis}
                  disabled={loading}
                  className="bg-emerald-500 text-black px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {loading ? 'PROCESSING...' : 'ANALYZE & ADD'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
