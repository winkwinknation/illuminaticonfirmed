import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { Modal } from '../components/Modal';
import { formatDuration, formatNumber } from '../components/Number';
import { useSaves } from '../context/SaveContext';
import './SavesScreen.css';

const SlotCard = ({ index, summary, onLoad, onNew, onDelete, onExport, onImport }) => {
  const empty = !summary;
  return (
    <article className={`slot ${empty ? 'slot--empty' : ''}`}>
      <header className="slot__head">
        <h3 className="slot__title">Slot {index + 1}</h3>
        {!empty && summary.prestigeLevel > 0 && (
          <span className="slot__tier" title="Prestige tier">△ {summary.prestigeLevel}</span>
        )}
      </header>

      {empty ? (
        <p className="slot__empty">No save in this slot.</p>
      ) : (
        <dl className="slot__stats">
          <div><dt>Faith</dt><dd>{formatNumber(summary.faith)}</dd></div>
          <div><dt>Money</dt><dd>{formatNumber(summary.money)}</dd></div>
          <div><dt>Knowledge</dt><dd>{formatNumber(summary.knowledge)}</dd></div>
          <div><dt>SK</dt><dd>{formatNumber(summary.secretKnowledge, 2, 0)}</dd></div>
          <div><dt>Played</dt><dd>{formatDuration(summary.playtimeMs)}</dd></div>
          <div><dt>Saved</dt><dd>{summary.savedAt ? new Date(summary.savedAt).toLocaleString() : '—'}</dd></div>
        </dl>
      )}

      <div className="slot__actions">
        {empty ? (
          <>
            <Button variant="primary" size="sm" onClick={onNew}>New Game</Button>
            <Button variant="ghost" size="sm" onClick={onImport}>Import</Button>
          </>
        ) : (
          <>
            <Button variant="primary" size="sm" onClick={onLoad}>Continue</Button>
            <Button variant="ghost" size="sm" onClick={onExport}>Export</Button>
            <Button variant="ghost" size="sm" onClick={onImport}>Import</Button>
            <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
          </>
        )}
      </div>
    </article>
  );
};

export const SavesScreen = () => {
  const navigate = useNavigate();
  const { slots, newGame, deleteSlot, exportSlot, importToSlot, setActiveSlotId } = useSaves();
  const [exportText, setExportText] = useState(null);
  const [importTarget, setImportTarget] = useState(null);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const onNew = (i) => {
    newGame(i);
    setActiveSlotId(i);
    navigate('/play/faith');
  };
  const onLoad = (i) => {
    setActiveSlotId(i);
    navigate('/play/faith');
  };
  const onDelete = (i) => setConfirmDelete(i);
  const onExport = (i) => {
    const enc = exportSlot(i);
    if (enc) {
      setExportText(enc);
      try { navigator.clipboard?.writeText(enc); } catch {}
    }
  };
  const onImport = (i) => { setImportTarget(i); setImportText(''); setImportError(null); };
  const submitImport = () => {
    const result = importToSlot(importTarget, importText);
    if (!result.ok) { setImportError(result.error); return; }
    setImportTarget(null);
    setImportText('');
    setImportError(null);
  };

  return (
    <div className="saves">
      <header className="saves__head">
        <h1>Choose Your Path</h1>
        <p>The order keeps four ledgers. Begin a new one, or continue what was started.</p>
      </header>

      <div className="saves__grid">
        {slots.map((s, i) => (
          <SlotCard
            key={i}
            index={i}
            summary={s}
            onLoad={() => onLoad(i)}
            onNew={() => onNew(i)}
            onDelete={() => onDelete(i)}
            onExport={() => onExport(i)}
            onImport={() => onImport(i)}
          />
        ))}
      </div>

      <div className="saves__back">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>← Back to title</Button>
      </div>

      <Modal
        open={exportText != null}
        onClose={() => setExportText(null)}
        title="Save Exported"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setExportText(null)}>Close</Button>
        }
      >
        <p>Copied to clipboard. Save this string somewhere safe — pasting it back into Import will restore this state.</p>
        <textarea className="saves__textarea" readOnly value={exportText || ''} onFocus={(e) => e.target.select()} />
      </Modal>

      <Modal
        open={importTarget != null}
        onClose={() => setImportTarget(null)}
        title={`Import to Slot ${importTarget != null ? importTarget + 1 : ''}`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setImportTarget(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={submitImport} disabled={!importText.trim()}>Import</Button>
          </>
        }
      >
        <p>Paste the save string. This will overwrite the current contents of this slot.</p>
        <textarea
          className="saves__textarea"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="paste save string here…"
        />
        {importError && <p className="saves__error">{importError}</p>}
      </Modal>

      <Modal
        open={confirmDelete != null}
        onClose={() => setConfirmDelete(null)}
        title="Erase this ledger?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => { deleteSlot(confirmDelete); setConfirmDelete(null); }}>Delete</Button>
          </>
        }
      >
        <p>Slot {confirmDelete != null ? confirmDelete + 1 : ''} will be wiped. Faith, money, prestige tiers, and unlocked lore in this slot will be lost forever.</p>
      </Modal>
    </div>
  );
};
