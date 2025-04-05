from setuptools import setup, find_packages

setup(
    name="workflow-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "pytest",
        "pytest-asyncio",
        "pyyaml",
    ],
    python_requires=">=3.9",
) 
