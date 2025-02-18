document.getElementById("excelFileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0]; // 1枚目のシートを取得
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        displayTable(jsonData);
    };
    reader.readAsArrayBuffer(file);
});

// 📌 Webページ上にテーブルを生成（セル編集可能）
function displayTable(data) {
    const table = document.getElementById("excelTable");
    table.innerHTML = "";

    data.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");

        row.forEach((cell, colIndex) => {
            const td = document.createElement("td");
            td.contentEditable = true; // ユーザーが編集可能にする
            td.textContent = cell || "";

            tr.appendChild(td);
        });

        table.appendChild(tr);
    });
}

// 📌 画像として保存する処理
document.getElementById("downloadImage").addEventListener("click", () => {
    const captureArea = document.getElementById("captureArea");

    html2canvas(captureArea).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "edited_excel_screenshot.png";
        link.click();
    });
});
