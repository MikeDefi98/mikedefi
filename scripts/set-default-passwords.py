import requests
import hashlib
import json

# Firebase Realtime Database URL
DB_URL = "https://portal-22bc5-default-rtdb.firebaseio.com"

# Compute SHA-256 hash of "password123"
password_hash = hashlib.sha256("password123".encode()).hexdigest()
print(f"[v0] Password hash for 'password123': {password_hash}")

# Fetch all workers
print("[v0] Fetching all workers from Firebase...")
response = requests.get(f"{DB_URL}/workers.json")

if response.status_code != 200:
    print(f"[v0] Error fetching workers: {response.status_code}")
    print(f"[v0] Response: {response.text}")
    exit(1)

workers = response.json()
if not workers:
    print("[v0] No workers found in database")
    exit(0)

updated_count = 0
skipped_count = 0

# Update each worker
for worker_id, worker_data in workers.items():
    if worker_data is None:
        continue
    
    # Skip if already has a password hash
    if "passwordHash" in worker_data:
        print(f"[v0] Skipping {worker_id} - already has password")
        skipped_count += 1
        continue
    
    # Update worker with password hash and approved status
    update_payload = {
        "passwordHash": password_hash,
        "status": "approved"
    }
    
    update_response = requests.patch(
        f"{DB_URL}/workers/{worker_id}.json",
        json=update_payload
    )
    
    if update_response.status_code == 200:
        print(f"[v0] Updated {worker_id}: set password and status=approved")
        updated_count += 1
    else:
        print(f"[v0] Error updating {worker_id}: {update_response.status_code}")

print(f"\n[v0] Migration complete!")
print(f"[v0] Updated: {updated_count} workers")
print(f"[v0] Skipped: {skipped_count} workers (already had password)")
