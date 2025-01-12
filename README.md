# 🦊 Snippy Fox

Save and revisit interesting bits from the web with a click!

![Snippy Fox Demo](demo.gif)

## Features
- Save text snippets from any webpage via right-click
- Auto-saves source URL and favicon
- Quick search through saved snippets
- Dark mode UI
- Optional auto-close tabs after saving

## Installation
- [Chrome Web Store](your_store_link)
- Or load unpacked from source:
```bash
git clone https://github.com/muammar-yacoob/Snippy-Fox.git
chrome://extensions -> Developer mode -> Load unpacked
```

## Development
```bash
├── manifest.json       # Extension config
├── background.js      # Background service worker
├── popup.html/js      # Extension popup UI
├── noteManager.js     # Note handling logic
└── styles/           
    └── *.css         # UI styling
```

### Release Process
This project uses semantic-release for versioning:
- `fix:` commits trigger patch releases (bug fixes)
- `feat:` commits trigger minor releases (new features)
- `BREAKING CHANGE:` commits trigger major releases

The GitHub Action workflow automatically:
1. Determines version from commits
2. Updates manifest.json version
3. Creates GitHub release
4. Generates CHANGELOG.md

### Quick Start
1. Make changes
2. Commit using semantic messages
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve notification issue"
```
3. Push to main to trigger release

## License
[MIT](LICENSE)