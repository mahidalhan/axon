"""Configuration helpers for data pipelines."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Optional

import yaml

DEFAULT_CONFIG_PATH = Path("config") / "pipeline.yaml"


@dataclass
class PipelineConfig:
    """Pipeline configuration loaded from YAML or environment variables."""

    raw_data_dir: Path = Path("data") / "raw"
    processed_data_dir: Path = Path("data") / "processed"
    muse: Dict[str, Any] = field(default_factory=dict)
    apple_health: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PipelineConfig":
        raw = Path(data.get("raw_data_dir", cls.raw_data_dir))
        processed = Path(data.get("processed_data_dir", cls.processed_data_dir))

        muse = data.get("muse", {})
        apple_health = data.get("apple_health", {})

        return cls(
            raw_data_dir=raw,
            processed_data_dir=processed,
            muse=muse,
            apple_health=apple_health,
        )


def load_config(path: Optional[os.PathLike[str]] = None) -> PipelineConfig:
    """Load pipeline configuration from YAML file or environment variables."""

    config_path = Path(path) if path else DEFAULT_CONFIG_PATH

    if config_path.is_file():
        with config_path.open("r", encoding="utf-8") as fh:
            data = yaml.safe_load(fh) or {}
    else:
        data = {}

    # Environment overrides
    raw_dir = os.getenv("PIPELINE_RAW_DIR")
    processed_dir = os.getenv("PIPELINE_PROCESSED_DIR")
    if raw_dir:
        data["raw_data_dir"] = raw_dir
    if processed_dir:
        data["processed_data_dir"] = processed_dir

    return PipelineConfig.from_dict(data)

