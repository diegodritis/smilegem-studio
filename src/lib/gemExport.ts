import type { Gem } from '../store/useGemsStore'
import { jsPDF } from 'jspdf'

/**
 * Genera y descarga un archivo PNG con fondo transparente representando la gema individual.
 */
export function exportGemAsPNG(gem: Gem, fileName?: string) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.72

  ctx.clearRect(0, 0, size, size)

  // Sombra suave proyectada
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 35
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 15

  // Gradiente base de la gema según su color
  const grad = ctx.createRadialGradient(
    cx - radius * 0.3,
    cy - radius * 0.35,
    radius * 0.1,
    cx,
    cy,
    radius
  )

  const baseColor = gem.color || '#FFFFFF'
  grad.addColorStop(0, '#FFFFFF')
  grad.addColorStop(0.3, baseColor)
  grad.addColorStop(0.85, adjustBrightness(baseColor, -25))
  grad.addColorStop(1, adjustBrightness(baseColor, -55))

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Bisel facetado exterior
  ctx.save()
  ctx.lineWidth = 14
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.beginPath()
  ctx.arc(cx, cy, radius - 7, 0, Math.PI * 2)
  ctx.stroke()

  // Reflejo especular brillante estilo cristal Swarovski
  const highlightGrad = ctx.createLinearGradient(
    cx - radius * 0.5,
    cy - radius * 0.6,
    cx + radius * 0.3,
    cy + radius * 0.3
  )
  highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  highlightGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.4)')
  highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)')

  ctx.fillStyle = highlightGrad
  ctx.beginPath()
  ctx.ellipse(
    cx - radius * 0.3,
    cy - radius * 0.35,
    radius * 0.45,
    radius * 0.25,
    Math.PI / 4,
    0,
    Math.PI * 2
  )
  ctx.fill()

  // Estrella de destello destellante (sparkle)
  drawSparkle(ctx, cx + radius * 0.25, cy - radius * 0.3, 24)
  ctx.restore()

  // Descarga del archivo
  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = fileName || `smilegem-${gem.shape}-${gem.sizeCode || 'custom'}-${gem.id.slice(-5)}.png`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = 10

  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.quadraticCurveTo(x, y, x, y + r)
  ctx.quadraticCurveTo(x, y, x - r, y)
  ctx.quadraticCurveTo(x, y, x, y - r)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function adjustBrightness(hex: string, percent: number): string {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('')
  }
  const num = parseInt(cleanHex, 16)
  if (isNaN(num)) return hex

  let r = (num >> 16) + Math.round(255 * (percent / 100))
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100))
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100))

  r = Math.min(255, Math.max(0, r))
  g = Math.min(255, Math.max(0, g))
  b = Math.min(255, Math.max(0, b))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export interface PDFExportOptions {
  clientName?: string
  technicianName?: string
  studioName?: string
  notes?: string
}

/**
 * Exporta la ficha clínica completa en PDF de alta calidad con jsPDF (Fase 17).
 */
