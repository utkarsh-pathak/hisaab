import os


class Settings:
    DATABASE_URL = os.getenv(
        "DATABASE_URL", "mysql+mysqlconnector://user:password@localhost/db_name"
    )


settings = Settings()
