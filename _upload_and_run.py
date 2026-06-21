import paramiko
import sys

HOST = "157.230.244.241"
USER = "root"
PASSWORD = "0LVklm1dXi1WMEhv"

def upload_and_run(local_path, remote_path, run_cmd=None):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    
    sftp = client.open_sftp()
    sftp.put(local_path, remote_path)
    sftp.close()
    print(f"Uploaded {local_path} -> {remote_path}")
    
    if run_cmd:
        stdin, stdout, stderr = client.exec_command(run_cmd, timeout=300)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        if out:
            print(out)
        if err:
            print(err)
    
    client.close()

if __name__ == "__main__":
    local = sys.argv[1]
    remote = sys.argv[2]
    cmd = sys.argv[3] if len(sys.argv) > 3 else None
    upload_and_run(local, remote, cmd)
