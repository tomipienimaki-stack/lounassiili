"""
Ruoholahden Lounas - Web-sovellus
Hakee ja näyttää päivän lounaslistat Ruoholahdenkatu 21:n lähiravintoloista.
"""

from flask import Flask, render_template, jsonify
from scrapers import fetch_all_restaurants
from datetime import datetime

app = Flask(__name__)

# Välimuisti - haetaan data max kerran per 30 min
_cache = {"data": None, "timestamp": None}
CACHE_TTL_SECONDS = 1800  # 30 minuuttia


def get_cached_restaurants():
    """Hakee ravintoladata välimuistista tai päivittää sen."""
    now = datetime.now()
    if (
        _cache["data"] is not None
        and _cache["timestamp"] is not None
        and (now - _cache["timestamp"]).total_seconds() < CACHE_TTL_SECONDS
    ):
        return _cache["data"]

    data = fetch_all_restaurants()
    _cache["data"] = data
    _cache["timestamp"] = now
    return data


@app.route("/")
def index():
    """Pääsivu - näyttää lounaslistat."""
    data = get_cached_restaurants()
    return render_template("index.html", data=data)


@app.route("/api/restaurants")
def api_restaurants():
    """JSON API lounaslistoille."""
    data = get_cached_restaurants()
    return jsonify(data)


@app.route("/refresh")
def refresh():
    """Pakottaa datan päivityksen."""
    _cache["data"] = None
    _cache["timestamp"] = None
    data = get_cached_restaurants()
    return render_template("index.html", data=data)


if __name__ == "__main__":
    print("\nRuoholahden Lounas -sovellus kaynnistyy...")
    print("   Avaa selaimessa: http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
