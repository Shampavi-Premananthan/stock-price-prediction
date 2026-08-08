# Colab Backend Setup

Use this if your PC is low on disk space and you want to run only the backend in Google Colab, then use the frontend on your PC.

## What this does

- Runs the FastAPI backend in Colab
- Exposes it with a public tunnel URL
- Lets the local frontend point to that URL

## 1. Open a new Colab notebook

Use a Python notebook in Colab and run the cells below in order.

## 2. Install dependencies

```python
!git clone https://github.com/<your-user>/<your-repo>.git
%cd stock-price-prediction/backend
!pip install --upgrade pip
!pip install -r requirements.txt
!pip install pyngrok
```

If you already uploaded the project files into Colab, replace the `git clone` step with the folder that contains `backend/`.

## 3. Set your ngrok token

Create a free ngrok account and paste your auth token here.

```python
from pyngrok import ngrok
ngrok.set_auth_token("YOUR_NGROK_AUTH_TOKEN")
```

## 4. Start the FastAPI server

```python
import threading
import uvicorn

thread = threading.Thread(
    target=uvicorn.run,
    kwargs={
        "app": "app.main:app",
        "host": "0.0.0.0",
        "port": 8000,
        "reload": False,
    },
    daemon=True,
)
thread.start()
```

## 5. Create the public URL

```python
from pyngrok import ngrok
public_url = ngrok.connect(8000)
print(public_url)
```

Copy the URL that prints, for example `https://abcd-1234.ngrok-free.app`.

## 6. Use it from the frontend on your PC

Set this environment variable before running the frontend:

```bash
VITE_API_BASE_URL=https://abcd-1234.ngrok-free.app
```

Then start the frontend normally.

## 7. Verify the backend

Open these in the browser:

- `https://abcd-1234.ngrok-free.app/`
- `https://abcd-1234.ngrok-free.app/docs`

## Notes

- Colab runtimes reset, so the URL changes each session.
- You may need to allow the Colab backend URL in `CORS_ORIGINS` if you run the frontend from a different origin.
- The first install is large because TensorFlow is included in the backend dependencies.
