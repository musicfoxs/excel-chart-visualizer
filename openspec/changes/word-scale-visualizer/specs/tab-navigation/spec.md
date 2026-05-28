## ADDED Requirements

### Requirement: Four-tab navigation layout
The system SHALL display a horizontal tab bar with 4 tabs: "爱上阅读", "学会阅读", "个体差异", "总体对比". Exactly one tab SHALL be active at a time. The active tab's content area SHALL display the corresponding module's charts.

#### Scenario: Switch between tabs
- **WHEN** user clicks the "学会阅读" tab
- **THEN** the tab bar highlights "学会阅读" and the content area displays the "学会阅读" module's charts; other tabs' charts are hidden

#### Scenario: Default active tab
- **WHEN** the page loads with no data
- **THEN** the first tab "爱上阅读" SHALL be active by default; the content area shows an empty state with upload prompts

### Requirement: Per-module chart rendering
The system SHALL render ECharts grouped bar charts for the currently active tab. Each indicator within the module SHALL be rendered as a separate chart card. Each chart SHALL display innovative group and traditional group as two bar series, with the indicator's level labels as x-axis categories.

#### Scenario: Render "爱上阅读" module charts
- **WHEN** "爱上阅读" tab is active and data is loaded
- **THEN** 4 chart cards are displayed (one per indicator: 主动参与, 积极情绪, 同伴分享, 延续兴趣), each showing innovative vs traditional group bar comparison

#### Scenario: Render "个体差异" module charts
- **WHEN** "个体差异" tab is active and data is loaded
- **THEN** 2 chart cards are displayed (高水平幼儿表现, 低水平幼儿表现), each showing the comparison

### Requirement: Overall comparison chart rendering
The system SHALL render a combined chart view in the "总体对比" tab. This tab SHALL display all 10 indicators from all 3 modules, each as a separate chart card, providing a comprehensive view of the entire evaluation.

#### Scenario: Render overall comparison with all indicators
- **WHEN** "总体对比" tab is active and data is loaded
- **THEN** 10 chart cards are displayed, grouped by module with section headers ("爱上阅读", "学会阅读", "个体差异"), each chart showing innovative vs traditional comparison

### Requirement: Empty state display
The system SHALL display a clear empty state when no documents have been uploaded. The empty state SHALL show the dual upload areas and a message prompting the user to upload documents.

#### Scenario: Initial page load with no data
- **WHEN** page loads and no documents have been uploaded
- **THEN** tab bar is visible but disabled (non-interactive), upload areas are prominently displayed, and content area shows "请上传 Word 评价量表文件" message

#### Scenario: Partial data upload
- **WHEN** user has uploaded files to only one group (e.g. innovative)
- **THEN** system SHALL still render charts for that group; the other group's bars SHALL show zero values

### Requirement: Visual consistency with existing design
The system SHALL maintain the existing data dashboard visual style: dark background, neon gradient bars, glow shadows, frosted-glass cards, and particle background animation.

#### Scenario: Charts use consistent visual style
- **WHEN** any chart is rendered
- **THEN** it uses the same color scheme (purple-blue for traditional, orange-pink for innovative), same bar styling (rounded corners, glow shadows), and same tooltip formatting as the existing design

#### Scenario: Tab bar uses glass-card styling
- **WHEN** the tab navigation bar is rendered
- **THEN** it uses the same frosted-glass card effect as other UI elements
