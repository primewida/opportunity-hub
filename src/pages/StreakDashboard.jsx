import { useState, useEffect } from 'react';
import { streak } from '../services/api';
import { Card, Button, ProgressBar } from '../components/ui';
import { Flame, Target, Clock, Calendar, TrendingUp, Award } from 'lucide-react';
import './StreakDashboard.css';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

// Generate fallback heatmap data (26 weeks)
const generateHeatmap = () => {
  const data = [];
  for (let w = 0; w < 26; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(0);
    }
    data.push(week);
  }
  return data;
};

const processLogs = (logs) => {
  if (!logs || !logs.length) return generateHeatmap();
  if (Array.isArray(logs[0])) return logs; // Already 2D
  
  // Try to parse if flat array
  const data = [];
  let i = 0;
  for (let w = 0; w < 26; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const level = logs[i] !== undefined ? (typeof logs[i] === 'object' ? logs[i].level || 0 : logs[i]) : 0;
      week.push(level > 3 ? 3 : level);
      i++;
    }
    data.push(week);
  }
  return data;
};

export default function StreakDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goalDays, setGoalDays] = useState([0, 1, 2, 3, 4]);
  const [goalMinutes, setGoalMinutes] = useState(30);
  const [saving, setSaving] = useState(false);

  const fetchStreak = () => {
    streak.get().then(res => {
      const s = res.streak || res;
      setData(s);
      if (s.goalDaysOfWeek) {
        try { setGoalDays(JSON.parse(s.goalDaysOfWeek)); } catch(e){}
      }
      if (s.goalHoursPerDay) {
        setGoalMinutes(s.goalHoursPerDay * 60);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  const handleLogActivity = async (minutes) => {
    try {
      await streak.logActivity({ hoursSpent: minutes / 60 });
      fetchStreak();
      alert(`🔥 Logged ${minutes} minutes of study session! Streak updated.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGoal = async () => {
    setSaving(true);
    try {
      await streak.updateGoals({ goalDaysOfWeek: goalDays, goalHoursPerDay: goalMinutes / 60 });
      fetchStreak();
      alert('Daily goal updated successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const stats = data ? [
    { icon: Flame, label: 'Current Streak', value: `${data.currentStreakCount || 0} days`, color: 'var(--color-accent-amber)' },
    { icon: Award, label: 'Longest Streak', value: `${data.longestStreakCount || 0} days`, color: 'var(--color-primary)' },
    { icon: Clock, label: 'Daily Goal', value: `${goalMinutes} mins`, color: 'var(--color-accent-teal)' },
    { icon: TrendingUp, label: 'Consistency', value: 'Active', color: 'var(--color-success)' },
  ] : [];

  const toggleDay = (d) => setGoalDays(g => g.includes(d) ? g.filter(x => x !== d) : [...g, d]);
  const heatColors = ['var(--bg-secondary)', 'rgba(253,203,110,0.3)', 'rgba(253,203,110,0.6)', 'var(--color-accent-amber)'];
  const heatmapData = data ? processLogs(data.logs) : generateHeatmap();

  if (loading) return <div className="streak" style={{ padding: '2rem', textAlign: 'center' }}>Loading streak...</div>;

  return (
    <div className="streak">
      <div className="streak__hero">
        <div className="streak__flame-container">
          <Flame size={48} className="streak__flame-icon" />
          <span className="streak__flame-count">{data?.currentStreakCount || 0}</span>
        </div>
        <h1 className="streak__title">{data?.currentStreakCount || 0} Day Streak!</h1>
        <p className="streak__subtitle">Consistency is the secret to winning scholarships and securing top jobs</p>

        {/* Quick Log Action */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button size="sm" variant="secondary" onClick={() => handleLogActivity(15)}>+15 Mins</Button>
          <Button size="sm" variant="secondary" onClick={() => handleLogActivity(30)}>+30 Mins</Button>
          <Button size="sm" variant="primary" onClick={() => handleLogActivity(60)}>+1 Hour Session</Button>
        </div>
      </div>

      <div className="streak__stats">
        {stats.map((s, i) => (
          <div key={i} className="streak__stat-card" style={{ borderTopColor: s.color }}>
            <s.icon size={20} style={{ color: s.color }} />
            <span className="streak__stat-value">{s.value}</span>
            <span className="streak__stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="streak__section">
        <h2 className="streak__section-title"><Calendar size={18} /> Activity Heatmap</h2>
        <Card variant="elevated">
          <div className="card-body">
            <div className="streak__heatmap-labels">
              {weekDays.map((d, i) => i % 2 === 0 && <span key={d} className="streak__heatmap-day" style={{ gridRow: i + 1 }}>{d}</span>)}
            </div>
            <div className="streak__heatmap">
              {heatmapData.map((week, wi) => (
                <div key={wi} className="streak__heatmap-col">
                  {week.map((level, di) => (
                    <div key={di} className="streak__heatmap-cell" style={{ background: heatColors[level] }}
                      title={`${weekDays[di]}: ${level === 0 ? 'No activity' : level === 1 ? 'Light' : level === 2 ? 'Moderate' : 'Heavy'}`} />
                  ))}
                </div>
              ))}
            </div>
            <div className="streak__heatmap-legend">
              <span>Less</span>
              {heatColors.map((c, i) => <div key={i} className="streak__heatmap-cell" style={{ background: c }} />)}
              <span>More</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="streak__section">
        <h2 className="streak__section-title"><Target size={18} /> Daily Goal</h2>
        <Card variant="elevated">
          <div className="card-body">
            <div className="streak__goal-time">
              <label className="streak__goal-label">Minutes per day</label>
              <div className="streak__goal-slider-row">
                <input type="range" className="streak__slider" min={10} max={120} step={5} value={goalMinutes}
                  onChange={e => setGoalMinutes(Number(e.target.value))} />
                <span className="streak__goal-value">{goalMinutes} min</span>
              </div>
              <ProgressBar progress={(goalMinutes / 120) * 100} showPercentage={false} />
            </div>
            <div className="streak__goal-days">
              <label className="streak__goal-label">Active days</label>
              <div className="streak__day-buttons">
                {weekDays.map((d, i) => (
                  <button key={d} className={`streak__day-btn ${goalDays.includes(i) ? 'streak__day-btn--active' : ''}`}
                    onClick={() => toggleDay(i)}>{d}</button>
                ))}
              </div>
            </div>
            <Button variant="primary" fullWidth onClick={handleSaveGoal} disabled={saving}>
              {saving ? 'Saving...' : 'Save Goal'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="streak__section">
        <h2 className="streak__section-title">📅 This Week</h2>
        <div className="streak__week-progress">
          {weekDays.map((d, i) => {
            const done = i < 4;
            const today = i === 4;
            return (
              <div key={d} className={`streak__week-day ${done ? 'done' : ''} ${today ? 'today' : ''}`}>
                <div className="streak__week-circle">{done ? '✓' : today ? '◉' : ''}</div>
                <span className="streak__week-label">{d}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
