import { useEffect, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

interface CandidatePhotoFieldProps {
  currentPhoto?: string | null;
  selectedPhoto: File | null;
  removePhoto: boolean;
  onSelect: (file: File | null) => void;
  onRemove: (value: boolean) => void;
}

export function CandidatePhotoField({
  currentPhoto,
  selectedPhoto,
  removePhoto,
  onSelect,
  onRemove,
}: CandidatePhotoFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!selectedPhoto) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(selectedPhoto);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedPhoto]);

  const url = preview ?? (!removePhoto ? currentPhoto : null);
  const select = (file: File | null) => {
    setError('');
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Utilize JPEG, PNG ou WebP.');
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter até 2 MB.');
      return;
    }
    onSelect(file);
    if (file) onRemove(false);
  };

  return (
    <div className="candidate-photo-field">
      <div className="candidate-photo-preview">
        {url ? <img src={url} alt="Prévia da foto do candidato" /> : <ImagePlus size={35}/>}
      </div>
      <div className="candidate-photo-description">
        <strong>Foto do candidato</strong>
        <p>Adicione um retrato vertical. A imagem aparecerá no cadastro e na urna durante a votação.</p>
        <div className="candidate-photo-actions">
          <label className="candidate-photo-upload">
            <ImagePlus size={16}/> Selecionar foto
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => select(event.target.files?.[0] ?? null)} />
          </label>
          {(url || currentPhoto) && <button type="button" className="candidate-photo-remove" onClick={() => { onSelect(null); onRemove(true); }}><Trash2 size={16}/> Remover</button>}
        </div>
        {error ? <small className="field-error">{error}</small> : <small>JPEG, PNG ou WebP · máximo 2 MB</small>}
      </div>
    </div>
  );
}
