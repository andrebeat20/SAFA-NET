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
    // --- AKSI 9: TAMBAH PELANGGAN (ADD CUSTOMER) ---
    if (action === "add_customer") {
      var name = data.name;
      var address = data.address || "";
      var packageName = data.package || "10 Mbps";
      var price = data.price || 0;
      var phone = data.phone || "";
      var successCount = 0;
      
      for (var s = 0; s < sheets.length; s++) {
        var sheet = sheets[s];
        var lastRow = Math.min(sheet.getLastRow() + 5, 1000); 
        var values = sheet.getRange(1, 2, lastRow, 1).getValues();
        var totalRowIndex = -1;
        
        // Cari baris TOTAL
        for (var i = 0; i < values.length; i++) {
          var cellText = values[i][0] ? values[i][0].toString().toUpperCase().trim() : "";
          if (cellText === "TOTAL") {
            totalRowIndex = i + 1;
            break;
          }
        }
        
        if (totalRowIndex !== -1) {
          // Sisipkan baris kosong tepat di atas TOTAL
          sheet.insertRowBefore(totalRowIndex);
          
          // Kloning format dari baris di atasnya
          var numCols = sheet.getLastColumn();
          if (numCols < 1) numCols = 20;
          var sourceRange = sheet.getRange(totalRowIndex - 2, 1, 1, numCols);
          var targetRange = sheet.getRange(totalRowIndex - 1, 1, 1, numCols);
          sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
          
          // Isi data
          sheet.getRange(totalRowIndex - 1, 1).setValue(noUrut);        // Kolom A
          sheet.getRange(totalRowIndex - 1, 2).setValue(name);          // Kolom B
          sheet.getRange(totalRowIndex - 1, 3).setValue(address);       // Kolom C
          sheet.getRange(totalRowIndex - 1, 4).setValue(packageName);   // Kolom D
          sheet.getRange(totalRowIndex - 1, 5).setValue(price);         // Kolom E
          sheet.getRange(totalRowIndex - 1, 6).setValue(phone);         // Kolom F
          sheet.getRange(totalRowIndex - 1, 7).setValue("BELUM BAYAR"); // Kolom G
          sheet.getRange(totalRowIndex - 1, 11).setValue(price);        // Kolom K
          
          successCount++;
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Berhasil menambah pelanggan baru di " + successCount + " tab bulan!"
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
    
    // --- AKSI 8: BATALKAN PEMBAYARAN (CANCEL PAYMENT) ---
    if (action === "cancel_payment") {
      var sheetName = data.bulan_tagihan;
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Tab bulan " + sheetName + " tidak ditemukan"
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var lastRow = sheet.getLastRow();
      var values = sheet.getRange(1, 1, lastRow, 1).getValues();
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
      
      // Ambil Harga dan Nama dari Kolom E dan B
      var customerName = sheet.getRange(targetRow, 2).getValue();
      var price = sheet.getRange(targetRow, 5).getValue();
      
      // Cek metode pembayaran sebelum dihapus (agar tahu mana yang harus dikurangi di laporan harian)
      var kelVal = sheet.getRange(targetRow, 8).getValue() || 0;
      var kanVal = sheet.getRange(targetRow, 9).getValue() || 0;
      var transVal = sheet.getRange(targetRow, 10).getValue() || 0;
      
      var canceledMethod = "";
      if (kelVal > 0) canceledMethod = "Keliling";
      else if (kanVal > 0) canceledMethod = "Kantor";
      else if (transVal > 0) canceledMethod = "Transfer";
      
      // Kembalikan Keterangan menjadi BELUM BAYAR
      sheet.getRange(targetRow, 7).setValue("BELUM BAYAR");
      
      // Kosongkan kolom pembayaran (H, I, J)
      sheet.getRange(targetRow, 8).setValue("");
      sheet.getRange(targetRow, 9).setValue("");
      sheet.getRange(targetRow, 10).setValue("");
      
      // Kembalikan nominal ke kolom BELUM BAYAR (K)
      sheet.getRange(targetRow, 11).setValue(price);
      
      // --- PROSES MENGURANGI DARI TABEL HARIAN (SETORAN TAHAP) ---
      if (canceledMethod !== "") {
        var targetDailyRow = -1;
        
        // 1. Coba cari baris harian yang nama pelanggannya tertera di Keterangan (khusus Kantor)
        if (canceledMethod === "Kantor") {
          for (var r = 33; r >= 4; r--) {
            var ketVal = sheet.getRange(r, 20).getValue() || "";
            if (ketVal.indexOf(customerName) !== -1) {
              targetDailyRow = r;
              break;
            }
          }
        }
        
        // 2. Jika tidak ketemu (atau Keliling/Transfer), gunakan baris HARI INI
        if (targetDailyRow === -1) {
          var todayStr = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), "dd-MMM-yy");
          for (var r = 4; r <= 33; r++) {
            var val = sheet.getRange(r, 13).getValue();
            if (val !== "") {
              var valStr = val instanceof Date ? Utilities.formatDate(val, ss.getSpreadsheetTimeZone(), "dd-MMM-yy") : val.toString();
              if (valStr === todayStr) {
                targetDailyRow = r;
                break;
              }
            }
          }
        }
        
        // 3. Jika masih tidak ketemu (belum ada transaksi hari ini), cari baris TERAKHIR yang ada isinya
        if (targetDailyRow === -1) {
          for (var r = 33; r >= 4; r--) {
            if (sheet.getRange(r, 13).getValue() !== "") {
              targetDailyRow = r;
              break;
            }
          }
        }
        
        // Lakukan pengurangan nominal
        if (targetDailyRow !== -1) {
          if (canceledMethod === "Keliling") {
            var currVal = sheet.getRange(targetDailyRow, 17).getValue() || 0;
            sheet.getRange(targetDailyRow, 17).setValue(Math.max(0, currVal - price));
          } else if (canceledMethod === "Kantor") {
            var currVal = sheet.getRange(targetDailyRow, 18).getValue() || 0;
            sheet.getRange(targetDailyRow, 18).setValue(Math.max(0, currVal - price));
            
            // Hapus nama dari keterangan (Kolom T)
            var currKet = sheet.getRange(targetDailyRow, 20).getValue() || "";
            if (currKet) {
              var names = currKet.split(",").map(function(n) { return n.trim(); });
              var nameIdx = names.indexOf(customerName.toString().trim());
              if (nameIdx !== -1) {
                names.splice(nameIdx, 1);
                sheet.getRange(targetDailyRow, 20).setValue(names.join(", "));
              }
            }
          } else if (canceledMethod === "Transfer") {
            var currVal = sheet.getRange(targetDailyRow, 19).getValue() || 0;
            sheet.getRange(targetDailyRow, 19).setValue(Math.max(0, currVal - price));
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Pembayaran berhasil dibatalkan di Google Sheets dan laporan harian telah disesuaikan!"
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
      
      // 3. Bersihkan pembayaran lama dan reset kolom BELUM BAYAR secara cepat (Batch Write)
      if (lastRow >= headerIndex + 2) {
        var startRow = headerIndex + 2;
        var numRows = lastRow - startRow + 1;
        
        // Kolom G (Keterangan) dikosongkan, H (KELILING), I (KANTOR), J (TRANSFER) disetel ""
        var clearValues = [];
        // Kolom K (BELUM BAYAR) diisi dengan nominal harga dari Kolom E (Harga)
        var priceRange = newSheet.getRange(startRow, 5, numRows, 1).getValues();
        var belumBayarValues = [];
        
        for (var i = 0; i < numRows; i++) {
          clearValues.push(["BELUM BAYAR", "", "", ""]); // G (Keterangan = BELUM BAYAR), H, I, J (Kosong)
          belumBayarValues.push([priceRange[i][0] || 0]); // K (BELUM BAYAR = Nominal Harga)
        }
        
        newSheet.getRange(startRow, 7, numRows, 4).setValues(clearValues);
        newSheet.getRange(startRow, 11, numRows, 1).setValues(belumBayarValues);
      }
      
      // 4. Reset tabel SETORAN TAHAP 1 - 30 (Kolom M ke U, baris 4 sampai 33)
      if (lastRow >= 4) {
        // Bersihkan area dari baris 4 ke bawah jika ada data lebih panjang
        var clearRange = newSheet.getRange(4, 13, Math.max(lastRow - 3, 31), 9);
        clearRange.clearContent();
        clearRange.clearFormat();
        try { clearRange.breakApart(); } catch(e) {}
      }
      
      // Gambar ulang 30 baris kosong untuk Tahap 1 sampai 30
      for (var i = 1; i <= 30; i++) {
        var row = i + 3; // baris 4 sampai 33
        newSheet.getRange(row, 14).setValue(i); // Tahap (Kolom N)
        newSheet.getRange(row, 15, 1, 2).merge(); // Merge Setoran (O & P)
        newSheet.getRange(row, 20, 1, 2).merge(); // Merge Keterangan (T & U)
      }
      
      // Gambar baris Total di baris 34
      var totalRow = 34;
      newSheet.getRange(totalRow, 15, 1, 2).merge();
      newSheet.getRange(totalRow, 20, 1, 2).merge();
      newSheet.getRange(totalRow, 14).setValue("TOTAL");
      
      newSheet.getRange(totalRow, 15).setFormula("=SUM(O4:O33)").setNumberFormat("[$Rp-421]#,##0");
      newSheet.getRange(totalRow, 17).setFormula("=SUM(Q4:Q33)").setNumberFormat("[$Rp-421]#,##0");
      newSheet.getRange(totalRow, 18).setFormula("=SUM(R4:R33)").setNumberFormat("[$Rp-421]#,##0");
      newSheet.getRange(totalRow, 19).setFormula("=SUM(S4:S33)").setNumberFormat("[$Rp-421]#,##0");
      
      // Format borders & alignment
      var tableRange = newSheet.getRange(4, 13, 31, 9); // Termasuk baris total
      tableRange.setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);
      tableRange.setHorizontalAlignment("center");
      newSheet.getRange(4, 20, 31, 2).setHorizontalAlignment("left"); // Keterangan rata kiri
      newSheet.getRange(totalRow, 13, 1, 9).setFontWeight("bold");
      
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
    var firstEmptyRow = -1;
    
    // Cari baris dari tahap 1 sampai 30 (Baris 4 sampai 33)
    for (var r = 4; r <= 33; r++) {
      var val = sheet.getRange(r, 13).getValue(); // Kolom M (Tanggal)
      if (val !== "") {
        var valStr = "";
        if (val instanceof Date) {
          valStr = Utilities.formatDate(val, ss.getSpreadsheetTimeZone(), "dd-MMM-yy");
        } else {
          valStr = val.toString();
        }
        if (valStr === todayStr) {
          targetDailyRow = r;
          break; // Sudah ada transaksi hari ini
        }
      } else if (firstEmptyRow === -1) {
        firstEmptyRow = r; // Catat baris kosong pertama yang ditemukan
      }
    }
    
    if (targetDailyRow === -1) {
      // Jika belum ada transaksi hari ini, gunakan baris kosong pertama
      targetDailyRow = firstEmptyRow !== -1 ? firstEmptyRow : 34; 
      
      sheet.getRange(targetDailyRow, 13).setValue(todayStr); // Tanggal (M)
      
      // Kolom N (Tahap) sudah di-generate sebelumnya (1-30)
      
      sheet.getRange(targetDailyRow, 15).setFormula("=SUM(Q" + targetDailyRow + ":S" + targetDailyRow + ")"); // Setoran (O)
      
      sheet.getRange(targetDailyRow, 17).setValue(method === "Keliling" ? price : 0); // Keliling (Q)
      sheet.getRange(targetDailyRow, 18).setValue((method === "Kantor" || method === "Tunai Kantor") ? price : 0); // Kantor (R)
      sheet.getRange(targetDailyRow, 19).setValue(method === "Transfer" ? price : 0); // Transfer (S)
      sheet.getRange(targetDailyRow, 20).setValue((method === "Kantor" || method === "Tunai Kantor") ? customerName : ""); // Keterangan (T)
      
      // Formatting mata uang
      sheet.getRange(targetDailyRow, 15).setNumberFormat("[$Rp-421]#,##0");
      sheet.getRange(targetDailyRow, 17).setNumberFormat("[$Rp-421]#,##0");
      sheet.getRange(targetDailyRow, 18).setNumberFormat("[$Rp-421]#,##0");
      sheet.getRange(targetDailyRow, 19).setNumberFormat("[$Rp-421]#,##0");
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
    
    // Ambil parameter bulan untuk download spesifik tab saja
    var month = e.parameter.month;
    var gidParam = "";
    if (month) {
      var sheet = ss.getSheetByName(month);
      if (sheet) {
        gidParam = "&gid=" + sheet.getSheetId();
      }
    }
    
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
                 "&pagenum=UNDEFINED" +     // Tanpa nomor halaman
                 gidParam;                  // Filter agar hanya mengunduh tab bulan terkait
                 
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

---

## 🪄 Langkah Tambahan: Script Tambah Pelanggan Otomatis (Opsional)

Untuk mempermudah penambahan pelanggan secara manual di Google Sheets **tanpa merusak rumus TOTAL** di bagian bawah, Anda bisa menempelkan script `onEdit` ini tepat di bagian paling bawah kode Apps Script Anda (di bawah baris terakhir dari fungsi `doGet`):

```javascript
// --- AKSI 7: SCRIPT OTOMATIS GESER TABEL (ADD CUSTOMER) ---
// Fungsi ini berjalan otomatis setiap kali Anda mengetik pelanggan baru
function onEdit(e) {
  try {
    var sheet = e.source.getActiveSheet();
    var range = e.range;
    var row = range.getRow();
    var col = range.getColumn();
    
    // Hanya berjalan jika kita mengetik di Kolom B (Nama Pelanggan)
    if (col === 2 && e.value) {
      
      // Cari posisi baris "TOTAL" secara dinamis
      var lastRow = Math.min(sheet.getLastRow() + 5, 1000); 
      var values = sheet.getRange(1, 2, lastRow, 1).getValues();
      var totalRowIndex = -1;
      
      for (var i = 0; i < values.length; i++) {
        var cellText = values[i][0] ? values[i][0].toString().toUpperCase().trim() : "";
        if (cellText === "TOTAL") {
          totalRowIndex = i + 1;
          break;
        }
      }
      
      // Jika baris yang Anda ketik adalah baris tepat 1 baris di atas TOTAL
      if (totalRowIndex !== -1 && row === totalRowIndex - 1) {
        
        // 1. Sisipkan baris kosong baru di atas TOTAL (blok TOTAL aman bergeser ke bawah)
        sheet.insertRowBefore(totalRowIndex);
        
        // 2. Kloning Format (Border, font, warna) dari baris Anda ke baris kosong yang baru
        var numCols = sheet.getLastColumn();
        if (numCols < 1) numCols = 20;
        
        var sourceRange = sheet.getRange(row, 1, 1, numCols);
        var targetRange = sheet.getRange(totalRowIndex, 1, 1, numCols);
        sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
        
        // 3. Kloning Auto-Nomor (opsional jika Kolom A adalah nomor urut)
        var prevNo = parseInt(sheet.getRange(row - 1, 1).getValue());
        if (!isNaN(prevNo)) {
          sheet.getRange(row, 1).setValue(prevNo + 1); 
        }
        
        // 4. Setel Status Awal Keterangan menjadi "BELUM BAYAR"
        sheet.getRange(row, 7).setValue("BELUM BAYAR");
        // Paket Default
        sheet.getRange(row, 4).setValue("10 Mbps");
      }
    }
  } catch (err) {
    // Abaikan error
  }
}
```

> **Cara Kerja Script Ini:**
> * **Deteksi Otomatis:** Setiap kali Anda mengisi nama pelanggan baru tepat di baris kosong di bawah pelanggan terakhir (baris 212 di contoh), script akan mendeteksi koordinat tersebut.
> * **Geser Otomatis:** Script mencari posisi teks "TOTAL" secara dinamis, lalu menyisipkan baris baru (`insertRowBefore`) tepat di atasnya. Hal ini membuat blok ringkasan otomatis turun ke bawah dengan aman.
> * **Kloning Format:** Script mengambil format tabel (garis border, font, alignment) dari baris di atasnya dan menerapkannya ke baris baru agar Anda tidak perlu membuat border manual lagi.
> * **Rumus Aman:** Karena menggunakan fungsi bawaan Sheets `insertRow`, rumus seperti `=SUM(F$5:F212)` akan otomatis berubah secara mandiri menjadi `=SUM(F$5:F213)` tanpa merusak kalkulasi.
