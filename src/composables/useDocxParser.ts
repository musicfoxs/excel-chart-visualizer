import JSZip from 'jszip'
import type { ParsedDocument, ParsedModule, ParsedIndicator, GroupType } from '@/types'

/** Word XML 命名空间 */
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

/**
 * 兼容命名空间地获取子元素列表。
 * 优先用 w: 命名空间查找，fallback 到本地名称。
 */
const getElements = (parent: Element, localName: string): Element[] => {
  const ns = parent.getElementsByTagNameNS(W_NS, localName)
  if (ns.length > 0) return Array.from(ns)
  return Array.from(parent.getElementsByTagName(localName))
}

/** 获取第一个匹配的子元素 */
const getFirstElement = (parent: Element, localName: string): Element | null => {
  const list = getElements(parent, localName)
  return list.length > 0 ? list[0] : null
}

/** 获取元素的某个属性值 */
const getAttr = (el: Element, localName: string): string | null => {
  return el.getAttributeNS(W_NS, localName) ?? el.getAttribute(localName)
}

/**
 * 从 w:tc（单元格）中提取纯文本。
 * 处理文本碎片化和 w:br 软回车。
 */
const extractCellText = (tc: Element): string => {
  const parts: string[] = []
  const paragraphs = getElements(tc, 'p')

  for (const p of paragraphs) {
    let lineParts: string[] = []
    for (const child of Array.from(p.childNodes)) {
      if (child.nodeType !== Node.ELEMENT_NODE) continue
      const el = child as Element
      const localName = el.localName

      if (localName === 'r') {
        const tElements = getElements(el, 't')
        for (const t of tElements) {
          lineParts.push(t.textContent ?? '')
        }
      } else if (localName === 'br') {
        const brType = getAttr(el, 'type')
        if (brType === 'textWrapping' || brType === null) {
          parts.push(lineParts.join(''))
          lineParts = []
        }
      }
    }
    parts.push(lineParts.join(''))
  }

  return parts.join('\n').trim()
}

/**
 * 检测单元格是否有垂直合并，以及是 restart 还是 continue。
 */
const getVMerge = (tc: Element): 'restart' | 'continue' | 'none' => {
  const tcPr = getFirstElement(tc, 'tcPr')
  if (!tcPr) return 'none'
  const vMerge = getFirstElement(tcPr, 'vMerge')
  if (!vMerge) return 'none'
  const val = getAttr(vMerge, 'val')
  // w:val="restart" → 新合并起始；无 val 属性 → 续行
  return val === 'restart' ? 'restart' : 'continue'
}

/** 获取单元格的水平合并跨度 */
const getGridSpan = (tc: Element): number => {
  const tcPr = getFirstElement(tc, 'tcPr')
  if (!tcPr) return 1
  const gridSpan = getFirstElement(tcPr, 'gridSpan')
  if (!gridSpan) return 1
  const val = getAttr(gridSpan, 'val')
  return val ? parseInt(val, 10) : 1
}

/**
 * 从评价等级单元格的文本中提取勾选项。
 * 正则匹配 ☑/✓/√ 后跟的等级标签文本。
 */
const extractCheckedLevels = (text: string): { checkedLevels: string[]; allLevels: string[] } => {
  const checkedLevels: string[] = []
  const allLevels: string[] = []

  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    const match = line.match(/^(☑|✓|√)\s*(.+)$/)
    if (match) {
      const label = match[2].trim()
      checkedLevels.push(label)
      allLevels.push(label)
    } else {
      const unchecked = line.match(/^□\s*(.+)$/)
      if (unchecked) {
        allLevels.push(unchecked[1].trim())
      }
    }
  }

  return { checkedLevels, allLevels }
}

/**
 * 解析 Word XML 表格，返回结构化数据。
 * 行 1-2: 表头（跳过）
 * 行 3-12: 数据行（4+4+2 共 10 个指标）
 */
