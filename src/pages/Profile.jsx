import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Button, Avatar, Badge } from '../components/ui';
import { User, Mail, Phone, MapPin, GraduationCap, Edit3, Sun, Moon, Monitor, Bell, Lock, LogOut, ChevronRight } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const app = useApp();
  const { theme, setTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const user = app.user || { name: 'Student User', email: 'student@example.com', phone: '+234 812 345 6789', state: 'Lagos', education: 'Undergraduate' };

  const settingsGroups = [
    { title: 'Appearance', items: [
      { icon: theme === 'dark' ? Moon : Sun, label: 'Theme', value: theme, action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
    ]},
    { title: 'Notifications', items: [
      { icon: Bell, label: 'Push Notifications', value: 'Enabled', action: () => {} },
      { icon: Mail, label: 'Email Notifications', value: 'Weekly Digest', action: () => {} },
    ]},
    { title: 'Account', items: [
      { icon: Lock, label: 'Change Password', action: () => {} },
      { icon: LogOut, label: 'Sign Out', danger: true, action: () => {} },
    ]},
  ];

  return (
    <div className="profile">
      <Card variant="elevated">
        <div className="card-body profile__hero">
          <Avatar name={user.name} size={72} />
          <div className="profile__hero-info">
            <h1 className="profile__name">{user.name}</h1>
            <p className="profile__email">{user.email}</p>
            <Badge variant="primary">{user.education || 'Student'}</Badge>
          </div>
          <Button variant="outline" size="sm" icon={Edit3} onClick={() => setEditing(!editing)}>Edit</Button>
        </div>
      </Card>

      <Card variant="elevated">
        <div className="card-body">
          <h2 className="profile__section-title">Personal Information</h2>
          <div className="profile__fields">
            {[
              { icon: User, label: 'Full Name', value: user.name },
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Phone, label: 'Phone', value: user.phone || '+234 XXX XXX XXXX' },
              { icon: MapPin, label: 'State', value: user.state || 'Not set' },
              { icon: GraduationCap, label: 'Education', value: user.education || 'Not set' },
            ].map((f, i) => (
              <div key={i} className="profile__field">
                <f.icon size={16} style={{ color: 'var(--color-primary)' }} />
                <div className="profile__field-info">
                  <span className="profile__field-label">{f.label}</span>
                  {editing ? <input className="input profile__field-input" defaultValue={f.value} /> : <span className="profile__field-value">{f.value}</span>}
                </div>
              </div>
            ))}
          </div>
          {editing && <Button variant="primary" fullWidth style={{ marginTop: 'var(--space-md)' }} onClick={() => setEditing(false)}>Save Changes</Button>}
        </div>
      </Card>

      {settingsGroups.map((group, gi) => (
        <Card key={gi} variant="elevated">
          <div className="card-body">
            <h2 className="profile__section-title">{group.title}</h2>
            {group.items.map((item, ii) => (
              <button key={ii} className={`profile__setting ${item.danger ? 'profile__setting--danger' : ''}`} onClick={item.action}>
                <item.icon size={18} />
                <span className="profile__setting-label">{item.label}</span>
                {item.value && <span className="profile__setting-value">{item.value}</span>}
                <ChevronRight size={16} className="profile__setting-chevron" />
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
