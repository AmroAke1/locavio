import pytest
from datetime import timedelta
from jose import JWTError
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_create_access_token_returns_string():
    token = create_access_token({"sub": "1"})
    assert isinstance(token, str)


def test_create_access_token_encodes_sub():
    token = create_access_token({"sub": "42"})
    payload = decode_access_token(token)
    assert payload["sub"] == "42"


def test_decode_access_token_returns_payload():
    token = create_access_token({"sub": "1", "extra": "data"})
    payload = decode_access_token(token)
    assert payload["sub"] == "1"


def test_decode_expired_token_raises():
    token = create_access_token({"sub": "1"}, expires_delta=timedelta(seconds=-1))
    with pytest.raises(JWTError):
        decode_access_token(token)


def test_decode_invalid_token_raises():
    with pytest.raises(JWTError):
        decode_access_token("not.a.valid.token")


def test_hash_password_returns_string():
    hashed = hash_password("mypassword")
    assert isinstance(hashed, str)
    assert hashed != "mypassword"


def test_verify_password_correct():
    hashed = hash_password("correct")
    assert verify_password("correct", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("correct")
    assert verify_password("wrong", hashed) is False