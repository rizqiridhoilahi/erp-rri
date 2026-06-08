import { emailLayout, tableRow } from '.'

interface CpoData {
  nomor: string
  tanggal: string
  customerNama: string
  nomorPoCustomer?: string
}

interface CompanyData {
  company_nama?: string
}

export function cpoEmailHtml(data: CpoData, company: CompanyData, picNama: string): string {
  return emailLayout(`
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Kepada Yth. <strong>${picNama}</strong>,</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Dengan ini kami mengonfirmasi bahwa Purchase Order berikut telah <strong>DEAL</strong> dan diterima:</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0">
      ${tableRow('Nomor PO', data.nomor)}
      ${data.nomorPoCustomer ? tableRow('Nomor PO Customer', data.nomorPoCustomer) : ''}
      ${tableRow('Tanggal', data.tanggal)}
      ${tableRow('Customer', data.customerNama)}
    </table>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Pesanan akan segera diproses. Kami akan menginformasikan perkembangan pengiriman lebih lanjut.</p>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;line-height:1.6">Terima kasih atas kepercayaan dan kerjasamanya.</p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6">Hormat kami,<br><strong>${company.company_nama ?? 'ERP RRI'}</strong></p>
  `, `PO Dikonfirmasi: ${data.nomor}`)
}
