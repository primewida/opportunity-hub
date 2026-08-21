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
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Certificate');
  const [uploading, setUploading] = useState(false);

  const fetchDocs = () => {
    Promise.all([documents.getAll(), documents.getStorage()])
      .then(([docRes, storeRes]) => {
        const mapped = (docRes || []).map(d => ({
          id: d.id,
          name: d.documentName,
          type: d.documentCategory || 'Other',
          size: d.fileSizeBytes ? `${(d.fileSizeBytes / 1024 / 1024).toFixed(2)} MB` : '0.5 MB',
          uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toISOString().split('T')[0] : 'Today',
          fileUrl: d.fileUrl,
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
    if (!confirm('Are you sure you want to delete this document?')) return;
    await documents.delete(id);
    fetchDocs();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleRealUpload = async () => {
    if (!uploadFile) {
      alert('Please select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        await documents.upload({
          documentName: uploadFile.name,
          documentCategory: uploadCategory,
          fileType: uploadFile.type || 'application/pdf',
          fileSizeBytes: uploadFile.size,
          fileData: base64Data
        });
        setUploading(false);
        setShowUpload(false);
        setUploadFile(null);
        fetchDocs();
      };
      reader.readAsDataURL(uploadFile);
    } catch (err) {
      console.error(err);
      setUploading(false);
      alert('Upload failed. Please try again.');
    }
  };

  const handleDownload = (doc) => {
    if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = doc.name;
      a.click();
    } else {
      window.open(doc.fileUrl || '#', '_blank');
    }
  };

  const filtered = docs.filter(d => {
    if (filter !== 'All' && d.type !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="vault" style={{ padding: '2rem', textAlign: 'center' }}>Loading documents...</div>;

  return (
    <div className="vault">
      <div className="vault__header">
        <div>
          <h1 className="vault__title">📂 Document Vault</h1>
          <p className="vault__subtitle">Securely store certificates, transcripts, and IDs for quick access</p>
        </div>
        <Button variant="primary" size="sm" icon={Upload} onClick={() => setShowUpload(true)}>Upload Document</Button>
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
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>
            <FolderOpen size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p>No documents uploaded yet. Click <strong>Upload Document</strong> to add your certificates, transcripts, or CV.</p>
          </div>
        ) : (
          filtered.map(doc => (
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
                  <button className="vault__action-btn" title="Download / Preview" onClick={() => handleDownload(doc)}><Download size={16} /></button>
                  <button className="vault__action-btn vault__action-btn--danger" title="Delete" onClick={() => handleDelete(doc.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="vault__storage">
        <div className="vault__storage-bar"><div className="vault__storage-fill" style={{ width: `${Math.min(100, storage.percentage || 5)}%` }} /></div>
        <span className="vault__storage-text">{(storage.used / 1024 / 1024).toFixed(2)} MB of 100 MB used</span>
      </div>

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', padding: 'var(--space-md) 0' }}>
          <label className="vault__dropzone" style={{ cursor: 'pointer', display: 'block' }}>
            <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ display: 'none' }} />
            <Upload size={32} style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
            <p><strong>{uploadFile ? uploadFile.name : 'Click to select document'}</strong></p>
            <span>{uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOC, JPG, PNG — Max 10MB'}</span>
          </label>

          <label style={{ fontSize: 'var(--text-caption)', color: 'var(--text-secondary)' }}>Document Category</label>
          <select className="input" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
            {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <Button variant="primary" fullWidth onClick={handleRealUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
