import secrets
import os

def generate_secret_key():
    """Generate a 24-byte (192-bit) URL-safe secret key."""
    return secrets.token_urlsafe(24)

def update_env_file(secret_key):
    """Update the .env file with the new secret key."""
    env_path = '.env'
    if not os.path.exists(env_path):
        print(f"No .env file found at {env_path}. Please ensure the file exists.")
        return

    # Read the current .env content
    with open(env_path, 'r') as file:
        lines = file.readlines()

    # Update the secret key in the .env content
    with open(env_path, 'w') as file:
        for line in lines:
            if line.startswith('the_secret_key='):
                file.write(f"the_secret_key='{secret_key}'\n")
            else:
                file.write(line)

    print("Updated the .env file with the new secret key.")

if __name__ == "__main__":
    new_secret_key = generate_secret_key()
    print(f"Generated Secret Key: {new_secret_key}")
    update_env_file(new_secret_key)