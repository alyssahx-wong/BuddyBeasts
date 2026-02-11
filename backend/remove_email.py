"""Remove a specific email from the users table."""

from sqlalchemy import text
from database import engine

with engine.connect() as conn:
    result = conn.execute(
        text("UPDATE users SET email = NULL WHERE email = :email"),
        {"email": "alyssawong45@gmail.com"},
    )
    conn.commit()
    print(f"Updated {result.rowcount} row(s) — email cleared.")
