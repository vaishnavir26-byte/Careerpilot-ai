from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import hashlib
from jose import jwt, JWTError
import datetime
from database.connection import get_db
from database.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = "careerpilot_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str
    full_name: str
    readiness_score: float

def get_password_hash(password: str) -> str:
    salt = b"careerpilot_salt_key"
    pwd_bytes = password.encode('utf-8')
    h = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt, 100000)
    return h.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        readiness_score=65.0  # Initial default base readiness score
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": new_user.email, "id": new_user.id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name or "",
        "readiness_score": new_user.readiness_score
    }

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "id": user.id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name or "",
        "readiness_score": user.readiness_score
    }

@router.post("/guest", response_model=Token)
def guest_login(db: Session = Depends(get_db)):
    # Create or retrieve a guest user
    guest_email = f"guest_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}@careerpilot.ai"
    hashed_password = get_password_hash("guest_password_123")
    
    guest_user = User(
        email=guest_email,
        hashed_password=hashed_password,
        full_name="Guest User",
        readiness_score=50.0
    )
    db.add(guest_user)
    db.commit()
    db.refresh(guest_user)

    access_token = create_access_token(
        data={"sub": guest_user.email, "id": guest_user.id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": guest_user.id,
        "email": guest_user.email,
        "full_name": guest_user.full_name,
        "readiness_score": guest_user.readiness_score
    }

def get_current_user_helper(token: str, db: Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("id")
        if email is None or user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
