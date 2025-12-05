import httpx
import ssl
import socket
import datetime
import whois

from app.utils.config import SAFE_BROWSING_API_KEY, SAFE_BROWSING_URL, DISCLAIMER
from app.models.schemas import CheckResponse


async def get_domain_age(url: str) -> str:
    try:
        domain = url.replace("https://", "").replace("http://", "").split("/")[0]
        w = whois.whois(domain)
        created = w.creation_date

        if isinstance(created, list):
            created = created[0]

        if not created:
            return "Unknown"

        age_days = (datetime.datetime.now() - created).days

        if age_days < 0:
            return "Unknown"

        return f"{age_days} days old"
    except:
        return "Unknown"


def get_ssl_status(url: str) -> str:
    try:
        hostname = url.replace("https://", "").replace("http://", "").split("/")[0]

        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()

        not_after = cert.get("notAfter")
        expiry_date = datetime.datetime.strptime(not_after, "%b %d %H:%M:%S %Y GMT")
        days_left = (expiry_date - datetime.datetime.now()).days

        if days_left < 0:
            return "Expired"

        return f"Valid (expires in {days_left} days)"

    except:
        return "No SSL / Invalid"


async def check_url_safety(url: str) -> CheckResponse:
    url = str(url).strip()

    payload = {
        "client": {"clientId": "safu_or_not", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.post(SAFE_BROWSING_URL, json=payload)

    if res.status_code != 200:
        raise Exception(f"Safe Browsing API error: {res.text}")

    data = res.json()
    matches = data.get("matches", [])

    # Extra checks
    domain_age = await get_domain_age(url)
    ssl_status = get_ssl_status(url)

    # SAFE
    if not matches:
        return CheckResponse(
            url=url,
            status="safe",
            details="No known threats detected.",
            domain_age=domain_age,
            ssl_status=ssl_status,
            disclaimer=DISCLAIMER,
        )

    # UNSAFE
    threat_types = sorted({str(m.get("threatType", "UNKNOWN")) for m in matches})

    return CheckResponse(
        url=url,
        status="not_safe",
        details="Unsafe indicators detected: " + ", ".join(threat_types),
        domain_age=domain_age,
        ssl_status=ssl_status,
        disclaimer=DISCLAIMER,
    )
