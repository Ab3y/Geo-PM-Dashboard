import { useCallback, useRef, useState } from 'react';
import { useAppDispatch, useAppState } from '../context/AppContext';
import { parseCSV, processUploadedData } from '../utils/dataProcessing';
import type { DataCategory } from '../types';

export default function DataUploader() {
  const dispatch = useAppDispatch();
  const { activeCategory } = useAppState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastUpload, setLastUpload] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }
    setUploading(true);
    try {
      const result = await parseCSV(file);
      const name = file.name.replace('.csv', '');
      const cat: DataCategory = (activeCategory !== 'all' ? activeCategory : 'custom') as DataCategory;
      const dataset = processUploadedData(result.data, name, cat);
      if (dataset) {
        dispatch({ type: 'ADD_DATASET', payload: dataset });
        dispatch({ type: 'SET_ACTIVE_DATASET', payload: dataset.id });
        setLastUpload(name);
      } else {
        alert('Could not parse data. Ensure CSV has a state/region column and a value column.');
      }
    } catch {
      alert('Error parsing file');
    }
    setUploading(false);
  }, [dispatch, activeCategory]);

  return (
    <div>
      <div
        className={`upload-zone p-4 text-center cursor-pointer ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {uploading ? (
          <div className="text-[#00d4ff] text-xs animate-pulse-neon">Processing...</div>
        ) : (
          <>
            <div className="text-2xl mb-2">📁</div>
            <div className="text-xs text-gray-400">
              Drop CSV here or <span className="text-[#00d4ff]">click to browse</span>
            </div>
            <div className="text-[10px] text-gray-600 mt-1">
              Columns: state/region + value/count
            </div>
          </>
        )}
      </div>
      {lastUpload && (
        <div className="mt-2 text-[10px] text-green-400">
          ✓ Loaded: {lastUpload}
        </div>
      )}
    </div>
  );
}
