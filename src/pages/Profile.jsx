import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Button, Avatar, Badge } from '../components/ui';
import { users } from '../services/api';
import { User, Mail, Phone, MapPin, GraduationCap, Edit3, Sun, Moon, Monitor, Bell, Lock, LogOut, ChevronRight } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const app = useApp();
  const { theme, setTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // We use app.user as default, but in edit we could update it
  const user = app.user || { name: 'Student User', email: 'student@example.com', phone: '+234 812 345 6789', state: 'Lagos', education: 'Undergraduate' };

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    state: user.state || '',
    education: user.education || ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await users.updateProfile(formData);
      // We could update context here too
      // app.dispatch({ type: 'SET_USER', payload: { ...app.user, ...formData } });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
          <Avatar name={formData.name} size={72} />
          <div className="profile__hero-info">
            <h1 className="profile__name">{formData.name}</h1>
            <p className="profile__email">{formData.email}</p>
            <Badge variant="primary">{formData.education || 'Student'}</Badge>
          </div>
          <Button variant="outline" size="sm" icon={Edit3} onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</Button>
        </div>
      </Card>

      <Card variant="elevated">
        <div className="card-body">
          <h2 className="profile__section-title">Personal Information</h2>
          <div className="profile__fields">
            {[
              { icon: User, label: 'Full Name', value: formData.name, key: 'name' },
              { icon: Mail, label: 'Email', value: formData.email, key: 'email' },
              { icon: Phone, label: 'Phone', value: formData.phone || '+234 XXX XXX XXXX', key: 'phone' },
              { icon: MapPin, label: 'State', value: formData.state || 'Not set', key: 'state' },
              { icon: GraduationCap, label: 'Education', value: formData.education || 'Not set', key: 'education' },
            ].map((f, i) => (
              <div key={i} className="profile__field">
                <f.icon size={16} style={{ color: 'var(--color-primary)' }} />
                <div className="profile__field-info">
                  <span className="profile__field-label">{f.label}</span>
                  {editing ? 
                    <input 
                      className="input profile__field-input" 
                      value={f.value} 
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                    /> : 
                    <span className="profile__field-value">{f.value}</span>
                  }
                </div>
              </div>
            ))}
          </div>
          {editing && <Button variant="primary" fullWidth style={{ marginTop: 'var(--space-md)' }} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>}
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
