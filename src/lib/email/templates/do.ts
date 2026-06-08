import { emailLayout, tableRow } from '.'

interface DoData {
  nomor: string
  tanggal: string
  customerNama: string
  keterangan?: string
}

interface CompanyData {
  company_nama?: string
}

export function doEmailHtml(data: DoData, company: CompanyData, picNama: string): string {
  return emailLayout(`
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Kepada Yth. <strong>${picNama}</strong>,</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Bersama ini kami informasikan bahwa pesanan Anda telah <strong>dikirim</strong> dengan detail sebagai berikut:</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0">
      ${tableRow('Nomor DO', data.nomor)}
      ${tableRow('Tanggal', data.tanggal)}
      ${tableRow('Customer', data.customerNama)}
      ${data.keterangan ? tableRow('Keterangan', data.keterangan) : ''}
    </table>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">Mohon untuk melakukan pengecekan dan konfirmasi penerimaan barang. Hubungi kami bila ada ketidaksesuaian.</p>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;line-height:1.6">Terima kasih atas kepercayaan dan kerjasamanya.</p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.6">Hormat kami,<br><strong>${company.company_nama ?? 'ERP RRI'}</strong></p>
  `, `Pengiriman: ${data.nomor}`)
}
