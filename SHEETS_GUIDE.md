# PANDUAN INTEGRASI SINKRONISASI GOOGLE SHEETS - SAFA-NET

Integrasi ini menghubungkan aplikasi SAFA-NET Anda secara langsung ke file Google Spreadsheet:
https://docs.google.com/spreadsheets/d/1HlQdRLMl9PhfGe7HAAGQSX4aoUxhGeWG/edit

Setiap kali Petugas/Teknisi menekan tombol **Lunas**, data pembayaran akan langsung masuk ke kolom yang sesuai di Google Sheets (KELILING, KANTOR, atau TRANSFER) berdasarkan bulan berjalan, dan kolom BELUM BAYAR akan otomatis dikosongkan tanpa merusak format bawaan atasan Anda!

---

## 🛠️ Langkah 1: Pasang Kode Apps Script di Google Sheets

1. Buka spreadsheet Anda di browser.
2. Pada menu atas, klik **Extensions** (Ekstensi) > **Apps Script**.
3. Hapus seluruh kode bawaan yang ada di editor tersebut, lalu tempelkan (*copy-paste*) seluruh kode di bawah ini:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "payment"; // "payment", "edit", "delete"
    var noUrut = data.no_urut_excel;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    
    // --- AKSI 1: EDIT DATA PELANGGAN ---
    if (action === "edit") {
      var name = data.name;
      var address = data.address;
      var packageName = data.package;
      var price = data.price;
      var phone = data.phone;
      
      var successCount = 0;
      
      // Update data di seluruh tab bulan agar seragam
      for (var s = 0; s < sheets.length; s++) {
        var sheet = sheets[s];
        var lastRow = sheet.getLastRow();
        if (lastRow < 1) continue;
        var range = sheet.getRange(1, 1, lastRow, 1);
        var values = range.getValues();
        
        for (var i = 0; i < values.length; i++) {
          if (values[i][0] == noUrut) {
            var row = i + 1;
            if (name !== undefined) sheet.getRange(row, 2).setValue(name);          // Kolom B (Nama)
            if (address !== undefined) sheet.getRange(row, 3).setValue(address);      // Kolom C (Alamat)
            if (packageName !== undefined) sheet.getRange(row, 4).setValue(packageName); // Kolom D (Paket)
            if (price !== undefined) sheet.getRange(row, 5).setValue(price);          // Kolom E (Harga)
            if (phone !== undefined) sheet.getRange(row, 6).setValue(phone);          // Kolom F (NO HP)
            successCount++;
            break;
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Berhasil mengedit profil pelanggan di " + successCount + " tab bulan!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- AKSI 2: HAPUS PELANGGAN ---
    if (action === "delete") {
      var successCount = 0;
      
      // Hapus baris pelanggan di seluruh tab bulan
      for (var s = 0; s < sheets.length; s++) {
        var sheet = sheets[s];
        var lastRow = sheet.getLastRow();
        if (lastRow < 1) continue;
        var range = sheet.getRange(1, 1, lastRow, 1);
        var values = range.getValues();
        
        for (var i = 0; i < values.length; i++) {
          if (values[i][0] == noUrut) {
            sheet.deleteRow(i + 1);
            successCount++;
            break;
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Berhasil menghapus baris pelanggan dari " + successCount + " tab bulan!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- AKSI 5: AMBIL DATA BULAN TERTENTU (FETCH SHEET) ---
    if (action === "fetch_sheet") {
      var targetSheetName = data.sheet_name; // e.g. "MEI 2026"
      var targetSheet = ss.getSheetByName(targetSheetName);
      
      if (!targetSheet) {
        // Jika tab bulan belum ada, kembalikan array kosong
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          data: []
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var lastRow = targetSheet.getLastRow();
      if (lastRow < 3) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          data: []
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var allValues = targetSheet.getRange(1, 1, lastRow, targetSheet.getLastColumn()).getValues();
      
      // Cari baris header utama yang kolom pertamanya adalah "No"
      var headerIndex = -1;
      for (var i = 0; i < allValues.length; i++) {
        var firstCol = allValues[i][0];
        if (firstCol && firstCol.toString().toLowerCase() === "no") {
          headerIndex = i;
          break;
        }
      }
      
      if (headerIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Format tabel tidak valid: Kolom 'No' tidak ditemukan"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var customers = [];
      
      // Mulai membaca data dari baris setelah header
      for (var i = headerIndex + 1; i < allValues.length; i++) {
        var columns = allValues[i];
        
        // Lewati jika kolom Nama (indeks 1) kosong atau berisi kata "TOTAL"
        if (!columns[1]) continue;
        if (columns[1].toString().toLowerCase().indexOf("total") !== -1) continue;
        
        var noUrut = parseInt(columns[0]) || (i - headerIndex);
        var nama = columns[1].toString();
        var alamat = columns[2] ? columns[2].toString() : "";
        var paket = columns[3] ? columns[3].toString() : "10 Mbps";
        var hargaRaw = columns[4] ? columns[4].toString() : "0";
        var harga = parseInt(hargaRaw.replace(/[^\d]/g, "")) || 0;
        var noHp = columns[5] ? columns[5].toString() : "";
        var keterangan = columns[6] ? columns[6].toString().toUpperCase() : "";
        var status = keterangan.indexOf("BELUM BAYAR") !== -1 ? "Belum Bayar" : "Lunas";
        
        customers.push({
          no_urut_excel: noUrut,
          name: nama,
          address: alamat,
          package: paket,
          price: harga,
          phone: noHp,
          status: status,
          keterangan: keterangan
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: customers
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- AKSI 6: GENERATE TAGIHAN BULAN BARU (KLONING TAB) ---
    if (action === "generate_month") {
      var targetSheetName = data.sheet_name; // Contoh: "JUNI 2026"
      var existingSheet = ss.getSheetByName(targetSheetName);
      
      if (existingSheet) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Tab " + targetSheetName + " sudah ada di Spreadsheet!"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Gunakan tab pertama sebagai basis cetakan (template / bulan sebelumnya)
      var sourceSheet = sheets[0];
      if (!sourceSheet) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Tidak ditemukan tab basis/template di Spreadsheet!"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Duplikasi tab ke sheet baru
      var newSheet = sourceSheet.copyTo(ss);
      newSheet.setName(targetSheetName);
      ss.setActiveSheet(newSheet);
      ss.moveActiveSheet(1); // Taruh di tab pertama agar rapi
      
      // 1. Update teks Banner Periode di baris 2 (merujuk ke nama bulan baru)
      newSheet.getRange(2, 1).setValue("Periode : " + targetSheetName);
      
      var lastRow = newSheet.getLastRow();
      
      // 2. Cari baris header utama "No"
      var allValues = newSheet.getRange(1, 1, lastRow, newSheet.getLastColumn()).getValues();
      var headerIndex = -1;
      for (var i = 0; i < allValues.length; i++) {
        var firstCol = allValues[i][0];
        if (firstCol && firstCol.toString().toLowerCase() === "no") {
          headerIndex = i;
          break;
        }
      }
      
      if (headerIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Gagal menduplikasi: Kolom 'No' tidak ditemukan pada tab sumber"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // 3. Bersihkan pembayaran dan setel ulang "BELUM BAYAR" di tab baru
      for (var r = headerIndex + 2; r <= lastRow; r++) {
        // Lewati jika kolom nama pelanggan kosong atau berisi total
        var nameCell = newSheet.getRange(r, 2).getValue();
        if (!nameCell || nameCell.toString().toLowerCase().indexOf("total") !== -1) continue;
        
        var price = newSheet.getRange(r, 5).getValue() || 0; // Kolom E (Harga)
        
        newSheet.getRange(r, 7).setValue("");     // Kolom G (Keterangan)
        newSheet.getRange(r, 8).setValue("");     // Kolom H (KELILING)
        newSheet.getRange(r, 9).setValue("");     // Kolom I (KANTOR)
        newSheet.getRange(r, 10).setValue("");    // Kolom J (TRANSFER)
        newSheet.getRange(r, 11).setValue(price); // Kolom K (BELUM BAYAR = Nominal Harga)
      }
      
      // 4. Hapus riwayat setoran harian SETORAN TAHAP (Kolom M ke kanan, baris 4 ke bawah)
      if (lastRow >= 4) {
        var rangeM_U = newSheet.getRange(4, 13, lastRow - 3, 9);
        rangeM_U.clearContent();
        rangeM_U.clearFormat();
        try {
          rangeM_U.breakApart(); // Pisahkan jika ada sel yang ter-merge
        } catch(e) {}
      }
      
      // 5. Ambil data pelanggan baru hasil generate untuk dikirim balik ke Supabase
      var newCustomers = [];
      var updatedValues = newSheet.getRange(1, 1, lastRow, newSheet.getLastColumn()).getValues();
      
      for (var i = headerIndex + 1; i < updatedValues.length; i++) {
        var columns = updatedValues[i];
        if (!columns[1]) continue;
        if (columns[1].toString().toLowerCase().indexOf("total") !== -1) continue;
        
        var noUrut = parseInt(columns[0]) || (i - headerIndex);
        var nama = columns[1].toString();
        var alamat = columns[2] ? columns[2].toString() : "";
        var paket = columns[3] ? columns[3].toString() : "10 Mbps";
        var hargaRaw = columns[4] ? columns[4].toString() : "0";
        var harga = parseInt(hargaRaw.replace(/[^\d]/g, "")) || 0;
        var noHp = columns[5] ? columns[5].toString() : "";
        
        newCustomers.push({
          no_urut_excel: noUrut,
          name: nama,
          address: alamat,
          package: paket,
          price: harga,
          phone: noHp,
          status: "Belum Bayar", // Semua baru digenerate jadi Belum Bayar
          keterangan: "BELUM BAYAR"
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: newCustomers,
        message: "Berhasil mengenerate tab baru " + targetSheetName + "!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- AKSI 3: CATAT PEMBAYARAN & SINKRONKAN SETORAN TAHAP ---
    var sheetName = data.bulan_tagihan; // Contoh: "MEI"
    var price = data.amount;
    var method = data.method; // "Keliling", "Kantor", "Transfer"
    var customerName = data.customer_name || "";
    
    var sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange(1, 1, lastRow, 1);
    var values = range.getValues();
    
    var targetRow = -1;
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] == noUrut) {
        targetRow = i + 1; 
        break;
      }
    }
    
    if (targetRow === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Nomor urut " + noUrut + " tidak ditemukan di Kolom A"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 1. Set Kolom G (Keterangan) sesuai metode pembayaran, dan kosongkan Kolom K (BELUM BAYAR)
    var ketVal = method.toUpperCase();
    if (ketVal === "KANTOR") ketVal = "TUNAI KANTOR";
    sheet.getRange(targetRow, 7).setValue(ketVal);  // Kolom G
    sheet.getRange(targetRow, 11).setValue(""); // Kolom K
    
    // 2. Isi nominal ke kolom pembayaran yang sesuai
    if (method === "Keliling") {
      sheet.getRange(targetRow, 8).setValue(price);  // Kolom H (KELILING)
      sheet.getRange(targetRow, 9).setValue("");
      sheet.getRange(targetRow, 10).setValue("");
    } else if (method === "Kantor" || method === "Tunai Kantor") {
      sheet.getRange(targetRow, 8).setValue("");
      sheet.getRange(targetRow, 9).setValue(price);  // Kolom I (KANTOR)
      sheet.getRange(targetRow, 10).setValue("");
    } else if (method === "Transfer") {
      sheet.getRange(targetRow, 8).setValue("");
      sheet.getRange(targetRow, 9).setValue("");
      sheet.getRange(targetRow, 10).setValue(price); // Kolom J (TRANSFER)
    }
    
    // 3. Catat di tabel SETORAN TAHAP (Kolom M:U)
    var todayStr = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd-MMM-yy");
    var targetDailyRow = -1;
    var lastDailyRow = 3; // header di baris 3
    
    for (var r = 4; r <= lastRow; r++) {
      var val = sheet.getRange(r, 13).getValue(); // Kolom M (Tanggal)
      if (val !== "") {
        lastDailyRow = r;
        var valStr = "";
        if (val instanceof Date) {
          valStr = Utilities.formatDate(val, ss.getSpreadsheetTimeZone(), "dd-MMM-yy");
        } else {
          valStr = val.toString();
        }
        if (valStr === todayStr) {
          targetDailyRow = r;
        }
      }
    }
    
    if (targetDailyRow === -1) {
      // Tambah baris baru untuk hari ini
      var newRow = lastDailyRow + 1;
      
      sheet.getRange(newRow, 13).setValue(todayStr); // Tanggal (M)
      
      var prevTahap = 0;
      if (lastDailyRow > 3) {
        prevTahap = parseInt(sheet.getRange(lastDailyRow, 14).getValue()) || 0;
      }
      sheet.getRange(newRow, 14).setValue(prevTahap + 1); // Tahap (N)
      
      sheet.getRange(newRow, 15).setFormula("=SUM(Q" + newRow + ":S" + newRow + ")"); // Setoran (O)
      
      sheet.getRange(newRow, 17).setValue(method === "Keliling" ? price : 0); // Keliling (Q)
      sheet.getRange(newRow, 18).setValue((method === "Kantor" || method === "Tunai Kantor") ? price : 0); // Kantor (R)
      sheet.getRange(newRow, 19).setValue(method === "Transfer" ? price : 0); // Transfer (S)
      sheet.getRange(newRow, 20).setValue((method === "Kantor" || method === "Tunai Kantor") ? customerName : ""); // Keterangan (T)
      
      // Formatting
      sheet.getRange(newRow, 15, 1, 2).merge();
      sheet.getRange(newRow, 20, 1, 2).merge();
      sheet.getRange(newRow, 15).setNumberFormat("[$Rp-421]#,##0");
      sheet.getRange(newRow, 17).setNumberFormat("[$Rp-421]#,##0");
      sheet.getRange(newRow, 18).setNumberFormat("[$Rp-421]#,##0");
      sheet.getRange(newRow, 19).setNumberFormat("[$Rp-421]#,##0");
      sheet.getRange(newRow, 13, 1, 7).setHorizontalAlignment("center");
      sheet.getRange(newRow, 20).setHorizontalAlignment("left");
      sheet.getRange(newRow, 13, 1, 9)
           .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
    } else {
      // Update baris hari ini yang sudah ada
      if (method === "Keliling") {
        var currVal = sheet.getRange(targetDailyRow, 17).getValue() || 0;
        sheet.getRange(targetDailyRow, 17).setValue(currVal + price);
      } else if (method === "Kantor" || method === "Tunai Kantor") {
        var currVal = sheet.getRange(targetDailyRow, 18).getValue() || 0;
        sheet.getRange(targetDailyRow, 18).setValue(currVal + price);
        
        var currKet = sheet.getRange(targetDailyRow, 20).getValue() || "";
        var newKet = currKet ? currKet + ", " + customerName : customerName;
        sheet.getRange(targetDailyRow, 20).setValue(newKet);
      } else if (method === "Transfer") {
        var currVal = sheet.getRange(targetDailyRow, 19).getValue() || 0;
        sheet.getRange(targetDailyRow, 19).setValue(currVal + price);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data pembayaran dan Setoran Tahap harian berhasil disinkronkan!"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- AKSI 4: DIREKSI UNDUHAN PDF PADA SMARTPHONE ---
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var id = ss.getId();
    
    // URL ekspor PDF dengan format persis: A4, Portrait, Custom Scale 38%, Margin Narrow (0.25 inci)
    var pdfUrl = "https://docs.google.com/spreadsheets/d/" + id + "/export?" +
                 "exportFormat=pdf&format=pdf" +
                 "&size=a4" +               // Ukuran A4
                 "&portrait=true" +         // Portrait
                 "&scale=5" +               // Mode custom scale
                 "&spct=0.38" +             // Persentase skala 38%
                 "&top_margin=0.25" +       // Margin Narrow (0.25 inci)
                 "&bottom_margin=0.25" +
                 "&left_margin=0.25" +
                 "&right_margin=0.25" +
                 "&gridlines=false" +       // Jangan tampilkan garis tabel (gridlines)
                 "&sheetnames=false" +
                 "&printtitle=false" +
                 "&pagenum=UNDEFINED";      // Tanpa nomor halaman
                 
    var html = "<html><body style='font-family:sans-serif; text-align:center; padding:100px 20px; color:#333; background:#fafafa;'>" +
               "<div style='max-width:500px; margin:0 auto; padding:40px; background:#fff; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.05);'>" +
               "<div style='font-size:48px; margin-bottom:20px;'>📄</div>" +
               "<h2 style='margin-bottom:10px; font-weight:800; color:#0f172a;'>Mempersiapkan PDF...</h2>" +
               "<p style='color:#64748b; font-size:15px; line-height:1.6; margin-bottom:30px;'>Unduhan PDF laporan SAFA-NET Anda akan segera dimulai secara otomatis.</p>" +
               "<div style='display:inline-block; width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #06b6d4; border-radius:50%; animation:spin 1s linear infinite; margin-bottom:20px;'></div>" +
               "<p style='font-size:13px; color:#94a3b8;'>Jika unduhan tidak berjalan otomatis, <a href='" + pdfUrl + "' style='color:#06b6d4; font-weight:bold; text-decoration:none;'>klik di sini untuk mengunduh secara manual</a>.</p>" +
               "</div>" +
               "<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>" +
               "<script>" +
               "setTimeout(function() { window.location.href = '" + pdfUrl + "'; }, 1000);" +
               "</script>" +
               "</body></html>";
               
    return HtmlService.createHtmlOutput(html)
      .setTitle("Download PDF Laporan SAFA-NET")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch(error) {
    return ContentService.createTextOutput("Gagal memproses unduhan PDF: " + error.toString());
  }
}
```

4. Klik tombol **Save** (ikon disket/simpan) di bagian atas halaman.

---

## 🛠️ Langkah 2: Deploy sebagai Aplikasi Web

1. Di kanan atas halaman Apps Script, klik **Deploy** > **New deployment**.
2. Klik ikon gerigi (Select type) di sebelah kiri, pilih **Web app**.
3. Atur konfigurasi berikut:
   - **Description**: `Konektor SAFA-NET`
   - **Execute as**: Pilih **Me (email Google Anda)**
   - **Who has access**: Pilih **Anyone** (Ini penting agar aplikasi web dapat mengirim data).
4. Klik **Deploy**.
5. Jika ada peringatan keamanan, klik **Authorize Access**, pilih akun Google Anda, klik **Advanced** (Lanjutan) di kiri bawah, lalu pilih **Go to Untitled project (unsafe)** / **Buka Proyek (tidak aman)**, dan klik **Allow** (Izinkan).
6. Salin **Web app URL** yang muncul (formatnya: `https://script.google.com/macros/s/XXXXX/exec`).

---

## 🛠️ Langkah 3: Berikan URL Web App Tersebut Kepada Saya

Salin URL tersebut dan tempelkan (*paste*) di percakapan ini. Saya akan langsung memperbarui kode *frontend* SAFA-NET Anda agar setiap kali transaksi dicatat, ia otomatis menembakkan data pembayaran Anda ke Google Sheets secara real-time!
