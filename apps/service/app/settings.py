from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file = ('.env', '.env.prod'),
        env_file_encoding = 'utf-8',
    )
    """Application settings using Pydantic BaseSettings."""
    # Vector store settings
    VECTOR_DIR: str = Field("./vector_store", description="Directory for vector store")
    # Anthropic settings
    ANTHROPIC_API_KEY: str = Field(..., description="Anthropic API key")
    ANTHROPIC_MODEL_NAME: str = Field(..., description="Anthropic model name")
    LANGSMITH_TRACING: bool = Field(None, description="Enable tracing")
    LANGSMITH_ENDPOINT: str = Field(None)
    LANGSMITH_API_KEY: str = Field(None)
    LANGSMITH_PROJECT: str = Field(None)

# Create settings instance
settings = Settings()
