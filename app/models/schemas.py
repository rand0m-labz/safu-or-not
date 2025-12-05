from pydantic import BaseModel, HttpUrl
from typing import Optional

class CheckRequest(BaseModel):
    url: HttpUrl

class CheckResponse(BaseModel):
    url: str
    status: str
    details: Optional[str] = None
    domain_age: Optional[str] = None
    ssl_status: Optional[str] = None
    wallet_required: Optional[str] = None
    disclaimer: str
