import { db } from "./firebase-config.js";
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let selectedData = {}; // 変更されたセルのデータを保存
let jsonData = []; // Excelデータの保持
let columnWidths = {}; // 列幅を保存
let rowHeights = {}; // 行高さを保存
let merges = []; // セルの結合情報を保存

// 📌 Excelファイルの読み込み
document.getElementById("excelFileInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0]; // 1枚目のシートを取得
        const sheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // 📌 列幅・行高さ・セルの結合情報を取得
        columnWidths = sheet["!cols"] || [];
        rowHeights = sheet["!rows"] || [];
        merges = sheet["!merges"] || [];

        displayTable(jsonData);
    };
    reader.readAsArrayBuffer(file);
});

// 📌 Webページ上にテーブルを生成（セル編集可能 & 列幅・行高さ適用 & 結合対応）
function displayTable(data) {
    const table = document.getElementById("excelTable");
    table.innerHTML = "";
    table.style.tableLayout = "fixed"; // 列幅を適用しやすくする
    table.style.width = "100%";

    // 📌 列幅を適用
    if (columnWidths.length > 0) {
        const colgroup = document.createElement("colgroup");
        columnWidths.forEach((col, index) => {
            const colElem = document.createElement("col");
            if (col?.wpx) {
                colElem.style.width = `${col.wpx}px`; // Excel の wpx (ピクセル単位) を適用
            }
            colgroup.appendChild(colElem);
        });
        table.appendChild(colgroup);
    }

    // 📌 マージセルを管理するマップ（既に結合されたセルをスキップ）
    let mergedCells = {};

    // 📌 各行を生成
    data.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");

        // 行高さを適用
        if (rowHeights[rowIndex]?.hpx) {
            tr.style.height = `${rowHeights[rowIndex].hpx}px`; // Excel の hpx (ピクセル単位) を適用
        }

        row.forEach((cell, colIndex) => {
            // 📌 結合されたセルはスキップ
            if (mergedCells[`${rowIndex}-${colIndex}`]) return;

            const td = document.createElement("td");
            td.contentEditable = true;
            td.textContent = cell || "";

            // ✍️ ユーザーが編集した場合、selectedData に保存
            td.addEventListener("input", (event) => {
                const newValue = event.target.textContent;
                selectedData[`${rowIndex}-${colIndex}`] = newValue;
            });

            // 📌 結合情報を適用
            merges.forEach((merge) => {
                if (
                    rowIndex >= merge.s.r &&
                    rowIndex <= merge.e.r &&
                    colIndex >= merge.s.c &&
                    colIndex <= merge.e.c
                ) {
                    if (rowIndex === merge.s.r && colIndex === merge.s.c) {
                        td.rowSpan = merge.e.r - merge.s.r + 1;
                        td.colSpan = merge.e.c - merge.s.c + 1;
                    } else {
                        mergedCells[`${rowIndex}-${colIndex}`] = true;
                    }
                }
            });

            tr.appendChild(td);
        });

        table.appendChild(tr);
    });
}

// 📌 Firestore にデータを保存（履歴を含む）
async function saveToFirestore(cellId, newValue, user) {
    const docRef = doc(db, "excelData", "editedCells");
    const docSnap = await getDoc(docRef);
    let data = docSnap.exists() ? docSnap.data().data : {};

    data[cellId] = {
        value: newValue,
        edited_by: user,
        timestamp: new Date().toISOString()
    };

    await updateDoc(docRef, { data });
    console.log(`セル ${cellId} の変更を Firestore に保存しました`);
}

// Firestore へ保存ボタン
document.getElementById("saveData").addEventListener("click", async () => {
    let user = prompt("あなたの名前を入力してください");
    if (!user) return;

    Object.entries(selectedData).forEach(([cellId, value]) => {
        saveToFirestore(cellId, value, user);
    });

    alert("編集履歴を Firestore に保存しました！");
});

// 📌 Firestore のデータを Excel に戻してダウンロード
async function downloadExcel() {
    const docRef = doc(db, "excelData", "editedCells");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        alert("データがありません");
        return;
    }

    let data = docSnap.data().data;
    let worksheet = XLSX.utils.json_to_sheet(Object.entries(data).map(([cell, info]) => ({
        Cell: cell,
        Value: info.value,
        EditedBy: info.edited_by,
        Timestamp: info.timestamp
    })));

    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, "edited_excel.xlsx");
}

// ダウンロードボタンのイベントリスナー
document.getElementById("downloadExcel").addEventListener("click", downloadExcel);
