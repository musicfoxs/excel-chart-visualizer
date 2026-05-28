## ADDED Requirements

### Requirement: Grouped Bar Chart Rendering
系统 SHALL 使用 ECharts 将每组解析出的数据渲染为分组柱状图。X 轴为分类标签（如"高频/中频/低频/无"），每个分类下显示两根柱子分别代表传统组与创新组。

#### Scenario: Render standard 4-block data
- **WHEN** Excel 解析出 4 组数据
- **THEN** 页面渲染 4 个分组柱状图，每个图表对应一组数据，X 轴为分类标签，图例显示"传统组"和"创新组"

#### Scenario: Chart layout responsive
- **WHEN** 浏览器窗口大小变化
- **THEN** 图表自动调整尺寸以适应容器宽度，保持可读性

### Requirement: Neon Gradient Bar Style
系统 SHALL 为柱状图的柱子应用霓虹渐变色效果。传统组柱子使用冷色调渐变（蓝色到紫色），创新组柱子使用暖色调渐变（橙色到粉红色）。柱子 SHALL 具有圆角顶部。

#### Scenario: Apply gradient colors to bars
- **WHEN** 图表渲染时
- **THEN** 传统组柱子显示从底到顶的蓝紫渐变，创新组柱子显示从底到顶的橙粉渐变，柱子顶部为圆角

### Requirement: Glow and Shadow Effects
系统 SHALL 为柱子添加发光阴影效果，使柱子在外观上呈现霓虹灯光感。悬浮某根柱子时 SHALL 增强发光效果。

#### Scenario: Default glow on bars
- **WHEN** 图表正常展示
- **THEN** 每根柱子带有微弱的外发光阴影效果，模拟霓虹灯光

#### Scenario: Enhanced glow on hover
- **WHEN** 鼠标悬浮在某根柱子上
- **THEN** 该柱子的发光效果增强，同时显示 tooltip 展示具体数值和分类信息

### Requirement: Entry Animation
系统 SHALL 在图表首次渲染时播放柱子从底部生长的入场动画，动画 SHALL 按分类顺序依次延迟触发，形成波浪式生长效果。

#### Scenario: Play growth animation on first render
- **WHEN** 图表首次渲染或数据更新时
- **THEN** 柱子从底部生长至目标高度，各分类的柱子按顺序延迟 200ms 依次开始生长

### Requirement: Glassmorphism Card Layout
系统 SHALL 将每个图表包裹在毛玻璃效果的卡片容器中。卡片 SHALL 具有半透明模糊背景、微弱边框发光和悬浮阴影效果。

#### Scenario: Display glassmorphism cards
- **WHEN** 页面渲染图表
- **THEN** 每个图表位于一个毛玻璃卡片中，卡片具有半透明背景（backdrop-filter: blur）、微弱的发光边框和阴影

#### Scenario: Cards arranged in 2x2 grid
- **WHEN** 有 4 个图表需要展示
- **THEN** 卡片以 2x2 网格布局排列，每个卡片内包含图表标题和 ECharts 图表

### Requirement: Dynamic Particle Background
系统 SHALL 在页面背景层渲染动态粒子效果。粒子 SHALL 以缓慢漂浮的方式运动，具有不同的大小和透明度，营造数据大屏的科技氛围。

#### Scenario: Render particle background
- **WHEN** 页面加载完成
- **THEN** 背景层显示缓慢漂浮的粒子效果，粒子具有随机大小和透明度，整体色调与深色背景协调

### Requirement: Dark Dashboard Theme
系统 SHALL 使用深色背景（接近黑色的深蓝/深灰色调）作为页面主背景，所有文字和图表元素 SHALL 使用浅色以保证对比度和可读性。

#### Scenario: Apply dark theme to page
- **WHEN** 页面加载
- **THEN** 页面背景为深色（#0a0a1a 或类似色调），标题和文字为白色或浅灰色，图表背景透明融入深色主题

### Requirement: Page Title and Header
系统 SHALL 在页面顶部显示标题（如"数据可视化大屏"），标题 SHALL 具有霓虹发光文字效果。标题下方可显示副标题说明数据来源。

#### Scenario: Display glowing title
- **WHEN** 页面加载
- **THEN** 顶部显示带霓虹发光效果的标题文字，下方显示数据来源提示（如"上传 Excel 文件以查看数据分布"）

### Requirement: Tooltip Display
系统 SHALL 在用户悬浮柱子时显示自定义 tooltip，tooltip SHALL 显示分类名称、组别名称、具体数值，并使用毛玻璃样式。

#### Scenario: Show styled tooltip on hover
- **WHEN** 鼠标悬浮在柱状图的某根柱子上
- **THEN** 显示毛玻璃样式的 tooltip，包含分类名称、组别（传统组/创新组）和具体人数数值
