import { INITIAL_SWEETS_CONFIG, SWEETS_OPTIONS } from '@/constants/weddingIdentityData';
import { SweetsConfig } from '@/types/weddingIdentity';
import React, { useState } from 'react';
import Icon from '../Icon';
import SectionHeader from '../SectionHeader';

const SweetsPage: React.FC = () => {
  const [config, setConfig] = useState<SweetsConfig>(INITIAL_SWEETS_CONFIG);
  const set = (k: keyof SweetsConfig, v: string) => setConfig((c) => ({ ...c, [k]: v }));

  const paletteCores = ['#F7E7C8', '#E3C1B5', '#C9A96E', '#FFFDF5', '#BDA88D', '#D4B896', '#C4756A', '#E5E1D1'];

  return (
    <div className="wi-page">
      <SectionHeader
        eyebrow="Identidade do Casamento"
        title="Doces & Bem-casados"
        subtitle="Personalize a embalagem dos bem-casados para harmonizar com a estetica do casamento."
        actions={
          <>
            <button className="btn-primary"><Icon name="download" size={14} color="#fff" /> Exportar Design</button>
            <button className="btn-secondary"><Icon name="eye" size={14} /> Previa Completa</button>
          </>
        }
      />

      <div className="sweets-layout">
        <div>
          <div className="marriplan-card" style={{ padding: 24 }}>
            <div className="wi-section-title">Configuracoes</div>

            {Object.entries(SWEETS_OPTIONS).map(([key, opts]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <div className="pill-selector">
                  {opts.map((o) => (
                    <button key={o} className={`pill ${config[key as keyof SweetsConfig] === o ? 'selected' : ''}`} onClick={() => set(key as keyof SweetsConfig, o)}>{o}</button>
                  ))}
                </div>
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Cor da Embalagem</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {paletteCores.map((c) => (
                  <div key={c} onClick={() => set('cor', c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer', border: config.cor === c ? '2px solid var(--marriplan-text)' : '2px solid transparent', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', transition: 'all 0.15s' }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }} />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Texto da Tag</label>
              <input className="wi-input" value={config.tagText} onChange={(e) => set('tagText', e.target.value)} placeholder="Ex: A & R" />
            </div>
          </div>
        </div>

        <div>
          <div className="marriplan-card" style={{ padding: 24 }}>
            <div className="wi-section-title">Previa do Design</div>
            <div className="sweets-preview-box" style={{ background: `${config.cor}55`, marginBottom: 16 }}>
              <div style={{ width: 140, height: 140, borderRadius: config.forma === 'Coração' ? '50% 50% 50% 50% / 60% 60% 40% 40%' : config.forma === 'Redondo' ? '50%' : config.forma === 'Oval' ? '50% / 30%' : '12px', background: config.cor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', position: 'relative' }}>
                <span style={{ fontSize: 14, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: 'rgba(44,36,32,0.7)' }}>{config.tagText}</span>
                {config.textura !== 'Lisa' && (
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: config.textura === 'Rendada' ? 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)' : 'none', borderRadius: 'inherit' }} />
                )}
              </div>
              {config.laco !== 'Sem Laço' && (
                <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(44,36,32,0.5)', fontStyle: 'italic' }}>— {config.laco} —</div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { k: 'Embalagem', v: config.embalagem },
                { k: 'Laço', v: config.laco },
                { k: 'Textura', v: config.textura },
                { k: 'Forma', v: config.forma },
              ].map((item) => (
                <div key={item.k} style={{ background: 'var(--marriplan-surface-muted)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--marriplan-muted)', letterSpacing: 1 }}>{item.k.toUpperCase()}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="marriplan-card" style={{ padding: 24, marginTop: 20 }}>
            <div className="wi-section-title">Variacoes Sugeridas</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {['#F7E7C8', '#E3C1B5', '#C9A96E'].map((c, i) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => set('cor', c)}>
                  <span style={{ fontSize: 11, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: 'rgba(44,36,32,0.6)' }}>{config.tagText}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SweetsPage;
