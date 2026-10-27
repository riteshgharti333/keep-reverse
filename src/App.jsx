import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "little-notes.v1";
const LABEL_STORAGE_KEY = "little-notes.labels.v1";

const COLORS = [
  { name: "Default", value: "#ffffff" },
  { name: "Sage", value: "#e5f3e7" },
  { name: "Lavender", value: "#eee7f8" },
  { name: "Peach", value: "#ffeadc" },
  { name: "Butter", value: "#fff4c9" },
  { name: "Rose", value: "#fbe4e6" },
  { name: "Sky", value: "#dff1f7" },
];

const NAV_ITEMS = [
  { id: "notes", label: "Notes", icon: "lightbulb" },
  { id: "reminders", label: "Reminders", icon: "bell" },
  { id: "archive", label: "Archive", icon: "archive" },
  { id: "trash", label: "Trash", icon: "trash" },
];

function Icon({ name, size = 20, className = "" }) {
  const paths = {
    lightbulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.1 14.5A7 7 0 1 0 8.9 14.5c.7.7 1.1 1.4 1.1 2.5h4c0-1.1.4-1.8 1.1-2.5Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    list: <><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><path d="M4 6h.01" /><path d="M4 12h.01" /><path d="M4 18h.01" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    archive: <><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v12h14V8" /><path d="M10 12h4" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5" /><path d="M14 11v5" /></>,
    pin: <><path d="m16 3 5 5-4 1-4 4-1 4-2-2-6 6-1-1 6-6-2-2 4-1 4-4z" /></>,
    palette: <><circle cx="12" cy="12" r="9" /><path d="M8 10h.01M12 7h.01M16 10h.01M9 15h.01" /><path d="M12 21a3 3 0 0 1-3-3c0-1.7 1.3-3 3-3h1a2 2 0 0 0 0-4" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    restore: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    rows: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
    label: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] ?? paths.more}
    </svg>
  );
}

