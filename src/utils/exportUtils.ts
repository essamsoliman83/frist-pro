import { InspectionRecord } from '@/types';
import html2pdf from 'html2pdf.js';

export const exportInspectorReportToPDF = async (records: InspectionRecord[], fileName: string) => {
  console.log('Exporting inspector report to PDF:', records.length, 'records');
  
  const displayValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || '';
  };

  const generateViolationsHTML = (record: InspectionRecord) => {
    if (!record.inspectionResults) return '<p class="no-violations">لا توجد مخالفات مسجلة في هذا المحضر</p>';
    
    let html = '';
    let hasAnyContent = false;
    
    Object.entries(record.inspectionResults).forEach(([section, items]: [string, any]) => {
      if (section === 'inventoryManagement') {
        const inventoryData = items;
        
        const hasShortages = inventoryData.shortages && Array.isArray(inventoryData.shortages) && inventoryData.shortages.length > 0;
        const hasStagnant = inventoryData.stagnant && Array.isArray(inventoryData.stagnant) && inventoryData.stagnant.length > 0;
        const hasExpired = inventoryData.expired && Array.isArray(inventoryData.expired) && inventoryData.expired.length > 0;
        const hasRandomInventory = inventoryData.randomInventory && Array.isArray(inventoryData.randomInventory) && inventoryData.randomInventory.length > 0;
        
        if (hasShortages || hasStagnant || hasExpired || hasRandomInventory) {
          hasAnyContent = true;
          html += '<div class="section"><h3 class="section-title">إدارة المخزون</h3>';
          
          if (hasShortages) {
            html += `
              <div class="table-container">
                <h4 class="subsection-title">النواقص</h4>
                <table class="print-table">
                  <thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية المطلوبة</th></tr></thead>
                  <tbody>
            `;
            inventoryData.shortages.forEach((item: any) => {
              html += `<tr><td>${item.item || ''}</td><td>${item.unit || ''}</td><td>${item.requiredQuantity || ''}</td></tr>`;
            });
            html += '</tbody></table></div>';
          }
          
          if (hasStagnant) {
            html += `
              <div class="table-container">
                <h4 class="subsection-title">الرواكد</h4>
                <table class="print-table">
                  <thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية</th><th>تاريخ الانتهاء</th></tr></thead>
                  <tbody>
            `;
            inventoryData.stagnant.forEach((item: any) => {
              html += `<tr><td>${item.item || ''}</td><td>${item.unit || ''}</td><td>${item.quantity || ''}</td><td>${item.expiryDate || ''}</td></tr>`;
            });
            html += '</tbody></table></div>';
          }
          
          if (hasExpired) {
            html += `
              <div class="table-container">
                <h4 class="subsection-title">منتهي الصلاحية</h4>
                <table class="print-table">
                  <thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية</th><th>تاريخ الانتهاء</th></tr></thead>
                  <tbody>
            `;
            inventoryData.expired.forEach((item: any) => {
              html += `<tr><td>${item.item || ''}</td><td>${item.unit || ''}</td><td>${item.quantity || ''}</td><td>${item.expiryDate || ''}</td></tr>`;
            });
            html += '</tbody></table></div>';
          }
          
          if (hasRandomInventory) {
            html += `
              <div class="table-container">
                <h4 class="subsection-title">الجرد العشوائي</h4>
                <table class="print-table random-table">
                  <thead>
                    <tr>
                      <th>الصنف</th><th>الوحدة</th><th>رصيد الدفتر</th>
                      <th>المصروف</th><th>الرصيد الفعلي</th><th>العجز</th><th>الزيادة</th>
                    </tr>
                  </thead>
                  <tbody>
            `;
            inventoryData.randomInventory.forEach((item: any) => {
              html += `
                <tr>
                  <td>${item.item || ''}</td><td>${item.unit || ''}</td><td>${item.bookBalance || ''}</td>
                  <td>${item.dispensed || ''}</td><td>${item.actualBalance || ''}</td>
                  <td>${item.shortage || ''}</td><td>${item.surplus || ''}</td>
                </tr>
              `;
            });
            html += '</tbody></table></div>';
          }
          
          html += '</div>';
        }
      } else if (Array.isArray(items) && items.length > 0) {
        hasAnyContent = true;
        const sectionNames: { [key: string]: string } = {
          'humanResources': 'القوة البشرية',
          'documentsAndBooks': 'الدفاتر والمستندات',
          'dispensingPolicies': 'سياسات الصرف والقوائم',
          'storageAndHealth': 'الاشتراطات الصحية والتخزين',
          'securityAndSafety': 'الأمن والسلامة',
          'otherViolations': 'مخالفات أخرى'
        };
        
        html += `<div class="section"><h3 class="section-title">${sectionNames[section] || section}</h3>`;
        
        items.forEach((item: any, index: number) => {
          html += `
            <div class="violation-item">
              <div class="violation-number">المخالفة ${index + 1}</div>
              <div class="violation-details">
                <div><strong>المخالفة:</strong> ${item.violation || ''}</div>
                <div><strong>الإجراء المتخذ:</strong> ${item.actionTaken || ''}</div>
                <div><strong>المسؤول:</strong> ${item.responsible || ''}</div>
              </div>
            </div>
          `;
        });
        
        html += '</div>';
      }
    });
    
    if (!hasAnyContent) {
      return '<div class="no-violations">لا توجد مخالفات مسجلة في هذا المحضر</div>';
    }
    
    return html;
  };

  const generateRecordsHTML = () => {
    return records.map((record, index) => `
      <div class="record-page" ${index > 0 ? 'style="page-break-before: always;"' : ''}>
        <div class="page-header">
          <h1>محضر تفتيش صيدلي</h1>
          <div class="record-info">
            <div>رقم المحضر: ${record.serialNumber}</div>
            <div>التاريخ: ${record.basicData?.date || 'غير محدد'}</div>
          </div>
        </div>
        
        <div class="intro-section">
          <p>
            إنه في يوم <strong>${record.basicData?.day || 'غير محدد'}</strong> 
            الموافق <strong>${record.basicData?.date || 'غير محدد'}</strong> 
            في تمام الساعة <strong>${record.basicData?.time || 'غير محدد'}</strong>
            قمنا نحن <strong>${displayValue(record.basicData?.inspectorName || 'غير محدد')}</strong> 
            من مفتشي <strong>${displayValue(record.basicData?.workPlace || 'غير محدد')}</strong> 
            بالمرور على <strong>${record.basicData?.institutionName || 'غير محدد'}</strong> 
            ${record.basicData?.inspectionLocation ? `<strong>${record.basicData.inspectionLocation}</strong>` : ''}
            ${record.basicData?.presentPharmacist ? ` وتقابلنا مع <strong>${record.basicData.presentPharmacist}</strong>` : ''}
            وكان المرور بناءً على <strong>${record.basicData?.inspectionReason || 'التفتيش الدوري'}</strong>.
          </p>
        </div>
        
        <div class="content-section">
          ${generateViolationsHTML(record)}
        </div>
        
        ${record.recommendations && record.recommendations.trim() ? `
          <div class="recommendations-section">
            <h3>التوصيات</h3>
            <div class="recommendations-content">${record.recommendations}</div>
          </div>
        ` : ''}
        
        <div class="signatures-section">
          <h3>التواقيع</h3>
          <div class="signatures-grid">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">توقيع المفتش</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">توقيع مدير التفتيش الصيدلي</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">توقيع مدير إدارة الصيدلة</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>محاضر التفتيش الصيدلي</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { 
          font-family: 'Cairo', Arial, sans-serif;
          direction: rtl; 
          text-align: right;
          line-height: 1.6;
          color: #2c3e50;
          background: white;
          font-size: 14px;
          margin: 0;
        }
        
        .record-page {
          width: 100%;
          min-height: 100vh;
          padding: 25mm;
          background: white;
          position: relative;
        }
        
        .page-header {
          text-align: center;
          border-bottom: 2px solid #34495e;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .page-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 15px;
        }
        
        .record-info {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 600;
          color: #34495e;
        }
        
        .intro-section {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 20px;
          margin: 25px 0;
          line-height: 1.8;
          font-size: 15px;
          text-align: justify;
        }
        
        .content-section {
          margin: 30px 0;
        }
        
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #2c3e50;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 8px;
          text-align: center;
        }
        
        .table-container {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 13px;
          border: 1px solid #bdc3c7;
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #bdc3c7;
          padding: 8px;
          text-align: center;
        }
        
        .print-table th {
          background: #34495e;
          color: white;
          font-weight: 600;
          font-size: 12px;
        }
        
        .print-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .random-table th,
        .random-table td {
          font-size: 11px;
          padding: 6px;
        }
        
        .violation-item {
          margin-bottom: 15px;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          background: #fafafa;
          padding: 15px;
        }
        
        .violation-number {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #e74c3c;
        }
        
        .violation-details {
          padding: 15px;
        }
        
        .violation-field {
          margin-bottom: 10px;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .violation-field strong {
          color: #2c3e50;
          margin-left: 5px;
        }
        
        .no-violations {
          background: #d5f4e6;
          border: 1px solid #27ae60;
          border-radius: 5px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          font-size: 16px;
          color: #27ae60;
          font-weight: 600;
        }
        
        .recommendations-section {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .recommendations-section h3 {
          color: #856404;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ffeaa7;
        }
        
        .recommendations-content {
          color: #856404;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .signatures-section {
          margin-top: 40px;
          background: #f8f9fa;
          border-radius: 5px;
          padding: 25px;
          border: 1px solid #dee2e6;
        }
        
        .signatures-section h3 {
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          color: #2c3e50;
          margin-bottom: 25px;
          padding-bottom: 10px;
          border-bottom: 1px solid #34495e;
        }
        
        .signatures-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          margin-top: 25px;
        }
        
        .signature-box {
          text-align: center;
          background: white;
          padding: 20px 15px;
          border-radius: 5px;
          border: 1px solid #dee2e6;
        }
        
        .signature-line {
          height: 2px;
          background: #2c3e50;
          margin: 30px 0 10px 0;
          border-radius: 1px;
        }
        
        .signature-label {
          font-size: 12px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            font-size: 12px;
            background: white;
          }
          
          .record-page { 
            page-break-after: always; 
            margin: 0; 
            padding: 15mm;
            min-height: auto;
          }
          
          .record-page:last-child { 
            page-break-after: avoid; 
          }
          
          .section,
          .violation-item,
          .recommendations-section,
          .signatures-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .print-table {
            page-break-before: auto;
            page-break-after: auto;
          }
          
          .print-table thead {
            display: table-header-group;
          }
          
          .print-table tbody {
            display: table-row-group;
          }
          
          .signatures-grid {
            display: flex;
            justify-content: space-around;
          }
          
          .signature-box {
            width: 150px;
          }
        }
      </style>
    </head>
    <body>
      ${generateRecordsHTML()}
    </body>
    </html>
  `;

  try {
    console.log('Creating PDF...');
    
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${fileName}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait'
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] 
      }
    };

    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.width = '210mm';
    element.style.backgroundColor = 'white';
    
    await html2pdf().set(options).from(element).save();
    
    console.log('PDF generated successfully!');
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Downloaded as HTML file as fallback');
    alert('حدث خطأ في إنشاء ملف PDF. تم تحميل الملف بصيغة HTML بدلاً من ذلك.');
  }
};

