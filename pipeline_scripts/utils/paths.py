"""Path utilities for pipeline scripts."""

from pathlib import Path

from .config import load_config

CONFIG = load_config()
RAW_DATA_DIR = CONFIG.raw_data_dir
PROCESSED_DATA_DIR = CONFIG.processed_data_dir


def ensure_directory(path: Path) -> Path:
    """Create directory if it does not exist and return the path."""

    path.mkdir(parents=True, exist_ok=True)
    return path

