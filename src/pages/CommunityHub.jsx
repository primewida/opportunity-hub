import { useState, useEffect } from 'react';
import { TabBar, Card, Button, Modal } from '../components/ui';
import { community } from '../services/api';
import { getRelativeTime } from '../utils/helpers';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Plus, Users, ChevronDown, ChevronUp, Send } from 'lucide-react';
import './CommunityHub.css';

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState(0);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [votes, setVotes] = useState({});

  const tabs = [
    { label: 'Feed', icon: MessageSquare },
    { label: 'My Groups', icon: Users },
    { label: 'Trending', icon: ThumbsUp },
  ];

  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      community.getGroups(),
      community.getFeed(1)
    ]).then(([groupsData, feedData]) => {
      setGroups(groupsData || []);
      setPosts(feedData?.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const joinedGroups = groups.filter(g => g.joined) || groups.slice(0, 3) || [];
  const otherGroups = groups.filter(g => !g.joined) || groups.slice(3) || [];
  const trendingPosts = [...posts].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

  const handleVote = (postId, type) => {
    setVotes(v => {
      const current = v[postId];
      if (current === type) return { ...v, [postId]: null };
      return { ...v, [postId]: type };
    });
    community.vote(postId, type).then(updated => {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updated } : p));
    }).catch(console.error);
  };

  const handleCreatePost = () => {
    const groupId = joinedGroups[0]?.id || 'general';
    community.createPost(groupId, newPostText).then(post => {
      setPosts(prev => [post, ...prev]);
      setNewPostText('');
      setShowNewPost(false);
    }).catch(console.error);
  };

  const [commentInputs, setCommentInputs] = useState({});

  const handleAddComment = (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    community.addComment(postId, text).then(newComment => {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const currentComments = p.comments || [];
          return {
            ...p,
            commentCount: (p.commentCount || 0) + 1,
            comments: [...currentComments, newComment]
          };
        }
        return p;
      }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    }).catch(err => {
      console.warn('Comment warning:', err);
    });
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: 'OpportunityHub Community Discussion',
        text: post.content?.slice(0, 100),
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const renderPost = (post) => (
    <Card key={post.id} variant="elevated" className="community__post">
      <div className="card-body">
        <div className="community__post-header">
          <div className="community__avatar">{post.author?.initials || post.author?.name?.slice(0, 2).toUpperCase() || '??'}</div>
          <div className="community__post-author-info">
            <span className="community__author-name">{post.author?.name || 'Anonymous'}</span>
            <span className="community__post-time">{post.author?.title || ''} · {getRelativeTime(post.createdAt || post.timestamp || '2026-06-28')}</span>
          </div>
        </div>
        <p className="community__post-text">{post.content}</p>
        <div className="community__post-actions">
          <button className={`community__vote-btn ${votes[post.id] === 'up' ? 'community__vote-btn--active-up' : ''}`}
            onClick={() => handleVote(post.id, 'up')}>
            <ThumbsUp size={16} /> <span>{(post.upvotes || 0) + (votes[post.id] === 'up' ? 1 : 0)}</span>
          </button>
          <button className={`community__vote-btn ${votes[post.id] === 'down' ? 'community__vote-btn--active-down' : ''}`}
            onClick={() => handleVote(post.id, 'down')}>
            <ThumbsDown size={16} /> <span>{post.downvotes || 0}</span>
          </button>
          <button className="community__action-btn" onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
            <MessageSquare size={16} /> <span>{post.commentCount || post.comments?.length || 0}</span>
            {expandedPost === post.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button className="community__action-btn" title="Share" onClick={() => handleShare(post)}><Share2 size={16} /></button>
        </div>
        {expandedPost === post.id && (
          <div className="community__comments animate-fadeInUp">
            {(post.comments || []).length > 0 ? post.comments.map((c, i) => (
              <div key={i} className="community__comment">
                <div className="community__comment-avatar">{c.author?.initials || 'U'}</div>
                <div className="community__comment-body">
                  <span className="community__comment-name">{c.author?.name || 'User'}</span>
                  <p className="community__comment-text">{c.content}</p>
                </div>
              </div>
            )) : <p className="community__no-comments">No comments yet. Be the first to share your thoughts!</p>}
            <div className="community__comment-input">
              <input 
                className="input" 
                placeholder="Write a comment..." 
                value={commentInputs[post.id] || ''}
                onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
              />
              <button className="community__send-btn" onClick={() => handleAddComment(post.id)}><Send size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="community">
      <div className="community__header">
        <h1 className="community__title">Community Hub</h1>
        <p className="community__subtitle">Connect, share experiences, and learn from fellow Nigerian students</p>
      </div>

      <TabBar tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      {activeTab === 0 && (
        <div className="community__content">
          {joinedGroups.length > 0 && (
            <div className="community__groups-section">
              <h3 className="community__section-title">Your Groups</h3>
              <div className="community__groups-scroll">
                {joinedGroups.map(g => (
                  <div key={g.id} className="community__group-chip">
                    <span className="community__group-icon">{g.icon || '👥'}</span>
                    <span className="community__group-name">{g.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="community__feed">
            {loading ? <p style={{textAlign: 'center', padding: '2rem'}}>Loading feed...</p> : posts.map(post => renderPost(post))}
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="community__content">
          <h3 className="community__section-title">Joined Groups</h3>
          <div className="community__groups-grid">
            {joinedGroups.map(g => (
              <Card key={g.id} variant="interactive">
                <div className="card-body community__group-card">
                  <span className="community__group-card-icon">{g.icon || '👥'}</span>
                  <h4 className="community__group-card-name">{g.name}</h4>
                  <span className="community__group-card-members"><Users size={14} /> {g.memberCount || g.members || 0} members</span>
                  <Button variant="outline" size="sm" fullWidth>View Group</Button>
                </div>
              </Card>
            ))}
          </div>
          <h3 className="community__section-title" style={{ marginTop: 'var(--space-xl)' }}>Discover Groups</h3>
          <div className="community__groups-grid">
            {otherGroups.map(g => (
              <Card key={g.id} variant="interactive">
                <div className="card-body community__group-card">
                  <span className="community__group-card-icon">{g.icon || '🌍'}</span>
                  <h4 className="community__group-card-name">{g.name}</h4>
                  <span className="community__group-card-members"><Users size={14} /> {g.memberCount || g.members || 0} members</span>
                  <Button variant="primary" size="sm" fullWidth>Join Group</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="community__content">
          <h3 className="community__section-title">🔥 Trending Discussions</h3>
          <div className="community__feed">
            {trendingPosts.map(post => renderPost(post))}
          </div>
        </div>
      )}

      {/* Floating New Post Button */}
      <button className="community__fab" onClick={() => setShowNewPost(true)} aria-label="New Post">
        <Plus size={24} />
      </button>

      {/* New Post Modal */}
      <Modal isOpen={showNewPost} onClose={() => setShowNewPost(false)} title="Create a Post">
        <div className="community__new-post">
          <textarea className="input community__new-post-textarea" rows={5}
            placeholder="Share an experience, ask a question, or give advice to fellow students..." 
            value={newPostText} onChange={e => setNewPostText(e.target.value)} />
          <div className="community__new-post-actions">
            <span className="community__new-post-count">{newPostText.length}/500</span>
            <Button variant="primary" disabled={!newPostText.trim()} onClick={handleCreatePost}>
              Post
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
