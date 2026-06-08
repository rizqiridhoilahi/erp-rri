import { emailLayout, tableRow } from '.'

interface InvoiceData {
  nomor: string
  tanggal: string
  customerNama: string
  top: string
  total: string
}

interface CompanyData {
  company_nama?: string
}

export function invoiceEmailHtml(data: InvoiceData, company: CompanyData, picNama: string): string {
  return emailLayout(`
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Kepada Yth. <strong>${picNama}</strong>,</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Bersama ini kami sampaikan Invoice dengan detail sebagai berikut:</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0">
      ${tableRow('Nomor Invoice', data.nomor)}
      ${tableRow('Tanggal', data.tanggal)}
      ${tableRow('Customer', data.customerNama)}
      ${tableRow('Term of Payment', data.top)}
      ${tableRow('Total', data.total)}
    </table>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Silakan lakukan pembayaran sesuai dengan terms yang tertera. Detail rekening terlampir pada dokumen invoice.</p>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;line-height:1.6">Terima kasih atas perhatian dan kerjasamanya.</p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6">Hormat kami,<br><strong>${company.company_nama ?? 'ERP RRI'}</strong></p>
  `, `Invoice: ${data.nomor}`)
}
