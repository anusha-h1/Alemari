import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { CalendarDays, Check, ImagePlus, MapPin, Star, Upload, X } from 'lucide-react';
import type { PhotoRef, TravelMemory } from '../types';
import { destinations } from '../data/destinations';
import { DestinationImage, LocalPhoto, ModalFrame, PrimaryButton } from './ui';

const memoryTags = ['Nature', 'Adventure', 'Food', 'Friends', 'Family', 'Solo travel'];
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 10;

export function MemoryForm({ initialDate, editing, onClose, onSave }: {
  initialDate: string; editing?: TravelMemory; onClose: () => void;
  onSave: (memory: TravelMemory, files: { id: string; file: File }[], removedIds: string[]) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(editing?.title ?? '');
  const [destinationId, setDestinationId] = useState(editing?.destinationId ?? 'hampi');
  const [visitDate, setVisitDate] = useState(editing?.visitDate ?? initialDate);
  const [caption, setCaption] = useState(editing?.caption ?? '');
  const [story, setStory] = useState(editing?.story ?? '');
  const [favouriteMoment, setFavouriteMoment] = useState(editing?.favouriteMoment ?? '');
  const [rating, setRating] = useState(editing?.rating ?? 0);
  const [companions, setCompanions] = useState(editing?.companions ?? '');
  const [tags, setTags] = useState<string[]>(editing?.tags ?? []);
  const [existingPhotos, setExistingPhotos] = useState<PhotoRef[]>(editing?.photos ?? []);
  const [newPhotos, setNewPhotos] = useState<{ ref: PhotoRef; file: File; preview: string }[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const photoCount = existingPhotos.length + newPhotos.length;
  const selectedDestination = useMemo(() => destinations.find((destination) => destination.id === destinationId) ?? destinations[0], [destinationId]);

  const objectUrls = useRef<string[]>([]);
  useEffect(() => () => { for (const url of objectUrls.current) URL.revokeObjectURL(url); }, []);
  const selectPhotos = (list: FileList | null) => {
    if (!list) return;
    setError('');
    const accepted: { ref: PhotoRef; file: File; preview: string }[] = [];
    for (const file of Array.from(list)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError(`${file.name}: choose a JPG, PNG, or WebP image.`); continue; }
      if (file.size > MAX_PHOTO_BYTES) { setError(`${file.name}: each photo must be no larger than 8 MB.`); continue; }
      if (photoCount + accepted.length >= MAX_PHOTOS) { setError(`A memory can contain up to ${MAX_PHOTOS} photographs.`); break; }
      accepted.push({ ref: { id: crypto.randomUUID(), name: file.name, mimeType: file.type, size: file.size }, file, preview: URL.createObjectURL(file) });
    }
    objectUrls.current.push(...accepted.map((item) => item.preview));
    setNewPhotos((current) => [...current, ...accepted]);
  };
  const removeNew = (id: string) => setNewPhotos((current) => {
    const item = current.find((photo) => photo.ref.id === id);
    if (item) { URL.revokeObjectURL(item.preview); objectUrls.current = objectUrls.current.filter((url) => url !== item.preview); }
    return current.filter((photo) => photo.ref.id !== id);
  });
  const removeExisting = (id: string) => { setExistingPhotos((current) => current.filter((photo) => photo.id !== id)); setRemovedIds((current) => [...current, id]); };
  const toggleTag = (tag: string) => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (!title.trim() || !visitDate || !destinationId) { setError('Add a title, destination, and visit date to save this memory.'); return; }
    if (photoCount > MAX_PHOTOS) { setError(`Keep up to ${MAX_PHOTOS} photos in one memory.`); return; }
    setSaving(true);
    const now = new Date().toISOString();
    const memory: TravelMemory = {
      id: editing?.id ?? crypto.randomUUID(), destinationId, title: title.trim(), visitDate,
      caption: caption.trim(), story: story.trim(), favouriteMoment: favouriteMoment.trim(),
      photos: [...existingPhotos, ...newPhotos.map((item) => item.ref)],
      ...(rating > 0 ? { rating } : {}), companions: companions.trim(), tags,
      createdAt: editing?.createdAt ?? now, updatedAt: now,
    };
    const ok = await onSave(memory, newPhotos.map((item) => ({ id: item.ref.id, file: item.file })), removedIds);
    setSaving(false);
    if (!ok) setError('This memory could not be saved on this browser. Please try again.');
    else onClose();
  };

  return <ModalFrame title={editing ? 'Edit this memory.' : 'Keep this journey close.'} eyebrow="YOUR TRAVEL JOURNAL" onClose={onClose} className="memory-form-modal">
    <form className="memory-form" onSubmit={handleSubmit}>
      <div className="memory-form-place"><DestinationImage className="memory-place-photo" src={selectedDestination.image} alt={`${selectedDestination.name} destination`} /><div><span className="eyebrow">A MEMORY FROM</span><strong>{selectedDestination.name}</strong><small>{selectedDestination.district}, Karnataka</small></div><MapPin size={17} /></div>
      <div className="form-grid two">
        <label className="field field-span-two">Memory title<input autoFocus value={title} maxLength={90} onChange={(event) => setTitle(event.target.value)} placeholder="A morning we still talk about" /></label>
        <label className="field">Destination<select value={destinationId} onChange={(event) => setDestinationId(event.target.value)}>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name} · {destination.district}</option>)}</select></label>
        <label className="field">Date visited<span className="input-with-icon"><CalendarDays size={16} /><input type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} /></span></label>
        <label className="field field-span-two">A short caption<input value={caption} maxLength={180} onChange={(event) => setCaption(event.target.value)} placeholder="The rain arrived just as the trail opened up…" /></label>
        <label className="field field-span-two">The story<textarea value={story} rows={4} onChange={(event) => setStory(event.target.value)} placeholder="What did you notice, taste, or not want to forget?" /></label>
        <label className="field field-span-two">Favourite moment<input value={favouriteMoment} maxLength={220} onChange={(event) => setFavouriteMoment(event.target.value)} placeholder="That last light falling over the stone ruins…" /></label>
        <label className="field">Travel companions<input value={companions} maxLength={160} onChange={(event) => setCompanions(event.target.value)} placeholder="The names you'll remember" /></label>
        <fieldset className="field rating-field"><legend>How did it feel? <span className="field-optional">Optional</span></legend><div className="rating-stars" aria-label={`Rating ${rating} out of 5`}>{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(rating === value ? 0 : value)} aria-label={`${value} stars`}><Star size={19} fill={rating >= value ? 'currentColor' : 'none'} /></button>)}</div></fieldset>
      </div>
      <div className="field-tag-block"><span className="field-label">Add a few tags <span className="field-optional">Optional</span></span><div className="tag-picker">{memoryTags.map((tag) => <button type="button" key={tag} className={tags.includes(tag) ? 'tag-selected' : ''} onClick={() => toggleTag(tag)} aria-pressed={tags.includes(tag)}>{tags.includes(tag) && <Check size={12} />}{tag}</button>)}</div></div>
      <div className="upload-section"><div><strong>Photographs</strong><small>Your photos stay in this browser. Add up to {MAX_PHOTOS}; JPG, PNG or WebP, 8 MB each.</small></div>
        <label className="upload-trigger"><Upload size={16} /> Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { selectPhotos(event.target.files); event.target.value = ''; }} /></label>
      </div>
      {photoCount > 0 ? <div className="photo-preview-grid">
        {existingPhotos.map((photo) => <div key={photo.id} className="photo-preview"><LocalPhoto id={photo.id} alt={photo.name} /><button type="button" onClick={() => removeExisting(photo.id)} aria-label={`Remove ${photo.name}`}><X size={14} /></button><small>{photo.name}</small></div>)}
        {newPhotos.map((photo) => <div key={photo.ref.id} className="photo-preview"><img src={photo.preview} alt={photo.ref.name} /><button type="button" onClick={() => removeNew(photo.ref.id)} aria-label={`Remove ${photo.ref.name}`}><X size={14} /></button><small>{photo.ref.name}</small></div>)}
      </div> : <label className="upload-dropzone"><ImagePlus size={25} /><strong>Photographs welcome</strong><span>Preview your memories before saving them here.</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { selectPhotos(event.target.files); event.target.value = ''; }} /></label>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="local-storage-note"><Check size={14} /> Photos and stories are saved only in this browser. They are not uploaded or synced to another device.</p>
      <div className="form-submit-row"><span>{photoCount} / {MAX_PHOTOS} photos</span><PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving locally…' : editing ? 'Save changes' : 'Save this memory'}</PrimaryButton></div>
    </form>
  </ModalFrame>;
}
