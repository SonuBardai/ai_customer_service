# Setup
- `make clear_history`

# Server setup
- cd server
- uv python install 3.11
- uv venv --python 3.11
- uv pip install -r requirements.txt

# Client setup
- cd client
- yarn
- rename project in src/shared/constants.ts
- yarn dev