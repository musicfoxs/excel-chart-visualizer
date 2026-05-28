## ADDED Requirements

### Requirement: Multi-document aggregation by module and level
The system SHALL aggregate evaluation records from all uploaded documents (across both groups) into per-module statistics. For each module and each indicator within the module, the system SHALL count how many people (documents) selected each level label, grouped by innovative/traditional.

#### Scenario: Aggregate 3 innovative and 3 traditional documents
- **WHEN** 3 innovative group documents and 3 traditional group documents are parsed
- **THEN** system produces counts for each indicator's level labels, split by group (e.g. indicator "主动参与": innovative group has 2 people at "中频" and 1 at "高频", traditional group has 1 at "低频" and 2 at "无")

#### Scenario: Handle uneven group sizes
- **WHEN** innovative group has 5 documents but traditional group has 3 documents
- **THEN** system still produces valid counts for both groups; missing data is treated as zero count, not null

### Requirement: Module-level data blocks for chart rendering
The system SHALL produce chart-ready data blocks per module. Each data block SHALL contain: the module title, a list of indicators (as chart categories), level labels (as bar groups), and count arrays per level per group.

#### Scenario: Generate data block for "爱上阅读" module
- **WHEN** aggregation is complete for the "爱上阅读" module
- **THEN** system produces a data block with 4 indicators as categories, where each indicator has its own level labels and corresponding counts for innovative and traditional groups

#### Scenario: Generate data block for "个体差异" module
- **WHEN** aggregation is complete for the "个体差异" module
- **THEN** system produces a data block with 2 indicators as categories, with their specific level labels and counts

### Requirement: Overall summary aggregation
The system SHALL produce a "总体对比" (overall comparison) data block that summarizes all 10 indicators across all 3 modules into a single chart view, showing innovative vs traditional group counts per indicator.

#### Scenario: Generate overall comparison data block
- **WHEN** all module aggregations are complete
- **THEN** system produces an overall data block listing all 10 indicators, with each indicator's level labels and combined counts from both groups

### Requirement: Dynamic level label handling
The system SHALL NOT assume a fixed set of level labels. Each indicator may have different level labels (e.g. "高频/中频/低频/无" vs "熟练运用/基本掌握/初步尝试/无法运用"). The aggregation engine SHALL dynamically discover and preserve the actual level labels from the parsed data.

#### Scenario: Aggregate indicators with different level schemes
- **WHEN** "主动参与" uses "高频/中频/低频/无" but "句式掌握" uses "熟练运用/基本掌握/初步尝试/无法运用"
- **THEN** the data blocks for each indicator preserve their respective level labels without normalization

#### Scenario: Normalize levels for overall comparison
- **WHEN** generating the overall comparison data block
- **THEN** each indicator keeps its own level labels; the overall view displays indicators sequentially rather than forcing a shared axis
