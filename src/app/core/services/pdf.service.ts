import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Invoice } from '../../shared/models/invoice.model';
import { Profile } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class PdfService {

  private async imageToBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async buildPdf(invoice: Invoice, profile: Profile | null): Promise<jsPDF> {
    const doc = new jsPDF();

    const indigoDark:   [number,number,number] = [67,  56,  202];
    const indigoMid:    [number,number,number] = [99,  102, 241];
    const indigoLight:  [number,number,number] = [199, 210, 254];
    const indigoXLight: [number,number,number] = [224, 231, 255];
    const violetLight:  [number,number,number] = [237, 233, 254];
    const dark:         [number,number,number] = [30,  41,  59];
    const gray:         [number,number,number] = [100, 116, 139];
    const lightGray:    [number,number,number] = [248, 250, 252];
    const white:        [number,number,number] = [255, 255, 255];

    // Cabecera degradada
    const headerH = 48;
    const steps = 12;
    for (let s = 0; s < steps; s++) {
      const t = s / (steps - 1);
      const r  = Math.round(indigoXLight[0] + (violetLight[0] - indigoXLight[0]) * t);
      const g2 = Math.round(indigoXLight[1] + (violetLight[1] - indigoXLight[1]) * t);
      const b  = Math.round(indigoXLight[2] + (violetLight[2] - indigoXLight[2]) * t);
      doc.setFillColor(r, g2, b);
      doc.rect(0, s * (headerH / steps), 210, headerH / steps + 0.5, 'F');
    }
    doc.setDrawColor(...indigoLight);
    doc.setLineWidth(0.8);
    doc.line(0, headerH, 210, headerH);

    // Logo
    let logoLoaded = false;
    if (profile?.logo_url) {
      try {
        const base64 = await this.imageToBase64(profile.logo_url);
        doc.addImage(base64, 'JPEG', 14, 7, 28, 28);
        logoLoaded = true;
      } catch { /* sin logo */ }
    }

    // Datos empresa
    const textX = logoLoaded ? 48 : 14;
    doc.setFontSize(15); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...indigoDark);
    doc.text(profile?.company_name || 'Mi Empresa', textX, 18);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    if (profile?.cif_nif) doc.text(`CIF/NIF: ${profile.cif_nif}`, textX, 25);
    if (profile?.address)  doc.text(profile.address, textX, 31);
    if (profile?.province) doc.text(profile.province, textX, 37);

    // FACTURA derecha
    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...indigoDark);
    doc.text('FACTURA', 196, 18, { align: 'right' });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.setTextColor(...indigoMid);
    doc.text(`Nº ${invoice.invoice_number}`, 196, 27, { align: 'right' });
    doc.setTextColor(...gray);
    doc.text(`Fecha: ${invoice.issue_date}`, 196, 34, { align: 'right' });

    // Bloque cliente
    let y = headerH + 14;
    doc.setFillColor(...indigoXLight);
    doc.roundedRect(14, y - 6, 90, 38, 3, 3, 'F');
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.setTextColor(...indigoMid);
    doc.text('CLIENTE', 18, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...dark); doc.setFontSize(10);
    doc.text(invoice.client?.name || 'N/A', 18, y);
    y += 6;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...gray);
    if (invoice.client?.cif_nif) { doc.text(`CIF/NIF: ${invoice.client.cif_nif}`, 18, y); y += 5; }
    if (invoice.client?.address) { doc.text(invoice.client.address, 18, y); y += 5; }
    if (invoice.client?.province) { doc.text(invoice.client.province, 18, y); y += 5; }

    // Tabla
    y = headerH + 56;
    doc.setFillColor(...indigoLight);
    doc.roundedRect(14, y - 6, 182, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...indigoDark);
    doc.text('DESCRIPCIÓN', 18, y);
    doc.text('CANT.', 128, y, { align: 'right' });
    doc.text('PRECIO UNIT.', 160, y, { align: 'right' });
    doc.text('TOTAL', 196, y, { align: 'right' });
    y += 11;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    let rowAlt = false;
    if (invoice.items) {
      for (const item of invoice.items) {
        if (rowAlt) {
          doc.setFillColor(...lightGray);
          doc.rect(14, y - 6, 182, 9, 'F');
        }
        rowAlt = !rowAlt;
        doc.setTextColor(...dark);
        doc.text(item.description, 18, y);
        doc.setTextColor(...gray);
        doc.text(item.quantity?.toString() || '1', 128, y, { align: 'right' });
        doc.text(`${Number(item.unit_price).toFixed(2)} €`, 160, y, { align: 'right' });
        doc.setTextColor(...dark);
        doc.text(`${Number(item.total).toFixed(2)} €`, 196, y, { align: 'right' });
        y += 9;
      }
    }

    doc.setDrawColor(...indigoLight); doc.setLineWidth(0.6);
    doc.line(14, y, 196, y);
    y += 10;

    // Totales
    const totX = 122;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.setTextColor(...gray);
    doc.text('Subtotal:', totX, y);
    doc.setTextColor(...dark);
    doc.text(`${Number(invoice.subtotal).toFixed(2)} €`, 196, y, { align: 'right' });
    y += 8;
    doc.setTextColor(...gray);
    doc.text(`IVA (${invoice.tax_rate || 21}%):`, totX, y);
    doc.setTextColor(...dark);
    doc.text(`${Number(invoice.tax_amount).toFixed(2)} €`, 196, y, { align: 'right' });
    y += 4;

    // Fila TOTAL degradada
    const totalBoxH = 12;
    const totalSteps = 8;
    for (let s = 0; s < totalSteps; s++) {
      const t = s / (totalSteps - 1);
      const r  = Math.round(indigoXLight[0] + (violetLight[0] - indigoXLight[0]) * t);
      const g2 = Math.round(indigoXLight[1] + (violetLight[1] - indigoXLight[1]) * t);
      const b  = Math.round(indigoXLight[2] + (violetLight[2] - indigoXLight[2]) * t);
      doc.setFillColor(r, g2, b);
      doc.rect(totX - 4, y + s * (totalBoxH / totalSteps), 196 - totX + 8, totalBoxH / totalSteps + 0.5, 'F');
    }
    doc.setDrawColor(...indigoLight); doc.setLineWidth(0.4);
    doc.roundedRect(totX - 4, y, 196 - totX + 8, totalBoxH, 2, 2, 'S');
    y += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...indigoDark);
    doc.text('TOTAL:', totX, y);
    doc.text(`${Number(invoice.total).toFixed(2)} €`, 196, y, { align: 'right' });

    // Datos bancarios
    if (invoice.bank_account) {
      y += 14;
      doc.setFillColor(...indigoXLight);
      doc.roundedRect(14, y - 6, 182, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...indigoMid);
      doc.text('DATOS BANCARIOS', 18, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...dark);
      doc.text(invoice.bank_account, 18, y + 6);
    }

    // Pie
    doc.setDrawColor(...indigoLight); doc.setLineWidth(0.4);
    doc.line(14, 282, 196, 282);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...gray);
    doc.text('Gracias por su confianza.', 105, 287, { align: 'center' });

    return doc;
  }

  async downloadPdf(invoice: Invoice, profile: Profile | null): Promise<void> {
    const doc = await this.buildPdf(invoice, profile);
    doc.save(`factura-${invoice.invoice_number}.pdf`);
  }

  async getPdfBase64(invoice: Invoice, profile: Profile | null): Promise<string> {
    const doc = await this.buildPdf(invoice, profile);
    return doc.output('datauristring').split(',')[1];
  }

  async getPreviewBlobUrl(invoice: Invoice, profile: Profile | null): Promise<string> {
    const doc = await this.buildPdf(invoice, profile);
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  }
}
