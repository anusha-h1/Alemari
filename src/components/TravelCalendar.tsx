import { useMemo, useState } from 'react';
import { addDays, addMonths, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { TravelMemory } from '../types';
import { destinationById } from '../data/destinations';
import { DestinationImage, LocalPhoto } from './ui';

export function TravelCalendar({ memories, onAdd, onOpen }: { memories: TravelMemory[]; onAdd: (date: string) => void; onOpen: (memory: TravelMemory) => void }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [month]);
  const memoriesByDay = useMemo(() => {
    const result = new Map<string, TravelMemory[]>();
    memories.forEach((memory) => result.set(memory.visitDate, [...(result.get(memory.visitDate) ?? []), memory]));
    return result;
  }, [memories]);
  const selectedMemories = memoriesByDay.get(selectedDate) ?? [];
  return <div className="calendar-layout">
    <div className="calendar-card">
      <div className="calendar-toolbar"><div><span className="eyebrow">YOUR JOURNEYS, BY DAY</span><h3>{format(month, 'MMMM yyyy')}</h3></div><div className="calendar-controls"><button onClick={() => setMonth((value) => addMonths(value, -12))} aria-label="Previous year"><ArrowLeft size={14} /><span>Year</span></button><button onClick={() => setMonth((value) => addMonths(value, -1))} aria-label="Previous month"><ChevronLeft size={17} /></button><button className="calendar-today" onClick={() => { const today = new Date(); setMonth(startOfMonth(today)); setSelectedDate(format(today, 'yyyy-MM-dd')); }}>Today</button><button onClick={() => setMonth((value) => addMonths(value, 1))} aria-label="Next month"><ChevronRight size={17} /></button><button onClick={() => setMonth((value) => addMonths(value, 12))} aria-label="Next year"><ArrowRight size={14} /><span>Year</span></button></div></div>
      <div className="calendar-grid calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => <span key={label}>{label}</span>)}</div>
      <div className="calendar-grid calendar-days">{calendarDays.map((date) => {
        const key = format(date, 'yyyy-MM-dd'); const events = memoriesByDay.get(key) ?? [];
        return <button key={key} className={`calendar-day ${isSameMonth(date, month) ? '' : 'calendar-day-muted'} ${selectedDate === key ? 'calendar-day-selected' : ''} ${isToday(date) ? 'calendar-day-today' : ''} ${events.length ? 'calendar-day-event' : ''}`} onClick={() => { if (events.length) setSelectedDate(key); else onAdd(key); }} aria-label={`${format(date, 'd MMMM yyyy')}${events.length ? `, ${events.length} ${events.length === 1 ? 'memory' : 'memories'}` : ''}`} aria-pressed={selectedDate === key}>
          <span className="calendar-day-number">{format(date, 'd')}</span>
          {events.length > 0 && <><span className="calendar-memory-dots">{events.slice(0, 3).map((memory) => <i key={memory.id} />)}</span>{events[0].photos[0] && <LocalPhoto id={events[0].photos[0].id} alt="" className="calendar-thumbnail" />}{events.length > 1 && <small>+{events.length - 1}</small>}</>}
        </button>;
      })}</div>
      <div className="calendar-legend"><span><i className="legend-dot legend-memory" /> A day remembered</span><button className="text-action" onClick={() => onAdd(selectedDate)}><Plus size={15} /> Add a memory</button></div>
    </div>
    <aside className="calendar-day-panel">
      <span className="eyebrow"><CalendarDays size={13} /> SELECTED DAY</span>
      <h3>{format(new Date(`${selectedDate}T12:00:00`), 'EEEE, MMMM d')}</h3><p className="calendar-panel-year">{format(new Date(`${selectedDate}T12:00:00`), 'yyyy')}</p>
      {selectedMemories.length ? <><span className="calendar-count">{selectedMemories.length} {selectedMemories.length === 1 ? 'memory' : 'memories'} saved</span><div className="calendar-event-list">{selectedMemories.map((memory) => {
        const destination = destinationById(memory.destinationId);
        return <button key={memory.id} className="calendar-event" onClick={() => onOpen(memory)}>
          {memory.photos[0] ? <LocalPhoto id={memory.photos[0].id} alt={memory.title} /> : <DestinationImage src={destination?.image} alt={destination?.name ?? 'Karnataka destination'} />}
          <span><b>{memory.title}</b><small>{destination?.name ?? 'Karnataka journey'}</small></span><ArrowRight size={15} />
        </button>;
      })}</div></> : <div className="calendar-empty"><div className="calendar-empty-icon"><CalendarDays size={22} /></div><p>Nothing tucked away on this date. Yet.</p><button className="text-action" onClick={() => onAdd(selectedDate)}><Plus size={15} /> Write the first memory</button></div>}
    </aside>
  </div>;
}
