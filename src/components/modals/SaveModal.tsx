import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
    currentName: string;
}

export default function SaveModal({ isOpen, onClose, onConfirm, currentName }: SaveModalProps) {
    const [name, setName] = useState(currentName);

    // Sync local state when modal opens
    useEffect(() => {
        if (isOpen) setName(currentName);
    }, [isOpen, currentName]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#111] border border-gray-800 rounded-xl shadow-2xl w-96 overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-white/5">
                    <h3 className="text-white font-semibold">Save Project</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                            placeholder="My Awesome Architecture"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-4 py-3 bg-white/5 border-t border-gray-800">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(name)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
                    >
                        <Save size={14} />
                        Save Project
                    </button>
                </div>
            </div>
        </div>
    );
}