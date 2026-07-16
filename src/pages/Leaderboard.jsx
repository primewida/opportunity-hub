import { useState } from 'react';
import { Card, TabBar, Avatar } from '../components/ui';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import './Leaderboard.css';

const mockLeaders = [
  { id: 1, name: 'Adaeze Okafor', school: 'University of Lagos', score: 2840, streak: 45, avatar: 'AO' },
  { id: 2, name: 'Emeka Nwankwo', school: 'University of Ibadan', score: 2715, streak: 38, avatar: 'EN' },
  { id: 3, name: 'Fatima Abdullahi', school: 'ABU Zaria', score: 2690, streak: 41, avatar: 'FA' },
  { id: 4, name: 'Chidinma Eze', school: 'UNILAG', score: 2580, streak: 33, avatar: 'CE' },
  { id: 5, name: 'Oluwaseun Adeyemi', school: 'OAU Ile-Ife', score: 2510, streak: 29, avatar: 'OA' },
  { id: 6, name: 'Blessing Onyema', school: 'UNIBEN', score: 2445, streak: 27, avatar: 'BO' },
  { id: 7, name: 'Ibrahim Musa', school: 'BUK Kano', score: 2380, streak: 25, avatar: 'IM' },
  { id: 8, name: 'Ngozi Chukwu', school: 'UNN Nsukka', score: 2320, streak: 22, avatar: 'NC' },
  { id: 9, name: 'Tunde Bakare', school: 'Covenant University', score: 2250, streak: 20, avatar: 'TB' },
  { id: 10, name: 'You', school: 'University of Lagos', score: 2180, streak: 12, avatar: 'YO', isYou: true },
];

const medals = [Crown, Medal, Medal];
const medalColors = ['var(--color-accent-amber)', '#C0C0C0', '#CD7F32'];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Global', icon: Trophy },
    { label: 'My School', icon: TrendingUp },
    { label: 'Friends', icon: Medal },
  ];

  const top3 = mockLeaders.slice(0, 3);
  const rest = mockLeaders.slice(3);

  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <h1 className="leaderboard__title">🏆 Leaderboard</h1>
        <p className="leaderboard__subtitle">See how your consistency compares with peers</p>
      </div>

      <TabBar tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <div className="leaderboard__podium">
        {[top3[1], top3[0], top3[2]].map((user, i) => {
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
