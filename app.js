document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  document.getElementById("loadExcel").addEventListener("click", async () => {
    try {
      const url = "https://raw.githubusercontent.com/pinball19/exceldisplay/main03prevew/sample.xlsx";
      console.log("Fetching Excel from:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error("Excelファイルの取得に失敗しました");

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

      console.log("Workbook loaded:", workbook);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      displayTable(sheet);
    } catch (error) {
      console.error("エラー:", error);
    }
  });

  document.getElementById("updateButton").addEventListener("click", () => {
    const textInput = document.getElementById("textInput").value;

    if (!window.currentSheet) {
      console.error("Excel データがロードされていません");
      return;
    }

    // 指定セル（A1）を更新
    window.currentSheet["H3"] = { v: textInput };
    displayTable(window.currentSheet);
  });

  document.getElementById("captureButton").addEventListener("click", () => {
    const captureArea = document.getElementById("captureArea");
    console.log("画像キャプチャ開始");

    html2canvas(captureArea).then((canvas) => {
      console.log("画像キャプチャ成功");
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "preview_excel.png";
      link.click();
    }).catch(error => {
      console.error("画像キャプチャ失敗:", error);
    });
  });

  document.getElementById("downloadButton").addEventListener("click", () => {
    if (!window.currentSheet) {
      console.error("Excel データがロードされていません");
      return;
    }

    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, window.currentSheet, "Sheet1");
    XLSX.writeFile(newWorkbook, "updated_excel.xlsx");
  });
});

// 📌 Webページ上にExcelの内容をテーブルとして表示する関数
function displayTable(sheet) {
  console.log("テーブルを更新");
  const table = document.getElementById("excelTable");
  table.innerHTML = "";

  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  if (jsonData.length === 0) {
    console.error("Excelデータが空です");
    return;
  }

  jsonData.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell || "";
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  // 現在のシートを保存（更新時に使用）
  window.currentSheet = sheet;
}
