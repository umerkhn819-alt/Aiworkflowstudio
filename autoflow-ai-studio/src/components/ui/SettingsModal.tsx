import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { loadSettings, saveSettings } from '../../lib/storage';
import { KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { showToast } from './Toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setApiKey(loadSettings().apiKey);
      setSaved(false);
    }
  }, [open]);

  const handleSave = () => {
    saveSettings({ apiKey: apiKey.trim() });
    setSaved(true);
    showToast('success', apiKey.trim() ? 'API key saved.' : 'API key cleared.');
    setTimeout(onClose, 800);
  };

  const hasSavedKey = !!loadSettings().apiKey;

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="flex flex-col gap-5">
        {/* Backend AI notice */}
        {!hasSavedKey && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <CheckCircle size={16} className="text-violet-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-violet-300">Backend AI Active</p>
              <p className="text-xs text-violet-400/70 mt-0.5">
                This app now sends AI requests to your backend (`/api/ai/run`).
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <KeyRound size={14} />
            Optional Browser API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
              placeholder="sk-..."
              className="w-full bg-[#0A0A18] border border-[#2E2E50] rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Optional fallback only. Primary AI execution uses your backend server.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            loading={saved}
          >
            {saved ? 'Saved!' : 'Save Key'}
          </Button>
        </div>

        {apiKey && (
          <button
            onClick={() => { setApiKey(''); saveSettings({ apiKey: '' }); showToast('info', 'API key cleared.'); onClose(); }}
            className="text-xs text-red-400/70 hover:text-red-400 transition-colors text-center"
          >
            Clear saved key
          </button>
        )}
      </div>
    </Modal>
  );
}
