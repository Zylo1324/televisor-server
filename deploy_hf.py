import sys
import os
from huggingface_hub import HfApi

def deploy():
    if len(sys.argv) < 2:
        print("ERROR: Token faltante")
        sys.exit(1)

    token = sys.argv[1].strip()
    api = HfApi(token=token)

    try:
        user = api.whoami()
        username = user["name"]
        print(f"[1/3] Autenticado en Hugging Face como: {username}")
    except Exception as e:
        print(f"ERROR: Token inválido: {e}")
        sys.exit(1)

    repo_id = f"{username}/televisor-server"
    print(f"[2/3] Creando/configurando Space {repo_id} (Docker)...")
    try:
        api.create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            exist_ok=True,
            private=False
        )
    except Exception as e:
        print(f"Nota en create_repo: {e}")

    print(f"[3/3] Subiendo código fuente y Dockerfile...")
    api.upload_folder(
        folder_path="/Users/jairtarrillo/Documents/televisor-server",
        repo_id=repo_id,
        repo_type="space",
        ignore_patterns=["target/**", ".git/**"]
    )

    clean_username = username.lower().replace("_", "-")
    public_url = f"https://{clean_username}-televisor-server.hf.space"
    print("\n=== DESPLIEGUE INICIADO EXITOSAMENTE ===")
    print(f"Space en Hugging Face: https://huggingface.co/spaces/{repo_id}")
    print(f"URL Pública del Servidor: {public_url}")

if __name__ == "__main__":
    deploy()