export function exportClinicalTechnicalSheetPDF(
  gems: Gem[],
  options: PDFExportOptions = {}
) {
  const {
    clientName = 'Cliente General',
    technicianName = 'SmileGem Master Artist',
    studioName = 'SmileGem Tooth Studio',
    notes = 'Aplicación estética no invasiva sobre esmalte intacto.',
  } = options

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()

  // 1. Barra superior de cabecera con estilo profesional
  doc.setFillColor(7, 9, 14) // #07090e
  doc.rect(0, 0, pageWidth, 32, 'F')

  doc.setFillColor(6, 182, 212) // #06b6d4 (Cyan)
  doc.rect(0, 31, pageWidth, 1.5, 'F')

  // Título y branding
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('SMILEGEM STUDIO', 14, 15)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184) // Slate-400
  doc.text('FICHA TÉCNICA CLÍNICA & PROTOCOLO DE COLOCACIÓN', 14, 22)

  const dateStr = new Date().toLocaleDateString()
  doc.text(`Fecha: ${dateStr}`, pageWidth - 14, 15, { align: 'right' })
  doc.text(studioName, pageWidth - 14, 22, { align: 'right' })

  // 2. Información del Paciente / Cliente y Profesional
  let y = 42

  doc.setFillColor(248, 250, 252) // Slate-50
  doc.setDrawColor(226, 232, 240) // Slate-200
  doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42) // Slate-900
  doc.text('DATOS DE LA SESIÓN', 18, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105) // Slate-600
  doc.text(`Cliente / Paciente:`, 18, y + 14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(clientName, 52, y + 14)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(`Técnico Especialista:`, 18, y + 20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(technicianName, 52, y + 20)

  // Duración estimada
  const estimatedTime = 15 + gems.length * 4
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(`Tiempo Estimado:`, 120, y + 14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(16, 185, 129) // Emerald
  doc.text(`~${estimatedTime} minutos`, 155, y + 14)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text(`Total Cristales:`, 120, y + 20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(6, 182, 212)
  doc.text(`${gems.length} piezas`, 155, y + 20)

  y += 32

  // 3. Tabla de Inventario de Materiales Dental
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text('INVENTARIO DE CRISTALES Y PIEZAS DENTALES', 14, y)

  y += 5

  // Cabecera de la tabla
  doc.setFillColor(30, 41, 59) // Slate-800
  doc.rect(14, y, pageWidth - 28, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('PIEZA (FDI)', 18, y + 5.5)
  doc.text('FORMA / ESTILO', 50, y + 5.5)
  doc.text('TALLA (SS)', 95, y + 5.5)
  doc.text('COLOR', 130, y + 5.5)
  doc.text('ACABADO', 165, y + 5.5)

  y += 8

  // Filas de gemas
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)

  gems.forEach((gem, idx) => {
    const isEven = idx % 2 === 0
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252)
    doc.rect(14, y, pageWidth - 28, 7, 'F')

    doc.setTextColor(15, 23, 42)
    const toothStr = gem.toothId.replace('tooth-', 'Diente #')
    doc.text(toothStr, 18, y + 5)
    doc.text(gem.shape.toUpperCase(), 50, y + 5)
    doc.text(`${gem.sizeCode || 'SS3'} (${(1.4 * gem.scale).toFixed(1)}mm)`, 95, y + 5)

    // Cuadrito de color preview
    doc.setFillColor(gem.color || '#FFFFFF')
    doc.setDrawColor(203, 213, 225)
    doc.rect(130, y + 1.5, 4, 4, 'FD')
    doc.setTextColor(71, 85, 105)
    doc.text(gem.color || '#FFFFFF', 136, y + 4.8)

    doc.text((gem.finish || 'solid').toUpperCase(), 165, y + 5)

    y += 7
  })

  y += 8

  // 4. Protocolo Clínico Certificado
  doc.setFillColor(241, 245, 249) // Slate-100
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(14, y, pageWidth - 28, 48, 3, 3, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(15, 23, 42)
  doc.text('PROTOCOLO CLÍNICO RECOMENDADO DE ADHESIÓN', 18, y + 7)

  const steps = [
    '1. Aislamiento relativo con eyector y rollos de algodón (o dique de goma)',
    '2. Profilaxis con copa de goma y piedra pómez fina (sin flúor ni aceites)',
    '3. Grabado ácido con ácido ortofosfórico al 37% por 20 a 30 segundos',
    '4. Lavado exhaustivo durante 30s y secado con aire libre de aceite hasta patrón blanco tiza',
    '5. Aplicación de adhesivo dental monocomponente fotopolimerizable',
    '6. Asentamiento del cristal con resina fluida de composite y fotocurado de 40 seg (>=1200 mW/cm²)',
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)

  steps.forEach((step, sIdx) => {
    doc.text(step, 18, y + 13 + sIdx * 5.5)
  })

  y += 54

  // 5. Notas Clínicas & Garantía
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text('NOTAS Y RECOMENDACIONES POST-APLICACIÓN', 14, y)

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105)
  doc.text(notes, 14, y, { maxWidth: pageWidth - 28 })

  // 6. Pie de Página y Firmas
  const footerY = 275
  doc.setDrawColor(226, 232, 240)
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5)

  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text(
    'Ficha técnica generada por SmileGem Studio. Materiales bio-compatibles y procedimiento 100% reversible.',
    14,
    footerY
  )
  doc.text('Firma Profesional: ________________________', pageWidth - 14, footerY, { align: 'right' })

  // Descarga del PDF
  const filename = `ficha-clinica-smilegem-${Date.now()}.pdf`
  doc.save(filename)
}

