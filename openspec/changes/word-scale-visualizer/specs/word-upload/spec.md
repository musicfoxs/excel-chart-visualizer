## ADDED Requirements

### Requirement: Dual upload entries for group assignment
The system SHALL provide two distinct file upload areas labeled "创新组" (innovative group) and "传统组" (traditional group). Each upload area SHALL accept one or more `.docx` files simultaneously.

#### Scenario: Upload single file to innovative group
- **WHEN** user drags or selects one `.docx` file into the "创新组" upload area
- **THEN** system accepts the file and adds it to the innovative group file list

#### Scenario: Upload multiple files to traditional group
- **WHEN** user selects 3 `.docx` files into the "传统组" upload area
- **THEN** system accepts all 3 files and adds them to the traditional group file list

#### Scenario: Reject non-docx file
- **WHEN** user attempts to upload a `.pdf` or `.xlsx` file
- **THEN** system rejects the file and displays an error message "仅支持 .docx 格式的文件"

### Requirement: Word document XML parsing
The system SHALL parse each `.docx` file using JSZip to extract `word/document.xml`, then use DOMParser to traverse `<w:tbl>` elements and extract evaluation data from the table structure.

#### Scenario: Parse a valid scale document
- **WHEN** a valid `.docx` scale document is uploaded
- **THEN** system extracts the single table with 16 rows and 5 columns, identifying header rows (1-2), data rows (3-12), and summary rows (13-16)

#### Scenario: Handle vertical merge cells
- **WHEN** parsing rows with `w:vMerge` attributes
- **THEN** system resolves vertical merges by propagating the dimension name (e.g. "爱上阅读（阅读兴趣）") from the `vMerge=restart` row to all `vMerge=continue` rows

#### Scenario: Aggregate fragmented text nodes
- **WHEN** a cell's text is split across multiple `<w:r>` elements
- **THEN** system concatenates all `<w:t>` text content within the same cell to form the complete cell text

### Requirement: Checkbox mark extraction
The system SHALL identify checked (`☑` U+2611) and unchecked (`□` U+25A1) marks within the "评价等级" column (5th column). For each checked item, the system SHALL extract the associated level label text.

#### Scenario: Extract checked level from a cell
- **WHEN** parsing a rating cell containing `☑中频(3-4次) □高频(>=5次) □低频(1-2次) □无(0次)`
- **THEN** system identifies "中频(3-4次)" as the checked level for this indicator

#### Scenario: Handle multiple checked marks in one cell
- **WHEN** parsing a cell where multiple marks are checked (e.g. `☑能理解并主动迁移 □能理解但需引导 ☑仅理解绘本内容 □不理解`)
- **THEN** system records ALL checked levels for that indicator

#### Scenario: Handle cell with no checked marks
- **WHEN** parsing a cell where all marks are unchecked (`□` only)
- **THEN** system records an empty array of checked levels for that indicator

### Requirement: Structured evaluation record output
The system SHALL transform parsed Word data into a structured evaluation record per document. Each record SHALL contain: the document filename, the group assignment (innovative/traditional), and a list of indicator evaluations grouped by module.

#### Scenario: Generate evaluation record for one document
- **WHEN** parsing of one `.docx` file completes
- **THEN** system produces an evaluation record with 3 modules ("爱上阅读", "学会阅读", "个体差异"), each containing its indicators with their checked level labels

#### Scenario: Preserve module-indicator hierarchy
- **WHEN** generating the evaluation record
- **THEN** the record SHALL maintain the hierarchy: module → indicators → checked levels, where modules are: "爱上阅读" (4 indicators), "学会阅读" (4 indicators), "个体差异" (2 indicators)
