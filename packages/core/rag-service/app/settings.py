from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings using Pydantic BaseSettings."""

    # Vector store settings
    VECTOR_DIR: str = Field("./vector_store", description="Directory for vector store")

    # Anthropic settings
    ANTHROPIC_API_KEY: str = Field(..., description="Anthropic API key")
    ANTHROPIC_MODEL_NAME: str = Field("claude-3-haiku-20240307", description="Anthropic model name")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Create settings instance
settings = Settings()
