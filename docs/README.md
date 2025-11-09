# Brain Score Documentation Index

## Ontology Overview
The documentation library is organized into layered domains so contributors can navigate from foundational research through implementation details.

| Layer | Purpose | Primary References |
| --- | --- | --- |
| Background | Scientific motivation, hardware constraints, data provenance | `background/dataset-requirements.md`, `background/huberman-pod.md`, `background/claude-convo.md` |
| Algorithms | Neuroplasticity hypotheses, scoring formulas, product requirements | `algorithm/neuro-PRD.md`, `algorithm/SLEEP-METRICS-SPECIFICATION.md`, `shared/TERMINOLOGY.md` |
| Data Pipeline | Cleaning and staging datasets for Emergent | `data-pipeline/README.md`, `data-pipeline/muse-eeg.md`, `data-pipeline/apple-health.md`, `data-pipeline/outputs.md` |
| Emergent Build | Specs for automated FastAPI & UI construction | `emergent-build/README.md`, `emergent-build/backend.md`, `emergent-build/ui.md`, `emergent-build/education.md` |
| Data Processing (Legacy) | Historical pipeline docs (reference only) | `data-processing/PIPELINE_EXPLAINED.md`, `data-processing/REAL_DATA_INTEGRATION.md`, `data-processing/SLEEP-SCORE-CALCULATION.md` |
| Application (Reference) | UX flows, education content | `app/IMPLEMENTATION-PLAN.md`, `app/UI-COMPONENTS.md`, `app/SLEEP-EDUCATION.md` |
| Shared References | Cross-cutting glossary and reusable snippets | `shared/TERMINOLOGY.md`, `shared/sleep-score-snippets.md` |
| Extensions | Roadmaps and upcoming datasets beyond the MVP scope | `post-mvp/dataset-upgrade-plan.md` |

## Quick Start
- **New to the project?** Read the Background layer first, then the Algorithm specs.
- **Building backend components?** Pair `data-processing/` docs with the Shared snippets to ensure implementation stays DRY.
- **Working on UX?** Reference the Application layer for screen flows and messaging.

## Maintaining the Ontology
1. Place new documentation in the appropriate layer directory.
2. Link to shared terminology or snippets instead of duplicating content.
3. When updating a document, confirm cross-references and this index remain accurate.

For questions or contributions, open a doc issue describing the proposed layer and consumers of the new content.

