"""
SpoofSentry — Flask Web Application Entrypoint
Full-Stack Email Spoofing & Threat Detection Web App
"""

import os
import sqlite3
import json
from datetime import datetime, timezone
from functools import wraps
from flask import (
    Flask, render_template, request, redirect,
    url_for, session, jsonify, flash
)
from werkzeug.security import generate_password_hash, check_password_hash
from detector import SpoofDetector, EmailParser

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "spoofsentry-dev-secret-key-change-in-prod-2026")
DATABASE = os.environ.get("DATABASE_PATH", "spoofsentry.db")


def get_db():
    """Returns a connection to the SQLite database with row-factory enabled."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema if not already present."""
    with get_db() as conn:
        cursor = conn.cursor()
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        # Analysis history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                from_address TEXT NOT NULL,
                subject TEXT DEFAULT '',
                verdict TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                analyzed_at TEXT NOT NULL,
                details_json TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        conn.commit()


# Initialize database on startup
init_db()


def login_required(f):
    """Decorator ensuring session authentication for pages and API endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            if request.path.startswith("/api/"):
                return jsonify({"error": "Unauthorized. Please log in first."}), 401
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function


# -------------------------------------------------------------
# Web Page Routes
# -------------------------------------------------------------

@app.route("/")
@login_required
def index():
    """Main analyzer interface."""
    return render_template("index.html", username=session.get("username"), company=session.get("company_name"))


@app.route("/register", methods=["GET", "POST"])
def register():
    """User registration route."""
    if request.method == "POST":
        company_name = request.form.get("company_name", "").strip()
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        if not username or not password or not company_name:
            flash("All fields (Company, Username, Password) are required.", "error")
            return render_template("register.html")

        if len(password) < 6:
            flash("Password must be at least 6 characters.", "error")
            return render_template("register.html")

        password_hash = generate_password_hash(password)
        created_at = datetime.now(timezone.utc).isoformat()

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO users (company_name, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
                    (company_name, username, password_hash, created_at)
                )
                conn.commit()
                flash("Registration successful! Please log in.", "success")
                return redirect(url_for("login"))
        except sqlite3.IntegrityError:
            flash("Username is already registered. Please choose another.", "error")
            return render_template("register.html")

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """User authentication route."""
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()

            if user and check_password_hash(user["password_hash"], password):
                session.clear()
                session["user_id"] = user["id"]
                session["username"] = user["username"]
                session["company_name"] = user["company_name"]
                return redirect(url_for("index"))
            else:
                flash("Invalid username or password.", "error")

    return render_template("login.html")


@app.route("/logout")
def logout():
    """Clears user session."""
    session.clear()
    flash("You have been safely logged out.", "info")
    return redirect(url_for("login"))


# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.route("/api/analyze", methods=["POST"])
@login_required
def api_analyze():
    """
    Analyzes manually supplied header & message body fields via JSON.
    """
    data = request.get_json() or {}
    from_addr = data.get("from", "").strip()
    return_path = data.get("return_path", "").strip()
    dkim_header = data.get("dkim_header", "").strip()
    subject = data.get("subject", "").strip()
    body = data.get("body", "").strip()
    date_str = data.get("date", "").strip()

    if not from_addr:
        return jsonify({"error": "The 'from' address field is required."}), 400

    result = SpoofDetector.evaluate(
        from_address=from_addr,
        return_path=return_path,
        dkim_header=dkim_header,
        subject=subject,
        body=body,
        date_str=date_str
    )

    # Save to history for current user
    user_id = session.get("user_id")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO analysis_history (user_id, from_address, subject, verdict, risk_score, analyzed_at, details_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                from_addr,
                subject,
                result["verdict"],
                result["content_analysis"]["risk_score"],
                result["analyzed_at"],
                json.dumps(result)
            )
        )
        conn.commit()

    return jsonify(result)


@app.route("/api/analyze-eml", methods=["POST"])
@login_required
def api_analyze_eml():
    """
    Parses an uploaded raw .eml file and performs end-to-end detection.
    """
    if "eml_file" not in request.files:
        return jsonify({"error": "No .eml file uploaded in request."}), 400

    file = request.files["eml_file"]
    if not file.filename or not file.filename.lower().endswith((".eml", ".txt", ".msg")):
        return jsonify({"error": "Please upload a valid .eml file."}), 400

    raw_bytes = file.read()
    if not raw_bytes:
        return jsonify({"error": "Uploaded file is empty."}), 400

    parsed = EmailParser.parse_eml_bytes(raw_bytes)
    if not parsed["from"]:
        return jsonify({"error": "Could not extract a valid From header from the .eml file."}), 400

    result = SpoofDetector.evaluate(
        from_address=parsed["from"],
        return_path=parsed["return_path"],
        dkim_header=parsed["dkim_header"],
        subject=parsed["subject"],
        body=parsed["body"],
        date_str=parsed["date"]
    )
    result["parsed_eml_metadata"] = {
        "to": parsed["to"],
        "subject": parsed["subject"],
        "date": parsed["date"],
        "body_preview": (parsed["body"][:200] + "...") if len(parsed["body"]) > 200 else parsed["body"]
    }

    # Save to history
    user_id = session.get("user_id")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO analysis_history (user_id, from_address, subject, verdict, risk_score, analyzed_at, details_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                parsed["from"],
                parsed["subject"],
                result["verdict"],
                result["content_analysis"]["risk_score"],
                result["analyzed_at"],
                json.dumps(result)
            )
        )
        conn.commit()

    return jsonify(result)


@app.route("/api/history", methods=["GET"])
@login_required
def api_history():
    """
    Returns the 20 most recent analysis records for the logged-in user.
    """
    user_id = session.get("user_id")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, from_address, subject, verdict, risk_score, analyzed_at, details_json
            FROM analysis_history
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 20
            """,
            (user_id,)
        )
        rows = cursor.fetchall()

        history = []
        for r in rows:
            history.append({
                "id": r["id"],
                "from_address": r["from_address"],
                "subject": r["subject"],
                "verdict": r["verdict"],
                "risk_score": r["risk_score"],
                "analyzed_at": r["analyzed_at"],
                "details": json.loads(r["details_json"])
            })

        return jsonify({"history": history})


if __name__ == "__main__":
    # Runs on default port 3000 or custom PORT env
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=True)
