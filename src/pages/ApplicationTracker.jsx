import { useState } from 'react';
import { Card, Button, Badge, Modal } from '../components/ui';
import { Plus, GripVertical, ExternalLink, Calendar, Building2, MoreHorizontal } from 'lucide-react';
import './ApplicationTracker.css';

const columns = [
  { id: 'wishlist', title: 'Wishlist', color: 'var(--text-secondary)', emoji: '📌' },
  { id: 'applying', title: 'Applying', color: 'var(--color-primary)', emoji: '✏️' },
  { id: 'submitted', title: 'Submitted', color: 'var(--color-accent-amber)', emoji: '📨' },
  { id: 'interview', title: 'Interview', color: 'var(--color-accent-teal)', emoji: '🎤' },
  { id: 'accepted', title: 'Accepted', color: 'var(--color-success)', emoji: '🎉' },
  { id: 'rejected', title: 'Rejected', color: 'var(--color-error)', emoji: '❌' },
];

const mockApps = [
  { id: 'a1', title: 'Chevening Scholarship 2026', org: 'UK Government', deadline: '2026-11-01', status: 'applying', type: 'Scholarship' },
  { id: 'a2', title: 'PTDF Overseas Scholarship', org: 'PTDF Nigeria', deadline: '2026-09-15', status: 'submitted', type: 'Scholarship' },
  { id: 'a3', title: 'Flutterwave Internship', org: 'Flutterwave', deadline: '2026-08-01', status: 'interview', type: 'Internship' },
  { id: 'a4', title: 'Google STEP Internship', org: 'Google', deadline: '2026-10-30', status: 'wishlist', type: 'Internship' },
  { id: 'a5', title: 'TETFund Research Grant', org: 'TETFund', deadline: '2026-08-20', status: 'submitted', type: 'Grant' },
  { id: 'a6', title: 'Andela Fellowship', org: 'Andela', deadline: '2026-07-15', status: 'accepted', type: 'Fellowship' },
  { id: 'a7', title: 'McKinsey Internship', org: 'McKinsey', deadline: '2026-07-30', status: 'rejected', type: 'Internship' },
  { id: 'a8', title: 'AGIP Scholarship', org: 'NAOC', deadline: '2026-12-01', status: 'wishlist', type: 'Scholarship' },
];

export default function ApplicationTracker() {
  const [apps, setApps] = useState(mockApps);
  const [showAdd, setShowAdd] = useState(false);
  const [dragItem, setDragItem] = useState(null);

  const handleDragStart = (e, appId) => { setDragItem(appId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e, colId) => { e.preventDefault(); if (dragItem) { setApps(a => a.map(x => x.id === dragItem ? { ...x, status: colId } : x)); setDragItem(null); } };

  return (
    <div className="tracker">
      <div className="tracker__header">
        <div>
          <h1 className="tracker__title">📋 Application Tracker</h1>
          <p className="tracker__subtitle">Drag applications between columns to update their status</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAdd(true)}>Add</Button>
      </div>

      <div className="tracker__stats">
        {columns.map(col => {
          const count = apps.filter(a => a.status === col.id).length;
          return <div key={col.id} className="tracker__stat"><span className="tracker__stat-num" style={{ color: col.color }}>{count}</span><span className="tracker__stat-label">{col.title}</span></div>;
        })}
      </div>

      <div className="tracker__board">
        {columns.map(col => (
          <div key={col.id} className="tracker__column" onDragOver={handleDragOver} onDrop={e => handleDrop(e, col.id)}>
            <div className="tracker__col-header" style={{ borderBottomColor: col.color }}>
              <span className="tracker__col-emoji">{col.emoji}</span>
              <span className="tracker__col-title">{col.title}</span>
              <span className="tracker__col-count">{apps.filter(a => a.status === col.id).length}</span>
            </div>
            <div className="tracker__col-body">
              {apps.filter(a => a.status === col.id).map(app => (
                <div key={app.id} className="tracker__card" draggable onDragStart={e => handleDragStart(e, app.id)}>
                  <div className="tracker__card-grip"><GripVertical size={14} /></div>
                  <div className="tracker__card-content">
                    <h4 className="tracker__card-title">{app.title}</h4>
                    <span className="tracker__card-org"><Building2 size={12} /> {app.org}</span>
                    <div className="tracker__card-footer">
                      <Badge variant={app.type === 'Scholarship' ? 'primary' : app.type === 'Internship' ? 'success' : 'info'}>{app.type}</Badge>
                      <span className="tracker__card-deadline"><Calendar size={11} /> {app.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Application">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-md) 0' }}>
          <input className="input" placeholder="Opportunity title..." />
          <input className="input" placeholder="Organization..." />
          <input className="input" type="date" />
          <select className="input"><option>Scholarship</option><option>Internship</option><option>Fellowship</option><option>Grant</option><option>Job</option></select>
          <Button variant="primary" fullWidth onClick={() => setShowAdd(false)}>Add to Wishlist</Button>
        </div>
      </Modal>
    </div>
  );
}
