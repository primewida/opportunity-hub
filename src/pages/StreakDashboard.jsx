import { useState } from 'react';
import { Card, Button, ProgressBar } from '../components/ui';
import { Flame, Target, Clock, Calendar, TrendingUp, Award } from 'lucide-react';
import './StreakDashboard.css';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

// Generate mock heatmap data (26 weeks)
const generateHeatmap = () => {
  const data = [];
  for (let w = 0; w < 26; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const r = Math.random();
      week.push(r > 0.7 ? 3 : r > 0.4 ? 2 : r > 0.2 ? 1 : 0);
    }
    data.push(week);
  }
  return data;
};

const heatmapData = generateHeatmap();

export default function StreakDashboard() {
  const [goalDays, setGoalDays] = useState([0, 1, 2, 3, 4]);
  const [goalMinutes, setGoalMinutes] = useState(30);

  const stats = [
    { icon: Flame, label: 'Current Streak', value: '12 days', color: 'var(--color-accent-amber)' },
    { icon: Award, label: 'Longest Streak', value: '34 days', color: 'var(--color-primary)' },
    { icon: Clock, label: 'Total Hours', value: '127 hrs', color: 'var(--color-accent-teal)' },
    { icon: TrendingUp, label: 'This Week', value: '4.5 hrs', color: 'var(--color-success)' },
  ];

  const toggleDay = (d) => setGoalDays(g => g.includes(d) ? g.filter(x => x !== d) : [...g, d]);
  const heatColors = ['var(--bg-secondary)', 'rgba(253,203,110,0.3)', 'rgba(253,203,110,0.6)', 'var(--color-accent-amber)'];

  return (
    <div className="streak">
      <div className="streak__hero">
        <div className="streak__flame-container">
          <Flame size={56} className="streak__flame-icon" />
          <span className="streak__count">12</span>
        </div>
        <h1 className="streak__hero-title">Day Streak 🔥</h1>
        <p className="streak__hero-text">You're on fire! Keep learning every day.</p>
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
            <Button variant="primary" fullWidth>Save Goal</Button>
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
