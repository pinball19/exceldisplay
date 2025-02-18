document.getElementById("loadExcel").addEventListener("click", async () => {
    const url = "https://raw.githubusercontent.com/pinball19/exceldisplay/main03prevew/sample.xlsx"; // GitHub上のExcelのURL
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

    const sheetName = workbook.SheetNames[0]; // 1枚目のシートを取得
    const sheet = workbook.Sheets[sheetName];

    // 📌 ExcelをWebページに表示（初期状態）
    displayTable(sheet);
    
    // 更新ボタンを押したときにセルの値を変更
    document.getElementById("updateButton").addEventListener("click", () => {
        const textInput = document.getElementById("textInput").value;
        
        // 📌 指定のセル（例：A1）に入力したテキストを反映
        sheet["A1"] = { v: textInput };

        // 📌 変更後の Excel を Web 上で再表示
        displayTable(sheet);
    });

    // 📌 画像としてダウンロード
    document.getElementById("captureButton").addEventListener("click", () => {
        const captureArea = document.getElementById("captureArea");

        html2canvas(captureArea).then((canvas) => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "preview_excel.png";
            link.click();
        });
    });

    // 📌 Excel をダウンロード
    document.getElementById("downloadButton").addEventListener("click", () => {
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, sheet, sheetName);
        XLSX.writeFile(newWorkbook, "updated_excel.xlsx");
    });
});

// 📌 Webページ上に Excel の表を再現
function displayTable(sheet) {
    const table = document.getElementById("excelTable");
    table.innerHTML = "";

    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    jsonData.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
            const td = document.createElement("td");
            td.textContent = cell || "";
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}
