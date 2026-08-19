# Character saves

The web character sheet writes GitHub-synced character saves here.

- `index.json` — list of synced characters and the latest saved character
- `latest.json` — full data for the most recently GitHub-synced character
- `<character-id>.json` — full data for each character

For AI resume, read `latest.json` when the user means the most recently saved character, or read `index.json` first when the character is named.

The older `../current.json` is the White Gold campaign save and is intentionally kept separate because it contains campaign/scene state that the character sheet does not manage.

Authentication tokens are never written to this directory or committed to the repository.
