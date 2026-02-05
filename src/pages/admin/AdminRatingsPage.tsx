import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RefreshCw, Info } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PositionWeights {
  [key: string]: {
    goals: number;
    assists: number;
    keyPasses: number;
    tackles: number;
    interceptions: number;
    saves: number;
    cleanSheets: number;
    aerialDuels: number;
    passAccuracy: number;
  };
}

const defaultWeights: PositionWeights = {
  forward: {
    goals: 1.0,
    assists: 0.7,
    keyPasses: 0.5,
    tackles: 0.1,
    interceptions: 0.1,
    saves: 0,
    cleanSheets: 0,
    aerialDuels: 0.3,
    passAccuracy: 0.3,
  },
  midfielder: {
    goals: 0.8,
    assists: 0.8,
    keyPasses: 0.7,
    tackles: 0.4,
    interceptions: 0.4,
    saves: 0,
    cleanSheets: 0.1,
    aerialDuels: 0.2,
    passAccuracy: 0.6,
  },
  defender: {
    goals: 0.5,
    assists: 0.4,
    keyPasses: 0.3,
    tackles: 0.9,
    interceptions: 0.8,
    saves: 0,
    cleanSheets: 0.7,
    aerialDuels: 0.6,
    passAccuracy: 0.5,
  },
  goalkeeper: {
    goals: 0.3,
    assists: 0.2,
    keyPasses: 0.1,
    tackles: 0.1,
    interceptions: 0.2,
    saves: 1.0,
    cleanSheets: 0.9,
    aerialDuels: 0.4,
    passAccuracy: 0.4,
  },
};

const statLabels: { [key: string]: string } = {
  goals: 'Goals',
  assists: 'Assists',
  keyPasses: 'Key Passes',
  tackles: 'Tackles Won',
  interceptions: 'Interceptions',
  saves: 'Saves',
  cleanSheets: 'Clean Sheets',
  aerialDuels: 'Aerial Duels',
  passAccuracy: 'Pass Accuracy',
};

export default function AdminRatingsPage() {
  const [selectedPosition, setSelectedPosition] = useState<string>('forward');
  const [weights, setWeights] = useState<PositionWeights>(defaultWeights);
  const [hasChanges, setHasChanges] = useState(false);

  const updateWeight = (stat: string, value: number) => {
    setWeights(prev => ({
      ...prev,
      [selectedPosition]: {
        ...prev[selectedPosition],
        [stat]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    setHasChanges(false);
    alert('Configuration saved successfully!');
  };

  const handleReset = () => {
    setWeights(defaultWeights);
    setHasChanges(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-display font-extrabold text-3xl text-foreground mb-1">
              Rating Engine Configuration
            </h1>
            <p className="text-[#A8A29E]">
              Adjust position-aware weighting schemes for player ratings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-[#A8A29E]/50 text-[#A8A29E] hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-[#FF4444] hover:bg-[#FF5555] text-white font-label font-semibold px-6 h-11 rounded-xl disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-[#00D9FF]" />
          </div>
          <div>
            <h3 className="font-body font-semibold text-foreground mb-1">How Weighting Works</h3>
            <p className="text-sm text-[#A8A29E] leading-relaxed">
              Each statistic contributes to the final player rating based on its weight (0.0 to 1.0). 
              Higher weights mean that statistic has more impact on the final rating. Weights are position-specific 
              to ensure fair comparisons between players in similar roles.
            </p>
          </div>
        </motion.div>

        {/* Position Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-2"
        >
          {Object.keys(defaultWeights).map((position) => (
            <button
              key={position}
              onClick={() => setSelectedPosition(position)}
              className={cn(
                "px-6 py-3 rounded-xl font-label text-sm font-semibold uppercase tracking-wider transition-all duration-200 capitalize",
                selectedPosition === position
                  ? position === 'forward' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    position === 'midfielder' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                    position === 'defender' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : "bg-white/5 text-[#A8A29E] hover:bg-white/10 border border-transparent"
              )}
            >
              {position}
            </button>
          ))}
        </motion.div>

        {/* Weights Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-display font-bold text-xl text-foreground mb-6 capitalize">
            {selectedPosition} Weights
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(weights[selectedPosition]).map(([stat, value]) => (
              <div key={stat} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    {statLabels[stat]}
                  </label>
                  <span className="font-mono-data text-sm text-[#00D9FF]">
                    {value.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateWeight(stat, parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00D9FF] [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[#A8A29E]">
                  <span>Low Impact</span>
                  <span>High Impact</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-display font-bold text-xl text-foreground mb-6">
            Weight Summary
          </h3>

          <div className="space-y-4">
            {Object.entries(weights[selectedPosition])
              .sort(([, a], [, b]) => b - a)
              .map(([stat, value]) => (
                <div key={stat} className="flex items-center gap-4">
                  <span className="text-sm text-[#A8A29E] w-32">{statLabels[stat]}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF4444] to-[#00D9FF] rounded-full transition-all duration-300"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <span className="font-mono-data text-sm text-foreground w-12 text-right">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
