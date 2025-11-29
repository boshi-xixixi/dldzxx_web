from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from pydantic_core import core_schema
from bson import ObjectId

# 自定义ObjectId字段
class PyObjectId(ObjectId):
    """Pydantic v2 兼容的自定义 ObjectId 类型。

    - 校验：接受字符串或 ObjectId，校验有效性后转换为 ObjectId。
    - JSON Schema：在 OpenAPI/Schema 中声明为字符串类型。
    """

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        def validate(value):
            if isinstance(value, ObjectId):
                return value
            if not ObjectId.is_valid(value):
                raise ValueError("无效的ObjectId")
            return ObjectId(value)

        return core_schema.no_info_after_validator_function(
            validate,
            core_schema.str_schema(),
        )

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema_, handler):
        json_schema = handler(core_schema_)
        json_schema.update(type="string")
        return json_schema

# 用户模型
class UserModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str
    email: str
    hashed_password: str
    role: str = "user"  # "user" 或 "admin"
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Pydantic v2 模型配置
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "username": "user1",
                "email": "user1@example.com",
                "hashed_password": "hashed_password_here",
                "role": "user",
            }
        },
    )

    # 将 ObjectId 序列化为字符串（用于响应 JSON）
    @field_serializer("id")
    def serialize_id(self, value: ObjectId):
        return str(value)