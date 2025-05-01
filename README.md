# Setup
- `make clear_history`

# Server setup
- cd server
- uv python install 3.11
- uv venv --python 3.11
- uv pip install -r requirements.txt
- project search and replace 'project_name' with newname

# Client setup
- cd client
- yarn
- rename project in src/shared/constants.ts
- yarn dev