const parseTable = (body: Element, filename: string, group: GroupType): ParsedDocument => {
  const tables = getElements(body, 'tbl')
  if (tables.length === 0) {
    throw new Error(`无法识别的量表格式：文件 "${filename}" 中未找到表格`)
  }

  const table = tables[0]
  const rows = getElements(table, 'tr')

  if (rows.length < 12) {
    throw new Error(
      `无法识别的量表格式：文件 "${filename}" 中表格行数不足（期望 >= 12，实际 ${rows.length}）`
    )
  }

  // 预检测：至少要包含 ☑ 或 □
  const fullXml = body.textContent ?? ''
  if (!/[☑□]/.test(fullXml)) {
    throw new Error(
      `无法识别的量表格式：文件 "${filename}" 中未检测到勾选标记（☑/□）`
    )
  }

  const modules: ParsedModule[] = []
  let currentModuleName = ''
  let currentModule: ParsedModule | null = null

  // 行 3-12（索引 2-11）是数据行
  for (let i = 2; i <= 11; i++) {
    const row = rows[i]
    const cells = getElements(row, 'tc')

    // 跳过空行
    if (cells.length === 0) continue

    let logicalCol = 0
    let col1Text = ''
    let col2Text = ''
    let col3Text = ''
    let col5Text = ''

    for (let c = 0; c < cells.length; c++) {
      const tc = cells[c]
      const span = getGridSpan(tc)

      if (logicalCol === 0) {
        col1Text = extractCellText(tc)
      }
      if (logicalCol <= 1 && logicalCol + span > 1) {
        col2Text = extractCellText(tc)
      }
      if (logicalCol <= 2 && logicalCol + span > 2) {
        col3Text = extractCellText(tc)
      }
      if (logicalCol <= 4 && logicalCol + span > 4) {
        col5Text = extractCellText(tc)
      }

      logicalCol += span
    }

    // 第 1 列 vMerge 状态机：模块名
    const vMerge = getVMerge(cells[0])
    if (vMerge === 'restart') {
      currentModuleName = col1Text.replace(/[\s\n]+/g, '').trim()
      currentModule = { name: currentModuleName, indicators: [] }
      modules.push(currentModule)
    } else if (vMerge === 'continue') {
      // 保持当前模块
    } else {
      const moduleText = col1Text.replace(/[\s\n]+/g, '').trim()
      if (moduleText) {
        currentModuleName = moduleText
        currentModule = { name: currentModuleName, indicators: [] }
        modules.push(currentModule)
      }
    }

    const indicatorName = col2Text.trim()
    const indicatorContent = col3Text.trim()

    if (!indicatorName || !currentModule) continue

    const { checkedLevels, allLevels } = extractCheckedLevels(col5Text)

    const indicator: ParsedIndicator = {
      name: indicatorName,
      content: indicatorContent,
      checkedLevels,
      allLevels,
    }

    currentModule.indicators.push(indicator)
  }

  if (modules.length === 0) {
    throw new Error(`无法识别的量表格式：文件 "${filename}" 中未提取到有效模块数据`)
  }

  return {
    filename,
    group,
    modules,
  }
}

/**
 * 浏览器端 .docx 文件解析 composable。
 * 使用 JSZip 解压 + DOMParser 解析 Word XML 表格。
 */
export function useDocxParser() {
  /**
   * 解析单个 .docx 文件
   * @param file - 用户上传的 .docx 文件
   * @param group - 文件分组（创新组 / 传统组）
   * @returns 解析后的结构化文档数据
   */
  const parseFile = async (file: File, group: GroupType): Promise<ParsedDocument> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)

      const docXmlFile = zip.file('word/document.xml')
      if (!docXmlFile) {
        throw new Error(`无法识别的文件格式：文件 "${file.name}" 不是有效的 .docx 文件（缺少 word/document.xml）`)
      }

      const xmlString = await docXmlFile.async('text')

      const parser = new DOMParser()
      const doc = parser.parseFromString(xmlString, 'application/xml')

      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        throw new Error(`文件 "${file.name}" XML 解析失败：${parseError.textContent}`)
      }

      const bodies = getElements(doc.documentElement, 'body')
      if (bodies.length === 0) {
        throw new Error(`无法识别的量表格式：文件 "${file.name}" 中未找到文档主体`)
      }

      return parseTable(bodies[0], file.name, group)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('无法识别')) {
        throw error
      }
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`解析文件 "${file.name}" 时出错：${message}`)
    }
  }

  return { parseFile }
}
