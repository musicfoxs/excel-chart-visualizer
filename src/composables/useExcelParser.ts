import { ref, type Ref } from 'vue'
import * as XLSX from 'xlsx'
import type { DataBlock, ParseResult } from '../types'

export function useExcelParser() {
  const result: Ref<ParseResult> = ref({
    status: 'idle',
    data: [],
    error: null
  })

  const parseFile = async (file: File): Promise<void> => {
    result.value = {
      status: 'loading',
      data: [],
      error: null
    }

    if (!file.name.endsWith('.xlsx')) {
      result.value = {
        status: 'error',
        data: [],
        error: '仅支持 .xlsx 格式的文件'
      }
      return
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        throw new Error('Excel 文件中没有找到工作表')
      }
      
      const worksheet = workbook.Sheets[sheetName]
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        defval: '' 
      }) as unknown[][]

      const dataBlocks: DataBlock[] = []
      let currentBlock: DataBlock | null = null

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i]
        const firstCell = String(row[0] || '').trim()

        if (firstCell.includes('人数分布')) {
          if (currentBlock && currentBlock.labels.length > 0) {
            dataBlocks.push(currentBlock)
          }
          
          currentBlock = {
            title: firstCell,
            labels: [],
            traditional: [],
            innovative: []
          }
        } else if (currentBlock && firstCell) {
          currentBlock.labels.push(firstCell)
          
          const traditionalValue = row[1]
          if (typeof traditionalValue === 'number') {
            currentBlock.traditional.push(traditionalValue)
          } else if (typeof traditionalValue === 'string') {
            const parsed = parseFloat(traditionalValue)
            currentBlock.traditional.push(isNaN(parsed) ? 0 : parsed)
          } else {
            currentBlock.traditional.push(0)
          }

          const innovativeValue = row[2]
          if (typeof innovativeValue === 'number') {
            currentBlock.innovative.push(innovativeValue)
          } else if (typeof innovativeValue === 'string') {
            const parsed = parseFloat(innovativeValue)
            currentBlock.innovative.push(isNaN(parsed) ? 0 : parsed)
          } else {
            currentBlock.innovative.push(0)
          }
        } else if (!firstCell && currentBlock) {
          if (currentBlock.labels.length > 0) {
            dataBlocks.push(currentBlock)
          }
          currentBlock = null
        }
      }

      if (currentBlock && currentBlock.labels.length > 0) {
        dataBlocks.push(currentBlock)
      }

      if (dataBlocks.length === 0) {
        throw new Error('未找到有效数据块，请确保文件包含"人数分布"关键词')
      }

      result.value = {
        status: 'success',
        data: dataBlocks,
        error: null
      }

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '文件解析失败，请检查文件格式'
      
      result.value = {
        status: 'error',
        data: [],
        error: errorMessage
      }
    }
  }

  const reset = (): void => {
    result.value = {
      status: 'idle',
      data: [],
      error: null
    }
  }

  return {
    result,
    parseFile,
    reset
  }
}