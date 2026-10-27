# Little Notes

Little Notes is a lightweight, local-first notes app for capturing thoughts and
keeping them organized. Create text notes and checklists, then find them with
search, labels, reminders, colors, and archive tools.

## Features

- Create and edit text notes and checklists
- Search note titles, text, checklist items, and labels
- Organize notes with labels, color choices, and pinning
- Add a date and time reminder to a note
- Archive notes or move them to the trash; restore notes or delete them
  permanently from the trash
- Switch between grid and list layouts
- Responsive interface for desktop and mobile
- Save notes and custom labels in this browser on this device

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

Install dependencies and start the Vite development server:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

To build and preview the production version:

```powershell
npm run build
npm run preview
```

## Using the app

- Select **Take a note** to create a text note, or use the list shortcut to
  start a checklist.
- Open a note to edit its content, checklist, labels, color, or reminder.
- Use the search field to find text across notes, including checklist items
  and labels.
- Pin important notes, archive notes you want to keep out of the main view,
  or move unwanted notes to the trash.
- In the trash, restore a note or delete it permanently.
- Use the sidebar to browse reminders, archived notes, trashed notes, and
  notes grouped by label.
- Use the grid/list control to change how notes are displayed.

In the note editor, **Ctrl+Enter** (or **Command+Enter** on macOS) saves the
note. **Escape** closes the editor.

## Data and privacy

Notes and custom labels are stored in this browser's `localStorage`. They are
not sent to a server, and this project does not provide accounts, cloud
sync, or collaboration. Data is specific to the browser and device; clearing
the browser's site data can remove it. Reminder dates are saved with notes and
shown in the app, but the app does not send system notifications.

## Project structure

```text
src/
  App.jsx       Notes app interface and behavior
  main.jsx     React entry point
  styles.css   Layout and visual styles
index.html     Vite HTML entry point
vite.config.js Vite and React plugin configuration
```

## Built with

- React 19
- Vite 6
