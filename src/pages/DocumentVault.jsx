import { useState, useEffect } from 'react';
import { documents } from '../services/api';
import { Card, Button, Badge, Modal } from '../components/ui';
import { FileText, Upload, Download, Trash2, Eye, FolderOpen, Shield, Search, Plus } from 'lucide-react';
import './DocumentVault.css';

const categories = ['All', 'Certificate', 'Transcript', 'ID', 'CV', 'Test Score', 'Reference'];

const getIcon = (type) => {
  switch (type) {
    case 'Certificate': return '🎓';
    case 'Transcript': return '📄';
    case 'ID': return '🛂';
    case 'CV': return '📝';
    case 'Test Score': return '📊';
    case 'Reference': return '✉️';
    default: return '📄';
  }
};

export default function DocumentVault() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [docs, setDocs] = useState([]);
  const [storage, setStorage] = useState({ used: 0, total: 50, percentage: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDocs = () => {
    Promise.all([documents.getAll(), documents.getStorage()])
      .then(([docRes, storeRes]) => {
        const mapped = docRes.map(d => ({
          id: d.id,
          name: d.documentName,
          type: d.documentCategory || 'Other',
          size: d.fileSizeBytes ? `${(d.fileSizeBytes / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
          uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toISOString().split('T')[0] : 'Unknown',
          icon: getIcon(d.documentCategory)
        }));
        setDocs(mapped);
        if (storeRes) setStorage(storeRes);
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (id) => {
    await documents.delete(id);
    fetchDocs();
  };

  const handleUploadMock = async () => {
    // In a real app we'd get file data from the dropzone
    await documents.upload({ documentName: 'New File.pdf', documentCategory: 'CV', fileSizeBytes: 1048576 });
    setShowUpload(false);
    fetchDocs();
  };

  const filtered = docs.filter(d => {
    if (filter !== 'All' && d.type !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="vault">Loading...</div>;

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
                <button className="vault__action-btn vault__action-btn--danger" title="Delete" onClick={() => handleDelete(doc.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="vault__storage">
        <div className="vault__storage-bar"><div className="vault__storage-fill" style={{ width: `${storage.percentage || 0}%` }} /></div>
        <span className="vault__storage-text">{storage.used || 0} MB of {storage.total || 50} MB used</span>
      </div>

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-md) 0' }}>
          <div className="vault__dropzone">
            <Upload size={32} style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
            <p><strong>Click to browse</strong> or drag and drop</p>
            <span>PDF, DOC, JPG, PNG — Max 10MB</span>
          </div>
          <select className="input"><option value="">Select document type...</option>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select>
          <Button variant="primary" fullWidth onClick={handleUploadMock}>Upload Document</Button>
        </div>
      </Modal>
    </div>
  );
}
