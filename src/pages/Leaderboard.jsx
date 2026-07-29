import { useState, useEffect } from 'react';
import { leaderboard } from '../services/api';
import { Card, TabBar, Avatar } from '../components/ui';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import './Leaderboard.css';

const medals = [Crown, Medal, Medal];
const medalColors = ['var(--color-accent-amber)', '#C0C0C0', '#CD7F32'];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboard.get().then(res => {
      // Map API to expected JSX format
      const mapped = (res || []).map((u, i) => ({
        id: u.id || i,
        name: `${u.firstName} ${u.lastName}`,
        school: u.institutionName,
        score: u.consistencyScore || 0,
        streak: u.currentStreakCount || 0,
        avatar: `${u.firstName?.[0]||''}${u.lastName?.[0]||''}`,
        isYou: u.isYou || false // assuming api returns isYou or we can't tell, keep default
      }));
      setLeaders(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const tabs = [
    { label: 'Global', icon: Trophy },
    { label: 'My School', icon: TrendingUp },
    { label: 'Friends', icon: Medal },
  ];

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  if (loading) return <div className="leaderboard">Loading...</div>;
  if (!leaders.length) return <div className="leaderboard">No leaderboard data.</div>;

  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <h1 className="leaderboard__title">🏆 Leaderboard</h1>
        <p className="leaderboard__subtitle">See how your consistency compares with peers</p>
      </div>

      <TabBar tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <div className="leaderboard__podium">
        {[top3[1], top3[0], top3[2]].filter(Boolean).map((user, i) => {
          const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const MedalIcon = medals[rank - 1];
          return (
            <div key={user.id} className={`leaderboard__podium-item leaderboard__podium-item--${rank}`}>
              <div className="leaderboard__podium-avatar">
                <Avatar name={user.name} size={rank === 1 ? 64 : 48} />
                <span className="leaderboard__medal" style={{ color: medalColors[rank - 1] }}>
                  <MedalIcon size={rank === 1 ? 24 : 20} fill={medalColors[rank - 1]} />
                </span>
              </div>
              <span className="leaderboard__podium-name">{user.name.split(' ')[0]}</span>
              <span className="leaderboard__podium-score">{user.score.toLocaleString()} pts</span>
              <div className={`leaderboard__podium-bar leaderboard__podium-bar--${rank}`} />
            </div>
          );
        })}
      </div>

      <div className="leaderboard__list">
        {rest.map((user, i) => (
          <Card key={user.id} variant={user.isYou ? 'interactive' : 'default'} className={user.isYou ? 'leaderboard__you' : ''}>
            <div className="card-body leaderboard__row">
              <span className="leaderboard__rank">#{i + 4}</span>
              <Avatar name={user.name} size={36} />
              <div className="leaderboard__info">
                <span className="leaderboard__name">{user.name} {user.isYou && <span className="leaderboard__you-badge">You</span>}</span>
                <span className="leaderboard__school">{user.school}</span>
              </div>
              <div className="leaderboard__score-col">
                <span className="leaderboard__score">{user.score.toLocaleString()}</span>
                <span className="leaderboard__streak-mini">🔥 {user.streak}d</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
