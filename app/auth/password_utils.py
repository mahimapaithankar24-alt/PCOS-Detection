from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

import hashlib
import bcrypt

def _prehash(password: str) -> bytes:
    """
    Converts arbitrary-length password into fixed-length bytes
    """
    return hashlib.sha256(password.encode("utf-8")).digest()

def hash_password(password: str) -> str:
    prehashed = _prehash(password)
    hashed = bcrypt.hashpw(prehashed, bcrypt.gensalt())
    
    return hashed.decode("utf-8")

def verify_password(password: str, hash: str) -> bool:
    prehashed = _prehash(password)
    return bcrypt.checkpw(prehashed, hash.encode("utf-8"))