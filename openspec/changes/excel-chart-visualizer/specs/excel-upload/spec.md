## ADDED Requirements

### Requirement: Excel File Upload Interface
系统 SHALL 提供文件上传区域，允许用户选择 `.xlsx` 格式的 Excel 文件。上传区域 SHALL 支持点击选择文件和拖拽上传两种方式。

#### Scenario: User selects file via click
- **WHEN** 用户点击上传区域并选择一个 `.xlsx` 文件
- **THEN** 系统开始解析该文件并显示加载状态

#### Scenario: User drags file to upload area
- **WHEN** 用户将一个 `.xlsx` 文件拖拽到上传区域
- **THEN** 系统开始解析该文件并显示加载状态

#### Scenario: User uploads non-xlsx file
- **WHEN** 用户选择或拖拽一个非 `.xlsx` 格式的文件
- **THEN** 系统显示错误提示"请上传 .xlsx 格式的 Excel 文件"，不进行解析

### Requirement: Excel Data Parsing
系统 SHALL 使用 SheetJS 在浏览器端解析上传的 Excel 文件。系统 SHALL 自动识别 Excel 中以标题行分隔的多个纵向数据块，并将每个数据块解析为结构化 JSON 数据。

#### Scenario: Parse standard 4-block Excel
- **WHEN** 用户上传包含 4 组数据块（主动参与、积极情绪、同伴分享、延续兴趣）的 Excel 文件
- **THEN** 系统将文件解析为 4 个数据组，每个数据组包含标题、分类标签数组、传统组数值数组和创新组数值数组

#### Scenario: Parse Excel with variable block count
- **WHEN** 用户上传包含 3 组或 5 组数据块的 Excel 文件
- **THEN** 系统按实际数据块数量解析，不限制为固定 4 组

#### Scenario: Parse Excel with different label sets
- **WHEN** 数据块使用不同的分类标签（如"高频/中频/低频/无"或"强烈/一般/无"）
- **THEN** 系统按每组的实际标签解析，不限制标签内容

### Requirement: Data Block Structure Recognition
系统 SHALL 按以下规则识别数据块：以包含"人数分布"的标题行作为数据块起始标记，后续连续的非空行为数据行，每行第一列为分类标签，第二列为传统组数值，第三列为创新组数值。

#### Scenario: Recognize block with title containing keyword
- **WHEN** 解析到某行第一列包含"人数分布"文本
- **THEN** 该行被识别为新数据块的标题，后续行被归入该数据块

#### Scenario: Stop reading at empty row
- **WHEN** 数据块后出现空行或文件结束
- **THEN** 当前数据块结束，停止读取

#### Scenario: Handle malformed Excel gracefully
- **WHEN** 上传的 Excel 格式不匹配预期结构（如没有标题行、数据列缺失）
- **THEN** 系统显示友好的错误提示"Excel 格式无法识别，请检查文件内容"，不抛出未捕获异常

### Requirement: Upload State Feedback
系统 SHALL 在文件解析过程中提供清晰的状态反馈，包括上传前提示、解析中加载状态和解析完成后的图表展示。

#### Scenario: Show loading during parse
- **WHEN** 文件正在被解析
- **THEN** 显示加载动画和"正在解析数据..."文字提示

#### Scenario: Show charts after parse
- **WHEN** 文件解析成功完成
- **THEN** 上传区域收起或缩小，图表区域展示解析出的所有分组柱状图

#### Scenario: Allow re-upload
- **WHEN** 图表已经展示，用户再次上传新文件
- **THEN** 系统重新解析新文件并替换当前图表
