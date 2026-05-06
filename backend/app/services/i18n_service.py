from app.core.config import settings


def get_language(accept_language: str) -> str:
    """Parse Accept-Language header and return the best supported language.

    Args:
        accept_language: Raw Accept-Language header value.

    Returns:
        Best matching language code from ALLOWED_LANGUAGES, or DEFAULT_LANGUAGE.
    """
    if not accept_language:
        return settings.DEFAULT_LANGUAGE

    # Parse "en-US,en;q=0.9,fr;q=0.8" style headers
    candidates: list[tuple[float, str]] = []
    for part in accept_language.split(","):
        part = part.strip()
        if ";q=" in part:
            lang, q_str = part.split(";q=", 1)
            try:
                q = float(q_str.strip())
            except ValueError:
                q = 0.0
        else:
            lang = part
            q = 1.0
        lang = lang.strip().split("-")[0].lower()
        candidates.append((q, lang))

    candidates.sort(key=lambda x: x[0], reverse=True)

    for _, lang in candidates:
        if lang in settings.ALLOWED_LANGUAGES:
            return lang

    return settings.DEFAULT_LANGUAGE
