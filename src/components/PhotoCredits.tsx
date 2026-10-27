import { useState } from 'react';
import records from '../data/photoCredits.json';
import { ModalFrame } from './ui';

type Attribution = { id: string; name: string; file?: string; title?: string; sourcePage?: string; license?: string; licenseUrl?: string; artist?: string; error?: string };
const credits = records as Attribution[];
export function PhotoCredits() {
  const [open, setOpen] = useState(false);
  return <><button className="footer-link-button" onClick={() => setOpen(true)}>Photo credits & licenses</button>{open && <ModalFrame title="Photographs, properly credited." eyebrow="IMAGE SOURCES & LICENSES" onClose={() => setOpen(false)} className="credits-modal">
    <p className="credits-intro">Destination photographs are served locally with their original Wikimedia Commons source, artist, and licence information. Open a source page for full reuse details.</p>
    <div className="credits-list">{credits.filter((credit) => credit.file).map((credit) => <article className="credit-entry" key={credit.id}><div><b>{credit.name}</b><span>{credit.artist ? `Photo by ${credit.artist.replace(/\s+/g, ' ').slice(0, 95)}` : 'Wikimedia Commons contributor'}</span></div><span className="license-chip">{credit.license}</span><a href={credit.sourcePage} target="_blank" rel="noreferrer">Source <span>↗</span></a></article>)}</div>
    <p className="credits-footnote">Where a licence requires attribution or share-alike, provide attribution when redistributing the corresponding image. Review the linked source before reuse.</p>
  </ModalFrame>}</>;
}
