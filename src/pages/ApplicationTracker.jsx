import { useState, useEffect } from 'react';
import { applications } from '../services/api';
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

// Mock apps removed

export default function ApplicationTracker() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [dragItem, setDragItem] = useState(null);

  const fetchApps = () => {
    applications.getAll().then(res => {
      const flat = [];
      if (res) {
        for (const [status, list] of Object.entries(res)) {
          // Normalize status key to match our columns (e.g. 'wishlist', 'applying')
          const normalizedStatus = status.toLowerCase();
          list.forEach(app => flat.push({ ...app, status: normalizedStatus }));
        }
      }
      setApps(flat);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleDragStart = (e, appId) => { setDragItem(appId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = async (e, colId) => { 
    e.preventDefault(); 
    if (dragItem) { 
      // Optimistic update
      setApps(a => a.map(x => x.id === dragItem ? { ...x, status: colId } : x)); 
      try {
        await applications.update(dragItem, { status: colId });
      } catch(err) {
        fetchApps(); // revert on failure
      }
      setDragItem(null); 
    } 
  };

  if (loading) return <div className="tracker">Loading...</div>;

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
          <Button variant="primary" fullWidth onClick={() => {
            // Mock adding an application
            applications.create({ title: 'New Opportunity', org: 'Unknown', status: 'wishlist', type: 'Scholarship' }).then(() => {
              setShowAdd(false);
              fetchApps();
            });
          }}>Add to Wishlist</Button>
        </div>
      </Modal>
    </div>
  );
}
