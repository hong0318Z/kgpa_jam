#!/bin/sh
# Dumps the Postgres DB as plain SQL, skips writing a new file if content is
# unchanged since the last backup, and keeps only the newest MAX_BACKUPS dumps.
set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
MAX_BACKUPS="${MAX_BACKUPS:-10}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
HASH_FILE="$BACKUP_DIR/latest.sha256"
TMP_SQL=$(mktemp)

mkdir -p "$BACKUP_DIR"

cleanup() {
  rm -f "$TMP_SQL"
}
trap cleanup EXIT

pg_dump --no-owner --no-privileges > "$TMP_SQL"

# pg_dump emits a random \restrict/\unrestrict token pair on every run even
# when the actual data is unchanged, so exclude those two lines from the hash.
NEW_HASH=$(grep -vE '^\\(un)?restrict ' "$TMP_SQL" | sha256sum | awk '{print $1}')

if [ -f "$HASH_FILE" ] && [ "$(cat "$HASH_FILE")" = "$NEW_HASH" ]; then
  echo "$(date -Iseconds) No changes since last backup, skipping."
  exit 0
fi

NEW_FILE="$BACKUP_DIR/kgpa_jam_${TIMESTAMP}.sql.gz"
gzip -c "$TMP_SQL" > "$NEW_FILE"
echo "$NEW_HASH" > "$HASH_FILE"
echo "$(date -Iseconds) Backup created: $NEW_FILE"

# Keep only the newest MAX_BACKUPS dump files, oldest ones are removed first.
ls -1t "$BACKUP_DIR"/kgpa_jam_*.sql.gz 2>/dev/null | tail -n "+$((MAX_BACKUPS + 1))" | while IFS= read -r old; do
  echo "$(date -Iseconds) Removing old backup: $old"
  rm -f "$old"
done
