"""PRISM v2 acquisition spike.

The package is intentionally independent from the public v1 request path.
"""

from acquisition_v2.manager import AcquisitionManager
from acquisition_v2.models import (
    AcquisitionState,
    DiscoveredArticle,
    ExtractionMethod,
    NormalizedArticle,
)

__all__ = [
    "AcquisitionManager",
    "AcquisitionState",
    "DiscoveredArticle",
    "ExtractionMethod",
    "NormalizedArticle",
]
