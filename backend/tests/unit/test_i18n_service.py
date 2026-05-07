import pytest
from app.services.i18n_service import get_language


def test_returns_default_for_empty_header():
    result = get_language("")
    assert result == "en"


def test_returns_default_for_none_header():
    result = get_language(None)
    assert result == "en"


def test_returns_en_for_en_us():
    result = get_language("en-US")
    assert result == "en"


def test_returns_fr_for_fr_header():
    result = get_language("fr")
    assert result == "fr"


def test_returns_tr_for_tr_header():
    result = get_language("tr")
    assert result == "tr"


def test_returns_ar_for_ar_header():
    result = get_language("ar")
    assert result == "ar"


def test_returns_es_for_es_header():
    result = get_language("es")
    assert result == "es"


def test_returns_default_for_unsupported_lang():
    result = get_language("zh")
    assert result == "en"


def test_parses_q_values_and_picks_best():
    # fr has lower q, en has higher — should pick en
    result = get_language("fr;q=0.5,en;q=0.9")
    assert result == "en"


def test_picks_first_supported_from_list():
    result = get_language("zh,fr,en")
    assert result == "fr"


def test_handles_malformed_q_value():
    result = get_language("fr;q=bad")
    assert result == "fr"