function readCustomLabels() {
  try {
    const stored = JSON.parse(localStorage.getItem(LABEL_STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((label) => typeof label === "string") : [];
  } catch {
    return [];
  }
}

function readNotes() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function makeNote(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    title: "",
    body: "",
    items: [],
    labels: [],
    color: COLORS[0].value,
    pinned: false,
    archived: false,
    trashed: false,
    reminderAt: "",
    updatedAt: Date.now(),
    ...overrides,
  };
}

function App() {
  const [notes, setNotes] = useState(readNotes);
  const [customLabels, setCustomLabels] = useState(readCustomLabels);
  const [section, setSection] = useState("notes");
  const [activeLabel, setActiveLabel] = useState("");
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState(null);
  const [editing, setEditing] = useState(null);
  const [listView, setListView] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(customLabels));
  }, [customLabels]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const labels = useMemo(
    () => [...new Set([...customLabels, ...notes.filter((note) => !note.trashed).flatMap((note) => note.labels)])].sort(),
    [customLabels, notes],
  );

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notes
      .filter((note) => {
        if (section === "trash") return note.trashed;
        if (note.trashed) return false;
        if (section === "archive" && !note.archived) return false;
        if (section === "reminders" && !note.reminderAt) return false;
        if (section === "notes" && note.archived) return false;
        if (section === "label" && !note.labels.includes(activeLabel)) return false;
        if (!normalizedQuery) return true;
        const searchable = [
          note.title,
          note.body,
          ...note.items.map((item) => item.text),
          ...note.labels,
        ].join(" ").toLowerCase();
        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, section, activeLabel, query]);

  const heading = section === "label" ? activeLabel : NAV_ITEMS.find((item) => item.id === section)?.label ?? "Notes";

  function updateNote(id, changes) {
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, ...changes, updatedAt: Date.now() } : note)),
    );
    setEditing((current) => current?.id === id ? { ...current, ...changes } : current);
  }

  function addNote(note) {
    setNotes((current) => [makeNote(note), ...current]);
    setComposer(null);
    setToast("Note saved");
  }

  function removeNote(note) {
    if (section === "trash") {
      setNotes((current) => current.filter((item) => item.id !== note.id));
      setToast("Note deleted permanently");
    } else {
      updateNote(note.id, { trashed: true, archived: false });
      setToast("Moved to trash");
    }
  }

  function archiveNote(note) {
    updateNote(note.id, { archived: !note.archived, pinned: false });
    setToast(note.archived ? "Note restored" : "Note archived");
  }

  function selectSection(id) {
    setSection(id);
    setActiveLabel("");
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Toggle menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Icon name="menu" />
        </button>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); selectSection("notes"); }}>
          <span className="brand-mark"><Icon name="lightbulb" size={23} /></span>
          <span className="brand-name">little<span>notes</span></span>
        </a>
        <label className="search-box">
          <Icon name="search" size={21} />
          <input
            type="search"
            placeholder="Search your notes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search notes"
          />
          {query && <button className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}><Icon name="close" size={17} /></button>}
        </label>
        <div className="topbar-actions">
          <button className="icon-button view-toggle" aria-label={listView ? "Show grid" : "Show list"} onClick={() => setListView(!listView)}>
            <Icon name={listView ? "grid" : "rows"} />
          </button>
          <div className="avatar" title="Your notes stay on this device">Y</div>
        </div>
      </header>

      <div className="layout">
        {sidebarOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
        <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <nav className="primary-nav" aria-label="Main navigation">
            {NAV_ITEMS.slice(0, 2).map((item) => (
              <button key={item.id} className={`nav-item ${section === item.id ? "nav-active" : ""}`} onClick={() => selectSection(item.id)}>
                <span className="nav-icon"><Icon name={item.icon} size={19} /></span>{item.label}
                {item.id === "reminders" && notes.filter((note) => note.reminderAt && !note.trashed).length > 0 && (
                  <span className="nav-count">{notes.filter((note) => note.reminderAt && !note.trashed).length}</span>
                )}
              </button>
            ))}

            <div className="sidebar-divider" />
            <div className="section-caption">
              <span>YOUR LABELS</span>
              <button className="tiny-icon-button" aria-label="Create label" title="Create label" onClick={() => {
                const name = window.prompt("Name your label");
                if (name?.trim()) {
                  const normalizedName = name.trim();
                  setCustomLabels((current) => current.includes(normalizedName) ? current : [...current, normalizedName]);
                  setToast(`Label “${normalizedName}” created`);
                }
              }}><Icon name="plus" size={16} /></button>
            </div>
            {labels.length === 0 ? (
              <p className="no-labels">Labels make notes easier to find.</p>
            ) : labels.map((label) => (
              <button key={label} className={`nav-item label-nav ${section === "label" && activeLabel === label ? "nav-active" : ""}`} onClick={() => { setSection("label"); setActiveLabel(label); setSidebarOpen(false); }}>
                <span className="nav-icon"><Icon name="label" size={18} /></span><span className="label-text">{label}</span>
              </button>
            ))}
            <div className="sidebar-divider lower-divider" />
            {NAV_ITEMS.slice(2).map((item) => (
              <button key={item.id} className={`nav-item ${section === item.id ? "nav-active" : ""}`} onClick={() => selectSection(item.id)}>
                <span className="nav-icon"><Icon name={item.icon} size={19} /></span>{item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <span className="sync-dot" />
            <span>Saved on this device</span>
          </div>
        </aside>

        <main className="main-content">
          <div className="content-inner">
            {section === "notes" && !query && (
              <NoteComposer
                onSave={addNote}
                onCreateList={() => setComposer(makeNote({ items: [{ id: crypto.randomUUID(), text: "", checked: false }] }))}
              />
            )}

            <div className={`notes-heading ${section === "notes" && !query ? "heading-after-composer" : ""}`}>
              <div>
                <h1>{query ? "Search results" : heading}</h1>
                <p>{query ? `${visibleNotes.length} ${visibleNotes.length === 1 ? "note" : "notes"} found` : section === "notes" ? "A little space for everything on your mind." : section === "trash" ? "Notes in trash are deleted after 7 days." : section === "archive" ? "Tucked away, but never out of reach." : section === "reminders" ? "Notes with a date to remember." : `Notes filed under ${activeLabel}.`}</p>
              </div>
              {visibleNotes.length > 0 && <span className="note-count">{visibleNotes.length} {visibleNotes.length === 1 ? "note" : "notes"}</span>}
            </div>

            {visibleNotes.length > 0 ? (
              <div className={`notes-grid ${listView ? "notes-list" : ""}`}>
                {visibleNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    inTrash={section === "trash"}
                    onOpen={() => setEditing(note)}
                    onUpdate={(changes) => updateNote(note.id, changes)}
                    onArchive={() => archiveNote(note)}
                    onDelete={() => removeNote(note)}
                    onRestore={() => updateNote(note.id, { trashed: false, archived: false })}
                  />
                ))}
              </div>
            ) : (
              <EmptyState section={section} query={query} onCreate={() => setComposer({ type: "note", title: "", body: "", items: [], labels: [], color: COLORS[0].value, reminderAt: "" })} />
            )}
          </div>
        </main>
      </div>

      {composer && <NoteEditor note={composer} mode="new" onClose={() => setComposer(null)} onSave={addNote} />}
      {editing && (
        <NoteEditor
          key={editing.id}
          note={editing}
          mode="edit"
          inTrash={section === "trash"}
          onClose={() => setEditing(null)}
          onSave={(changes) => { updateNote(editing.id, changes); setEditing(null); setToast("Changes saved"); }}
          onDelete={() => { removeNote(editing); setEditing(null); }}
          onArchive={() => { archiveNote(editing); setEditing(null); }}
          onRestore={() => { updateNote(editing.id, { trashed: false, archived: false }); setEditing(null); }}
        />
      )}
      {toast && <div className="toast"><Icon name="check" size={17} />{toast}</div>}
    </div>
  );
}

function NoteComposer({ onSave, onCreateList }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function submit() {
    if (!title.trim() && !body.trim()) return;
    onSave({ title: title.trim(), body: body.trim(), items: [], labels: [], color: COLORS[0].value });
    setTitle("");
    setBody("");
    setExpanded(false);
  }

  return (
    <div className={`composer-wrap ${expanded ? "composer-expanded" : ""}`}>
      {!expanded ? (
        <div className="composer-collapsed">
          <button className="composer-placeholder" onClick={() => setExpanded(true)}>Take a note...</button>
          <div className="composer-shortcuts">
            <button title="New list" aria-label="New list" onClick={onCreateList}><Icon name="list" /></button>
            <button title="New text note" aria-label="New text note" onClick={() => setExpanded(true)}><Icon name="edit" /></button>
          </div>
        </div>
      ) : (
        <div className="composer-open">
          <input autoFocus className="composer-title" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <textarea placeholder="Take a note..." value={body} onChange={(event) => setBody(event.target.value)} rows={2} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submit(); }} />
          <div className="composer-footer">
            <button className="text-button" onClick={() => { setExpanded(false); setTitle(""); setBody(""); }}>Close</button>
            <button className="primary-button" onClick={submit}>Save note</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, inTrash, onOpen, onUpdate, onArchive, onDelete, onRestore }) {
  const [showColors, setShowColors] = useState(false);

  return (
    <article
      className={`note-card ${note.color === "#ffffff" ? "note-default" : ""} ${note.pinned && !inTrash ? "note-pinned" : ""}`}
      style={{ "--note-color": note.color }}
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onOpen(); }}
      aria-label={note.title || note.body || "Untitled note"}
    >
      {note.pinned && !inTrash && <span className="pinned-indicator"><Icon name="pin" size={14} /></span>}
      {note.title && <h2>{note.title}</h2>}
      {note.body && <p className="note-body">{note.body}</p>}
      {note.items.length > 0 && (
        <div className="card-checklist">
          {note.items.filter((item) => !item.checked).slice(0, 4).map((item) => (
            <div className="card-list-item" key={item.id} onClick={(event) => event.stopPropagation()}>
              <button className={`checkbox ${item.checked ? "checkbox-checked" : ""}`} aria-label={item.checked ? "Mark incomplete" : "Complete item"} onClick={() => onUpdate({ items: note.items.map((row) => row.id === item.id ? { ...row, checked: !row.checked } : row) })}>
                {item.checked && <Icon name="check" size={13} />}
              </button>
              <span>{item.text || "List item"}</span>
            </div>
          ))}
          {note.items.filter((item) => item.checked).length > 0 && (
            <div className="checked-summary"><Icon name="check" size={13} />{note.items.filter((item) => item.checked).length} completed</div>
          )}
          {note.items.filter((item) => !item.checked).length > 4 && <span className="more-items">+{note.items.filter((item) => !item.checked).length - 4} more</span>}
        </div>
      )}
      {note.reminderAt && <span className="reminder-chip"><Icon name="bell" size={13} />{formatReminder(note.reminderAt)}</span>}
      {note.labels.length > 0 && <div className="note-labels">{note.labels.map((label) => <span className="label-chip" key={label}>{label}</span>)}</div>}
      <div className="note-card-actions" onClick={(event) => event.stopPropagation()}>
        {inTrash ? (
          <>
            <button className="card-action" aria-label="Restore note" title="Restore" onClick={onRestore}><Icon name="restore" size={17} /></button>
            <button className="card-action" aria-label="Delete forever" title="Delete forever" onClick={onDelete}><Icon name="trash" size={17} /></button>
          </>
        ) : (
          <>
            <div className="color-control">
              <button className="card-action" aria-label="Change color" title="Change color" onClick={() => setShowColors(!showColors)}><Icon name="palette" size={17} /></button>
              {showColors && <ColorPicker selected={note.color} onSelect={(color) => { onUpdate({ color }); setShowColors(false); }} />}
            </div>
            <button className={`card-action ${note.pinned ? "action-selected" : ""}`} aria-label={note.pinned ? "Unpin note" : "Pin note"} title={note.pinned ? "Unpin" : "Pin"} onClick={() => onUpdate({ pinned: !note.pinned })}><Icon name="pin" size={17} /></button>
            <button className="card-action" aria-label={note.archived ? "Unarchive note" : "Archive note"} title={note.archived ? "Unarchive" : "Archive"} onClick={onArchive}><Icon name="archive" size={17} /></button>
            <button className="card-action" aria-label="Move to trash" title="Move to trash" onClick={onDelete}><Icon name="trash" size={17} /></button>
          </>
        )}
      </div>
    </article>
  );
}

