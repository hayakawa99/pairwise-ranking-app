from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.db.models.user import User

router = APIRouter()

class UserRegisterRequest(BaseModel):
    email: str
    name: str | None = None
    image: str | None = None

@router.post("/register", status_code=201)
def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    フロントから送られてきたユーザー情報を元に users テーブルへ登録。
    存在しない場合にのみ新規作成する。
    """
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        return {"message": "User already exists", "id": existing_user.id}

    user = User(
        email=request.email,
        name=request.name,
        image=request.image,
    )
    db.add(user)
    db.flush()  # user.id を取得可能にする
    db.commit()
    return {"message": "User registered", "id": user.id}