export const exportToTableFormat = (records: InspectionRecord[], fileName: string) => {
  console.log('Exporting records to table format:', records.length, 'records');
  
  const displayValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || '';
  };

  const extractViolationsData = (record: InspectionRecord) => {
    const violations: { violation: string; actionTaken: string }[] = [];
    
    if (record.inspectionResults) {
      Object.entries(record.inspectionResults).forEach(([section, items]: [string, any]) => {
        if (section === 'inventoryManagement') {
          const inventoryData = items;
          
          if (inventoryData.shortages && inventoryData.shortages.length > 0) {
            inventoryData.shortages.forEach((item: any) => {
              violations.push({
                violation: `نقص في المخزون: ${item.item} (${item.requiredQuantity} ${item.unit})`,
                actionTaken: 'تسجيل النقص والطلب من المورد'
              });
            });
          }
          
          if (inventoryData.stagnant && inventoryData.stagnant.length > 0) {
            inventoryData.stagnant.forEach((item: any) => {
              violations.push({
                violation: `أصناف راكدة: ${item.item} (${item.quantity} ${item.unit}) - انتهاء ${item.expiryDate}`,
                actionTaken: 'مراجعة سياسة الطلب وتقليل الكميات'
              });
            });
          }
          
          if (inventoryData.expired && inventoryData.expired.length > 0) {
            inventoryData.expired.forEach((item: any) => {
              violations.push({
                violation: `أصناف منتهية الصلاحية: ${item.item} (${item.quantity} ${item.unit}) - انتهت ${item.expiryDate}`,
                actionTaken: 'إتلاف الأصناف منتهية الصلاحية فوراً'
              });
            });
          }
          
          if (inventoryData.randomInventory && inventoryData.randomInventory.length > 0) {
            inventoryData.randomInventory.forEach((item: any) => {
              if (item.shortage && parseFloat(item.shortage) > 0) {
                violations.push({
                  violation: `عجز في الجرد العشوائي: ${item.item} - عجز ${item.shortage} ${item.unit}`,
                  actionTaken: 'تحديد أسباب العجز واتخاذ الإجراءات التصحيحية'
                });
              }
              if (item.surplus && parseFloat(item.surplus) > 0) {
                violations.push({
                  violation: `زيادة في الجرد العشوائي: ${item.item} - زيادة ${item.surplus} ${item.unit}`,
                  actionTaken: 'مراجعة إجراءات التسجيل والقيد'
                });
              }
            });
          }
        } else if (Array.isArray(items) && items.length > 0) {
          items.forEach((item: any) => {
            if (item.violation) {
              violations.push({
                violation: item.violation,
                actionTaken: item.actionTaken || 'لم يتم تحديد إجراء'
              });
            }
          });
        }
      });
    }
    
    return violations;
  };

  const generateTableHTML = () => {
    let tableRows = '';
    let rowNumber = 1;
    
    records.forEach(record => {
      const violations = extractViolationsData(record);
      const violationsCount = violations.length || 1;
      
      if (violations.length === 0) {
        tableRows += `
          <tr class="no-violations-row">
            <td class="row-number">${rowNumber}</td>
            <td class="institution-name">${record.basicData?.institutionName || ''}</td>
            <td class="location">${record.basicData?.inspectionLocation || ''}</td>
            <td class="date">${record.basicData?.date || ''}</td>
            <td class="inspector">${displayValue(record.basicData?.inspectorName || '')}</td>
            <td class="workplace">${displayValue(record.basicData?.workPlace || '')}</td>
            <td class="no-violations">لا توجد مخالفات</td>
            <td class="no-actions">-</td>
            <td class="notes"></td>
          </tr>
        `;
        rowNumber++;
      } else {
        violations.forEach((violation, index) => {
          tableRows += `
            <tr class="violation-row">
              ${index === 0 ? `<td rowspan="${violationsCount}" class="row-number merged-cell">${rowNumber}</td>` : ''}
              ${index === 0 ? `<td rowspan="${violationsCount}" class="institution-name merged-cell">${record.basicData?.institutionName || ''}</td>` : ''}
              ${index === 0 ? `<td rowspan="${violationsCount}" class="location merged-cell">${record.basicData?.inspectionLocation || ''}</td>` : ''}
              ${index === 0 ? `<td rowspan="${violationsCount}" class="date merged-cell">${record.basicData?.date || ''}</td>` : ''}
              ${index === 0 ? `<td rowspan="${violationsCount}" class="inspector merged-cell">${displayValue(record.basicData?.inspectorName || '')}</td>` : ''}
              ${index === 0 ? `<td rowspan="${violationsCount}" class="workplace merged-cell">${displayValue(record.basicData?.workPlace || '')}</td>` : ''}
              <td class="violation-text">${violation.violation}</td>
              <td class="action-text">${violation.actionTaken}</td>
              <td class="notes"></td>
            </tr>
          `;
        });
        rowNumber++;
      }
    });
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير محاضر التفتيش - جدول</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Cairo', Arial, sans-serif;
            direction: rtl;
            margin: 20px;
            font-size: 14px;
            line-height: 1.6;
            color: #2c3e50;
            background: #f8f9fa;
          }
          
          .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .header {
            background: #34495e;
            color: white;
            padding: 25px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .header .subtitle {
            font-size: 16px;
            font-weight: 400;
            opacity: 0.9;
          }
          
          .info-section {
            background: #ecf0f1;
            padding: 20px;
            border-bottom: 2px solid #34495e;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .info-item {
            background: white;
            padding: 12px 15px;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 3px solid #34495e;
          }
          
          .info-label {
            font-weight: 600;
            color: #7f8c8d;
            font-size: 12px;
            margin-bottom: 3px;
          }
          
          .info-value {
            font-weight: 700;
            color: #2c3e50;
            font-size: 14px;
          }
          
          .table-container {
            padding: 20px;
            overflow-x: auto;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            font-size: 13px;
            background: white;
            border: 1px solid #bdc3c7;
          }
          
          thead {
            background: #34495e;
            color: white;
          }
          
          th {
            padding: 12px 10px;
            text-align: center;
            font-weight: 600;
            font-size: 13px;
            border: 1px solid #2c3e50;
          }
          
          td {
            padding: 10px 8px;
            border: 1px solid #bdc3c7;
            vertical-align: top;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .row-number {
            background: #ecf0f1;
            font-weight: 700;
            color: #2c3e50;
            text-align: center;
            width: 50px;
            border-left: 2px solid #34495e;
          }
          
          .merged-cell {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            border-left: 2px solid #34495e;
          }
          
          .institution-name {
            font-weight: 600;
            color: #2c3e50;
            min-width: 120px;
          }
          
          .location {
            color: #7f8c8d;
            min-width: 100px;
          }
          
          .date {
            color: #7f8c8d;
            min-width: 80px;
            text-align: center;
          }
          
          .inspector {
            color: #7f8c8d;
            min-width: 100px;
          }
          
          .workplace {
            color: #7f8c8d;
            min-width: 100px;
          }
          
          .violation-text {
            text-align: right;
            max-width: 250px;
            word-wrap: break-word;
            line-height: 1.5;
            color: #e74c3c;
            font-weight: 500;
          }
          
          .action-text {
            text-align: right;
            max-width: 200px;
            word-wrap: break-word;
            line-height: 1.5;
            color: #27ae60;
            font-weight: 500;
          }
          
          .notes {
            min-width: 80px;
            background: #f8f9fa;
          }
          
          .no-violations {
            text-align: center;
            color: #27ae60;
            font-weight: 600;
            font-style: italic;
          }
          
          .no-actions {
            text-align: center;
            color: #95a5a6;
            font-weight: 600;
          }
          
          .violation-row:nth-child(even) td {
            background-color: #f8f9fa;
          }
          
          .no-violations-row {
            background: #d5f4e6;
          }
          
          .footer {
            background: #ecf0f1;
            padding: 15px;
            text-align: center;
            border-top: 2px solid #34495e;
          }
          
          .footer p {
            color: #7f8c8d;
            font-size: 12px;
            margin: 3px 0;
          }
          
          .generation-time {
            color: #2c3e50;
            font-weight: 600;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 10px; 
              font-size: 11px;
              background: white;
            }
            
            .container {
              box-shadow: none;
              border-radius: 0;
            }
            
            table { 
              font-size: 10px;
              page-break-inside: auto;
            }
            
            th, td { 
              padding: 6px 4px;
              border: 1px solid #000 !important;
            }
            
            .merged-cell {
              background: #f0f0f0 !important;
            }
          }
          
          @media (max-width: 768px) {
            body { margin: 10px; font-size: 12px; }
            .header { padding: 20px 15px; }
            .header h1 { font-size: 20px; }
            .table-container { padding: 10px; }
            table { font-size: 11px; }
            th, td { padding: 8px 6px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>تقرير محاضر التفتيش الصيدلي</h1>
            <div class="subtitle">إدارة الصيدلة - مديرية الصحة بكفر الشيخ</div>
          </div>
          
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">تاريخ التقرير</div>
                <div class="info-value">${new Date().toLocaleDateString('ar-EG')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">عدد المحاضر</div>
                <div class="info-value">${records.length} محضر</div>
              </div>
              <div class="info-item">
                <div class="info-label">وقت الإنشاء</div>
                <div class="info-value">${new Date().toLocaleTimeString('ar-EG')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">نوع التقرير</div>
                <div class="info-value">جدول تفصيلي</div>
              </div>
            </div>
          </div>
          
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>م</th>
                  <th>اسم المؤسسة</th>
                  <th>مكان التفتيش</th>
                  <th>التاريخ</th>
                  <th>اسم المفتش</th>
                  <th>جهة العمل</th>
                  <th>المخالفة</th>
                  <th>الإجراء المتخذ</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p class="generation-time">تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-EG')}</p>
            <p>نظام إدارة محاضر التفتيش الصيدلي - إدارة الصيدلة بكفر الشيخ</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const htmlContent = generateTableHTML();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.href = url;
  a.download = `${fileName}_جدول.html`;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('Table format exported successfully');
};

export const exportToExcel = (records: InspectionRecord[], fileName: string) => {
  console.log('Exporting inspector report to Excel (CSV):', records.length, 'records');
  
  const extractViolationsData = (record: InspectionRecord) => {
    const violations: string[] = [];
    const actions: string[] = [];
    
    if (record.inspectionResults) {
      Object.entries(record.inspectionResults).forEach(([section, items]: [string, any]) => {
        if (section === 'inventoryManagement') {
          const inventoryData = items;
          
          if (inventoryData.shortages && inventoryData.shortages.length > 0) {
            inventoryData.shortages.forEach((item: any) => {
              violations.push(`نقص في المخزون: ${item.item} (${item.requiredQuantity} ${item.unit})`);
              actions.push(`تسجيل النقص والطلب من المورد`);
            });
          }
          
          if (inventoryData.stagnant && inventoryData.stagnant.length > 0) {
            inventoryData.stagnant.forEach((item: any) => {
              violations.push(`أصناف راكدة: ${item.item} (${item.quantity} ${item.unit}) - انتهاء ${item.expiryDate}`);
              actions.push(`مراجعة سياسة الطلب وتقليل الكميات`);
            });
          }
          
          if (inventoryData.expired && inventoryData.expired.length > 0) {
            inventoryData.expired.forEach((item: any) => {
              violations.push(`أصناف منتهية الصلاحية: ${item.item} (${item.quantity} ${item.unit}) - انتهت ${item.expiryDate}`);
              actions.push(`إتلاف الأصناف منتهية الصلاحية فوراً`);
            });
          }
          
          if (inventoryData.randomInventory && inventoryData.randomInventory.length > 0) {
            inventoryData.randomInventory.forEach((item: any) => {
              if (item.shortage && parseFloat(item.shortage) > 0) {
                violations.push(`عجز في الجرد العشوائي: ${item.item} - عجز ${item.shortage} ${item.unit}`);
                actions.push(`تحديد أسباب العجز واتخاذ الإجراءات التصحيحية`);
              }
              if (item.surplus && parseFloat(item.surplus) > 0) {
                violations.push(`زيادة في الجرد العشوائي: ${item.item} - زيادة ${item.surplus} ${item.unit}`);
                actions.push(`مراجعة إجراءات التسجيل والقيد`);
              }
            });
          }
        } else if (Array.isArray(items) && items.length > 0) {
          items.forEach((item: any) => {
            if (item.violation) {
              violations.push(item.violation);
              actions.push(item.actionTaken || 'لم يتم تحديد إجراء');
            }
          });
        }
      });
    }
    
    return {
      violations: violations.join(' | '),
      actions: actions.join(' | ')
    };
  };
  
  const headers = [
    'رقم المحضر',
    'التاريخ',
    'اليوم',
    'اسم المفتش',
    'جهة العمل',
    'اسم المؤسسة',
    'مكان التفتيش',
    'المخالفات',
    'الإجراءات المتخذة'
  ];
  
  const csvData = records.map(record => {
    const violationsData = extractViolationsData(record);
    
    return [
      record.serialNumber || '',
      record.basicData.date || '',
      record.basicData.day || '',
      Array.isArray(record.basicData.inspectorName) 
        ? record.basicData.inspectorName.join(', ')
        : record.basicData.inspectorName || '',
      Array.isArray(record.basicData.workPlace) 
        ? record.basicData.workPlace.join(', ')
        : record.basicData.workPlace || '',
      record.basicData.institutionName || '',
      record.basicData.inspectionLocation || '',
      violationsData.violations || 'لا توجد مخالفات',
      violationsData.actions || 'لا توجد إجراءات'
    ];
  });
  
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers, ...csvData]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  
  console.log('Excel file download triggered successfully');
};

export const printRecord = (record: InspectionRecord) => {
  console.log('Starting print for record:', record.serialNumber);
  
  const displayValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || '';
  };

  const generateViolationsHTML = (record: InspectionRecord) => {
    if (!record.inspectionResults) return '<p style="text-align: center; color: #666;">لا توجد مخالفات مسجلة</p>';
    
    let html = '';
    let hasContent = false;
    
    Object.entries(record.inspectionResults).forEach(([section, items]: [string, any]) => {
      if (section === 'inventoryManagement') {
        const inventoryData = items;
        
        const hasShortages = inventoryData.shortages?.length > 0;
        const hasStagnant = inventoryData.stagnant?.length > 0;
        const hasExpired = inventoryData.expired?.length > 0;
        const hasRandomInventory = inventoryData.randomInventory?.length > 0;
        
        if (hasShortages || hasStagnant || hasExpired || hasRandomInventory) {
          hasContent = true;
          html += '<div class="section"><h3 class="section-title">إدارة المخزون</h3>';
          
          if (hasShortages) {
            html += `
              <div class="table-container">
                <h4 class="subsection-title">النواقص</h4>
                <table class="print-table">
                  <thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية المطلوبة</th></tr></thead>
                  <tbody>
            `;
            inventoryData.shortages.forEach((item: any) => {
              html += `<tr><td>${item.item || ''}</td><td>${item.unit || ''}</td><td>${item.requiredQuantity || ''}</td></tr>`;
            });
            html += '</tbody></table></div>';
          }
          
          if (hasStagnant) {
            html += `
              <div class="table-container">
                <h4 class="subsection-title">الرواكد</h4>
                <table class="print-table">
                  <thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية</th><th>تاريخ الانتهاء</th></tr></thead>
                  <tbody>
            `;
            inventoryData.stagnant.forEach((item: any) => {
              html += `<tr><td>${item.item || ''}</td><td>${item.unit || ''}</td><td>${item.quantity || ''}</td><td>${item.expiryDate || ''}</td></tr>`;
            });
            html += '</tbody></table></div>';
          }
          
          if (hasExpired) {
            html += `
              <div class="table-container">
                <h4 class="subsection-title">منتهي الصلاحية</h4>
                <table class="print-table">
                  <thead><tr><th>الصنف</th><th>الوحدة</th><th>الكمية</th><th>تاريخ الانتهاء</th></tr></thead>
                  <tbody>
            `;
            inventoryData.expired.forEach((item: any) => {
              html += `<tr><td>${item.item || ''}</td><td>${item.unit || ''}</td><td>${item.quantity || ''}</td><td>${item.expiryDate || ''}</td></tr>`;
            });
            html += '</tbody></table></div>';
          }
          
          if (hasRandomInventory) {
            html += `
              <div class="table-container">
                <h4 class="subsection-title">الجرد العشوائي</h4>
                <table class="print-table random-table">
                  <thead>
                    <tr>
                      <th>الصنف</th><th>الوحدة</th><th>رصيد الدفتر</th>
                      <th>المصروف</th><th>الرصيد الفعلي</th><th>العجز</th><th>الزيادة</th>
                    </tr>
                  </thead>
                  <tbody>
            `;
            inventoryData.randomInventory.forEach((item: any) => {
              html += `
                <tr>
                  <td>${item.item || ''}</td><td>${item.unit || ''}</td><td>${item.bookBalance || ''}</td>
                  <td>${item.dispensed || ''}</td><td>${item.actualBalance || ''}</td>
                  <td>${item.shortage || ''}</td><td>${item.surplus || ''}</td>
                </tr>
              `;
            });
            html += '</tbody></table></div>';
          }
          
          html += '</div>';
        }
      } else if (Array.isArray(items) && items.length > 0) {
        hasContent = true;
        const sectionNames: { [key: string]: string } = {
          'humanResources': 'القوة البشرية',
          'documentsAndBooks': 'الدفاتر والمستندات',
          'dispensingPolicies': 'سياسات الصرف والقوائم',
          'storageAndHealth': 'الاشتراطات الصحية والتخزين',
          'securityAndSafety': 'الأمن والسلامة',
          'otherViolations': 'مخالفات أخرى'
        };
        
        html += `<div class="section"><h3 class="section-title">${sectionNames[section] || section}</h3>`;
        
        items.forEach((item: any, index: number) => {
          html += `
            <div class="violation-item">
              <div class="violation-number">المخالفة ${index + 1}</div>
              <div class="violation-details">
                <div><strong>المخالفة:</strong> ${item.violation || ''}</div>
                <div><strong>الإجراء المتخذ:</strong> ${item.actionTaken || ''}</div>
                <div><strong>المسؤول:</strong> ${item.responsible || ''}</div>
              </div>
            </div>
          `;
        });
        
        html += '</div>';
      }
    });
    
    return hasContent ? html : '<p style="text-align: center; color: #666;">لا توجد مخالفات مسجلة</p>';
  };

  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>محضر تفتيش صيدلي - ${record.serialNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Cairo', Arial, sans-serif; 
          direction: rtl; 
          text-align: right;
          line-height: 1.6;
          font-size: 14px;
          color: #333;
          background: white;
          margin: 15px;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #2c3e50; 
          padding-bottom: 20px;
        }
        
        .header h1 {
          color: #2c3e50;
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .header .serial {
          font-size: 18px;
          color: #7f8c8d;
          font-weight: 600;
        }
        
        .intro-text {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 20px;
          margin: 25px 0;
          line-height: 1.8;
          font-size: 15px;
          text-align: justify;
        }
        
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #2c3e50;
          border-bottom: 2px solid #2c3e50;
          padding-bottom: 8px;
          text-align: center;
        }
        
        .subsection-title {
          font-size: 14px;
          font-weight: 600;
          margin: 15px 0 10px 0;
          color: #34495e;
          text-align: center;
          background: #ecf0f1;
          padding: 8px;
          border-radius: 3px;
        }
        
        .table-container {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 13px;
          border: 1px solid #bdc3c7;
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #bdc3c7;
          padding: 8px;
          text-align: center;
        }
        
        .print-table th {
          background: #34495e;
          color: white;
          font-weight: 600;
          font-size: 12px;
        }
        
        .print-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .random-table th,
        .random-table td {
          font-size: 11px;
          padding: 6px;
        }
        
        .violation-item {
          margin-bottom: 15px;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          background: #fafafa;
          padding: 15px;
        }
        
        .violation-number {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #e74c3c;
        }
        
        .violation-details div {
          margin: 8px 0;
          font-size: 14px;
        }
        
        .recommendations {
          margin: 25px 0;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 20px;
        }
        
        .recommendations h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #856404;
          text-align: center;
        }
        
        .signatures {
          margin-top: 60px;
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
        }
        
        .signature-box {
          text-align: center;
          border-top: 2px solid #000;
          padding-top: 10px;
          width: 180px;
          margin-top: 50px;
        }
        
        @media print {
          body { margin: 0; padding: 10px; font-size: 12px; }
          .section { page-break-inside: avoid; }
          .table-container { page-break-inside: avoid; }
          .print-table { page-break-before: auto; page-break-after: auto; }
          .print-table th, .print-table td { border: 1px solid #000 !important; }
          .signatures { page-break-inside: avoid; margin-top: 40px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>محضر تفتيش صيدلي</h1>
        <div class="serial">رقم المحضر: ${record.serialNumber}</div>
      </div>
      
      <div class="intro-text">
        <p>إنه في يوم <strong>${record.basicData?.day || 'غير محدد'}</strong> الموافق <strong>${record.basicData?.date || 'غير محدد'}</strong> في تمام الساعة <strong>${record.basicData?.time || 'غير محدد'}</strong> قمنا نحن <strong>${displayValue(record.basicData?.inspectorName || 'غير محدد')}</strong> من مفتشي <strong>${displayValue(record.basicData?.workPlace || 'غير محدد')}</strong> بالمرور على <strong>${record.basicData?.institutionName || 'غير محدد'}</strong> ${record.basicData?.inspectionLocation ? `<strong>${record.basicData.inspectionLocation}</strong>` : ''}${record.basicData?.presentPharmacist ? ` وتقابلنا مع <strong>${record.basicData.presentPharmacist}</strong>` : ''} وكان المرور بناءً على <strong>${record.basicData?.inspectionReason || 'غير محدد'}</strong>.</p>
      </div>
      
      ${generateViolationsHTML(record)}
      
      ${record.recommendations && record.recommendations.trim() ? `
        <div class="recommendations">
          <h3>التوصيات</h3>
          <div>${record.recommendations}</div>
        </div>
      ` : ''}
      
      <div class="signatures">
        <div class="signature-box">
          <div>توقيع المفتش</div>
        </div>
        <div class="signature-box">
          <div>توقيع مدير التفتيش الصيدلي</div>
        </div>
        <div class="signature-box">
          <div>توقيع مدير إدارة الصيدلة</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes');
  
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
    
    console.log('Print window opened successfully');
  } else {
    console.error('Could not open print window - popup blocked?');
    alert('لا يمكن فتح نافذة الطباعة. تأكد من السماح للنوافذ المنبثقة في المتصفح.');
  }
};