function ColorPicker({ selected, onSelect }) {
  return (
    <div className="color-picker" role="group" aria-label="Note color">
      {COLORS.map((color) => (
        <button
          key={color.value}
          className={`color-swatch ${selected === color.value ? "swatch-selected" : ""}`}
          style={{ "--swatch-color": color.value }}
          title={color.name}
          aria-label={color.name}
          onClick={onSelect.bind(null, color.value)}
        />
      ))}
    </div>
  );
}

function NoteEditor({ note, mode, inTrash = false, onClose, onSave, onDelete, onArchive, onRestore }) {
  const [title, setTitle] = useState(note.title ?? "");
  const [body, setBody] = useState(note.body ?? "");
  const [items, setItems] = useState(note.items ?? []);
  const [labels, setLabels] = useState(note.labels ?? []);
  const [labelInput, setLabelInput] = useState("");
  const [color, setColor] = useState(note.color ?? COLORS[0].value);
  const [reminderAt, setReminderAt] = useState(note.reminderAt ?? "");

  function save() {
    const cleanItems = items.filter((item) => item.text.trim());
    if (mode === "new" && !title.trim() && !body.trim() && cleanItems.length === 0) return;
    onSave({ title: title.trim(), body: body.trim(), items: cleanItems, labels, color, reminderAt });
  }

  function addItem() {
    setItems((current) => [...current, { id: crypto.randomUUID(), text: "", checked: false }]);
  }

  function addLabel(event) {
    event.preventDefault();
    const next = labelInput.trim();
    if (next && !labels.includes(next)) setLabels((current) => [...current, next]);
    setLabelInput("");
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { if (mode === "new") onClose(); else save(); } }}>
      <section className="note-editor" style={{ "--note-color": color }} role="dialog" aria-modal="true" aria-label={mode === "new" ? "Create note" : "Edit note"} onKeyDown={(event) => { if (event.key === "Escape") onClose(); if ((event.ctrlKey || event.metaKey) && event.key === "Enter") save(); }}>
        <input className="editor-title" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
        {items.length > 0 && (
          <div className="editor-checklist">
            {items.map((item) => (
              <div className="editor-list-row" key={item.id}>
                <button className={`checkbox ${item.checked ? "checkbox-checked" : ""}`} aria-label={item.checked ? "Mark incomplete" : "Complete item"} onClick={() => setItems((current) => current.map((row) => row.id === item.id ? { ...row, checked: !row.checked } : row))}>
                  {item.checked && <Icon name="check" size={13} />}
                </button>
                <input className={item.checked ? "item-complete" : ""} placeholder="List item" value={item.text} onChange={(event) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, text: event.target.value } : row))} />
                <button className="tiny-icon-button remove-item" aria-label="Remove item" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))}><Icon name="close" size={16} /></button>
              </div>
            ))}
            <button className="add-list-item" onClick={addItem}><Icon name="plus" size={16} /> Add list item</button>
          </div>
        )}
        {items.length === 0 ? (
          <textarea className="editor-body" placeholder="Take a note..." rows={5} value={body} onChange={(event) => setBody(event.target.value)} />
        ) : (
          <textarea className="editor-body checklist-extra" placeholder="Add a note..." rows={2} value={body} onChange={(event) => setBody(event.target.value)} />
        )}

        <div className="editor-options">
          <div className="editor-option-row">
            <Icon name="bell" size={16} />
            <input aria-label="Reminder date and time" type="datetime-local" value={reminderAt} onChange={(event) => setReminderAt(event.target.value)} />
            {reminderAt && <button className="tiny-icon-button" aria-label="Clear reminder" onClick={() => setReminderAt("")}><Icon name="close" size={15} /></button>}
          </div>
          <form className="label-entry" onSubmit={addLabel}>
            <Icon name="label" size={16} />
            {labels.map((label) => <span className="label-chip" key={label}>{label}<button type="button" aria-label={`Remove ${label}`} onClick={() => setLabels((current) => current.filter((item) => item !== label))}>×</button></span>)}
            <input aria-label="Add label" placeholder={labels.length ? "Add label..." : "Add a label..."} value={labelInput} onChange={(event) => setLabelInput(event.target.value)} />
          </form>
          <div className="editor-option-row editor-colors"><Icon name="palette" size={16} /><ColorPicker selected={color} onSelect={setColor} /></div>
        </div>

        <footer className="editor-footer">
          <div className="editor-footer-left">
            {mode === "edit" && (inTrash ? (
              <>
                <button className="card-action visible-action" title="Restore" aria-label="Restore note" onClick={onRestore}><Icon name="restore" size={18} /></button>
                <button className="card-action visible-action" title="Delete forever" aria-label="Delete forever" onClick={onDelete}><Icon name="trash" size={18} /></button>
              </>
            ) : (
              <>
                <button className="card-action visible-action" title={note.pinned ? "Unpin" : "Pin"} aria-label={note.pinned ? "Unpin note" : "Pin note"} onClick={() => onSave({ title: title.trim(), body: body.trim(), items, labels, color, reminderAt, pinned: !note.pinned })}><Icon name="pin" size={18} /></button>
                <button className="card-action visible-action" title={note.archived ? "Unarchive" : "Archive"} aria-label={note.archived ? "Unarchive note" : "Archive note"} onClick={onArchive}><Icon name="archive" size={18} /></button>
                <button className="card-action visible-action" title="Move to trash" aria-label="Move to trash" onClick={onDelete}><Icon name="trash" size={18} /></button>
              </>
            ))}
          </div>
          <span className="editor-hint">Saved on this device</span>
          <button className="primary-button editor-done" onClick={save}>{mode === "new" ? "Create note" : "Done"}</button>
        </footer>
      </section>
    </div>
  );
}

function EmptyState({ section, query, onCreate }) {
  const empty = query
    ? { icon: "search", title: "No notes found", detail: "Try a different search, or make a new note." }
    : section === "archive"
      ? { icon: "archive", title: "Your archive is clear", detail: "Archived notes will be waiting here when you need them." }
      : section === "trash"
        ? { icon: "trash", title: "Nothing in the trash", detail: "Notes you remove will show up here." }
        : section === "reminders"
          ? { icon: "bell", title: "Nothing to remember yet", detail: "Add a reminder to any note and it’ll show up here." }
          : section === "label"
            ? { icon: "label", title: "No notes with this label", detail: "Add this label to a note to find it here." }
            : { icon: "lightbulb", title: "Your mind, uncluttered", detail: "Start with a thought, a list, or anything you want to remember." };

  return (
    <div className="empty-state">
      <div className="empty-illustration"><Icon name={empty.icon} size={31} /></div>
      <h2>{empty.title}</h2>
      <p>{empty.detail}</p>
      {section === "notes" && !query && <button className="empty-create" onClick={onCreate}><Icon name="plus" size={17} />Create your first note</button>}
    </div>
  );
}

function formatReminder(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Reminder";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export default App;
