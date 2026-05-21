import { INSPIRATION_CATEGORIES, MOCK_INSPIRATIONS } from '@/constants/weddingIdentityData';
import React, { useState } from 'react';
import EmptyState from '../EmptyState';
import Icon from '../Icon';
import SectionHeader from '../SectionHeader';

const InspirationPage: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [favorites, setFavorites] = useState(new Set([0, 2, 4, 6]));
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [pinUrl, setPinUrl] = useState('');
  const [pinNote, setPinNote] = useState('');

  const filtered = activeCategory === 'Todas' ? MOCK_INSPIRATIONS : MOCK_INSPIRATIONS.filter((i) => i.category === activeCategory);

  const itemColors = [
    'linear-gradient(135deg,#f5e8e0,#ecddd4)',
    'linear-gradient(135deg,#e8f0e8,#d8e8d8)',
    'linear-gradient(135deg,#f5f0e0,#ece5c8)',
    'linear-gradient(135deg,#f0e8f0,#e4d8e4)',
    'linear-gradient(135deg,#e8edf5,#d8e4f0)',
    'linear-gradient(135deg,#f5ece0,#ece4d0)',
    'linear-gradient(135deg,#f0e8e8,#e8d8d8)',
    'linear-gradient(135deg,#e8f5f0,#d8ece8)',
  ];

  const itemEmojis = ['🌸', '🌹', '🍽️', '💌', '👗', '🕯️', '🌿', '🛋️'];

  const toggleFav = (id: number) => setFavorites((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div className="wi-page">
      <SectionHeader
        eyebrow="Identidade do Casamento"
        title="Referencias Visuais"
        subtitle="Seu Pinterest interno. Salve imagens, URLs e inspiracoes para compartilhar com seus fornecedores."
        actions={
          <>
            <button className="btn-primary" onClick={() => setShowUploadModal(true)}><Icon name="upload" size={14} color="#fff" /> Upload de Imagens</button>
            <button className="btn-secondary" onClick={() => setShowPinModal(true)}><Icon name="link" size={14} /> Adicionar Link</button>
          </>
        }
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {INSPIRATION_CATEGORIES.map((c) => (
          <button key={c} className={`pill ${activeCategory === c ? 'selected' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="masonry">
        {filtered.map((item, i) => (
          <div key={item.id} className="masonry-item">
            <div style={{ height: item.height, background: itemColors[i % itemColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
              {itemEmojis[i % itemEmojis.length]}
            </div>
            <div className="masonry-overlay">
              <h4>{item.title}</h4>
              <div className="tags">
                {item.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
            <button className={`fav-btn ${favorites.has(item.id) ? 'active' : ''}`} onClick={() => toggleFav(item.id)}>
              {favorites.has(item.id) ? '❤️' : '🤍'}
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon="📌"
          title="Nenhuma referencia encontrada"
          message="Adicione imagens ou links do Pinterest para comecar."
          action={<button className="btn-primary" onClick={() => setShowUploadModal(true)}><Icon name="plus" size={14} color="#fff" /> Adicionar</button>}
        />
      )}

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Upload de Referencias</div>
            <div className="modal-sub">Arraste imagens ou clique para selecionar</div>
            <div className="dropzone" style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Arraste arquivos aqui</p>
              <p style={{ fontSize: 12, color: 'var(--marriplan-muted)' }}>PNG, JPG, WEBP ate 10MB</p>
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="wi-select">
                {INSPIRATION_CATEGORIES.filter((c) => c !== 'Todas').map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input className="wi-input" placeholder="Ex: boho, flores, delicado" />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancelar</button>
              <button className="btn-primary"><Icon name="upload" size={14} color="#fff" /> Enviar</button>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Adicionar Link do Pinterest</div>
            <div className="modal-sub">Cole uma URL de inspiracao para salvar</div>
            <div className="form-group">
              <label className="form-label">URL</label>
              <input className="wi-input" value={pinUrl} onChange={(e) => setPinUrl(e.target.value)} placeholder="https://pinterest.com/pin/..." />
            </div>
            <div className="form-group">
              <label className="form-label">Nota (opcional)</label>
              <textarea className="wi-input" value={pinNote} onChange={(e) => setPinNote(e.target.value)} placeholder="O que voce gostou nessa referencia..." rows={3} style={{ resize: 'none' }} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPinModal(false)}>Cancelar</button>
              <button className="btn-primary"><Icon name="link" size={14} color="#fff" /> Salvar Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspirationPage;
