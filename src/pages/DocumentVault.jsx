import { useState } from 'react';
import { Card, Button, Badge, Modal } from '../components/ui';
import { FileText, Upload, Download, Trash2, Eye, FolderOpen, Shield, Search, Plus } from 'lucide-react';
import './DocumentVault.css';

const mockDocuments = [
  { id: 'd1', name: 'BSc Certificate - UNILAG.pdf', type: 'Certificate', size: '2.4 MB', uploadedAt: '2026-05-10', icon: '🎓' },
  { id: 'd2', name: 'NYSC Discharge Certificate.pdf', type: 'Certificate', size: '1.8 MB', uploadedAt: '2026-04-22', icon: '📜' },
  { id: 'd3', name: 'Official Transcript.pdf', type: 'Transcript', size: '3.1 MB', uploadedAt: '2026-06-01', icon: '📄' },
  { id: 'd4', name: 'International Passport.pdf', type: 'ID', size: '4.2 MB', uploadedAt: '2026-03-15', icon: '🛂' },
  { id: 'd5', name: 'NIN Slip.pdf', type: 'ID', size: '0.8 MB', uploadedAt: '2026-02-20', icon: '🆔' },
  { id: 'd6', name: 'Professional CV v3.pdf', type: 'CV', size: '0.5 MB', uploadedAt: '2026-06-28', icon: '📝' },
  { id: 'd7', name: 'IELTS Score Report.pdf', type: 'Test Score', size: '1.2 MB', uploadedAt: '2026-01-10', icon: '📊' },
  { id: 'd8', name: 'Recommendation Letter - Prof Adeyemi.pdf', type: 'Reference', size: '0.9 MB', uploadedAt: '2026-05-30', icon: '✉️' },
];

const categories = ['All', 'Certificate', 'Transcript', 'ID', 'CV', 'Test Score', 'Reference'];

export default function DocumentVault() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const filtered = mockDocuments.filter(d => {
    if (filter !== 'All' && d.type !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="vault">
      <div className="vault__header">
        <div>
          <h1 className="vault__title">📂 Document Vault</h1>
          <p className="vault__subtitle">Securely store certificates, transcripts, and IDs for quick access</p>
        </div>
        <Button variant="primary" size="sm" icon={Upload} onClick={() => setShowUpload(true)}>Upload</Button>
      </div>

      <div className="vault__security">
        <Shield size={16} style={{ color: 'var(--color-success)' }} />
        <span>Your documents are encrypted and stored securely</span>
      </div>

      <div className="vault__search">
        <div className="vault__search-input">
          <Search size={16} />
          <input className="input" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="vault__categories">
        {categories.map(cat => (
          <button key={cat} className={`vault__cat-btn ${filter === cat ? 'vault__cat-btn--active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>
        ))}
      </div>

      <div className="vault__grid">
        {filtered.map(doc => (
          <Card key={doc.id} variant="interactive">
            <div className="card-body vault__doc">
              <span className="vault__doc-icon">{doc.icon}</span>
              <div className="vault__doc-info">
                <h4 className="vault__doc-name">{doc.name}</h4>
                <div className="vault__doc-meta">
                  <Badge variant="primary">{doc.type}</Badge>
                  <span>{doc.size}</span>
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>
              <div className="vault__doc-actions">
                <button className="vault__action-btn" title="Preview"><Eye size={16} /></button>
                <button className="vault__action-btn" title="Download"><Download size={16} /></button>
                <button className="vault__action-btn vault__action-btn--danger" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="vault__storage">
        <div className="vault__storage-bar"><div className="vault__storage-fill" style={{ width: '35%' }} /></div>
        <span className="vault__storage-text">14.9 MB of 50 MB used</span>
      </div>

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-md) 0' }}>
          <div className="vault__dropzone">
            <Upload size={32} style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
            <p><strong>Click to browse</strong> or drag and drop</p>
            <span>PDF, DOC, JPG, PNG — Max 10MB</span>
          </div>
          <select className="input"><option value="">Select document type...</option>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select>
          <Button variant="primary" fullWidth onClick={() => setShowUpload(false)}>Upload Document</Button>
        </div>
      </Modal>
    </div>
  );
}
