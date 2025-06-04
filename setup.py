from setuptools import setup, find_packages

setup(
    name="workflow-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "pytest",
        "pytest-asyncio",
        "pyyaml",
        "duckdb>=0.9.0",
        "fastapi>=0.100.0",
        "uvicorn>=0.23.0",
        "websockets>=11.0",
    ],
    python_requires=">=3.9",
)
