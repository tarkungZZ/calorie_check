import paramiko
import json
import io

HOST = "157.230.244.241"
USER = "root"
PASSWORD = "0LVklm1dXi1WMEhv"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

stdin, stdout, stderr = client.exec_command("cd /var/www/calorie-check && git rev-parse --short HEAD")
git_hash = stdout.read().decode().strip()

from datetime import datetime, timezone
build_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

version_data = json.dumps({"version": git_hash, "buildTime": build_time}, indent=2)
print(f"Writing version.json: {version_data}")

sftp = client.open_sftp()
with sftp.open("/var/www/calorie-check/version.json", "w") as f:
    f.write(version_data)
sftp.close()

stdin, stdout, stderr = client.exec_command("cat /var/www/calorie-check/version.json")
print(f"Verified: {stdout.read().decode().strip()}")

client.close()
