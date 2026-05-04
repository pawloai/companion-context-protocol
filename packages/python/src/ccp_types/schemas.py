"""Helpers for locating and loading CCP JSON Schemas from the source tree."""

from __future__ import annotations

import json
from importlib.resources import files
from pathlib import Path
from typing import Any, Literal

CCP_VERSION = "0.1.0-draft"

SchemaName = Literal[
    "core",
    "commerce-context-request",
    "commerce-context-response",
    "permission-grant",
]

_SCHEMA_FILENAMES: dict[SchemaName, str] = {
    "core": "ccp-core.schema.json",
    "commerce-context-request": "commerce-context-request.schema.json",
    "commerce-context-response": "commerce-context-response.schema.json",
    "permission-grant": "permission-grant.schema.json",
}


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[4]


def schema_path(name: SchemaName) -> Path:
    """Return the local path for a canonical CCP schema."""
    source_tree_schema_dir = _repo_root() / "schemas"
    source_tree_path = source_tree_schema_dir / _SCHEMA_FILENAMES[name]
    if source_tree_schema_dir.is_dir() and source_tree_path.exists():
        return source_tree_path

    packaged_path = files("ccp_types").joinpath("json_schemas", _SCHEMA_FILENAMES[name])
    return Path(str(packaged_path))


def schema_paths() -> dict[SchemaName, Path]:
    """Return local paths for all canonical CCP schemas."""
    return {name: schema_path(name) for name in _SCHEMA_FILENAMES}


def load_schema(name: SchemaName) -> dict[str, Any]:
    """Load one canonical CCP schema as a JSON object."""
    with schema_path(name).open(encoding="utf-8") as schema_file:
        schema = json.load(schema_file)

    if not isinstance(schema, dict):
        raise TypeError(f"Expected object schema for {name}")

    return schema


def load_schemas() -> dict[SchemaName, dict[str, Any]]:
    """Load all canonical CCP schemas as JSON objects keyed by schema name."""
    return {name: load_schema(name) for name in _SCHEMA_FILENAMES}
