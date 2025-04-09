import subprocess
subprocess.run(["alembic", "upgrade", "head"], check=True)

import uvicorn
uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
