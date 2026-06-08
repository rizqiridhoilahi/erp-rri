import { emailLayout, tableRow } from '.'

interface QuotationData {
  nomor: string
  perihal: string
  tanggal: string
  customerNama: string
}

interface CompanyData {
  company_nama?: string
}

export function quotationEmailHtml(data: QuotationData, company: CompanyData, picNama: string): string {
  return emailLayout(`
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Kepada Yth. <strong>${picNama}</strong>,</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Bersama ini kami sampaikan Quotation dengan detail sebagai berikut:</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0">
      ${tableRow('Nomor', data.nomor)}
      ${tableRow('Perihal', data.perihal)}
      ${tableRow('Tanggal', data.tanggal)}
      ${tableRow('Customer', data.customerNama)}
    </table>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Silakan akses dokumen lengkap melalui portal customer RRI atau hubungi kami untuk detail lebih lanjut.</p>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;line-height:1.6">Terima kasih atas perhatian dan kerjasamanya.</p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6">Hormat kami,<br><strong>${company.company_nama ?? 'ERP RRI'}</strong></p>
  `, `Quotation: ${data.nomor}`)
}
