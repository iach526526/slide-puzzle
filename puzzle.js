var rows = 3;
var columns = 3;

var currTile;
var otherTile; //blank tile

var turns = 0;

const qrCodeSize = 300; // QR code 的大小
const tileSize = qrCodeSize / rows; // 拼圖塊的大小

window.onload = function() {
    // 生成隨機 10 字元的 QR code URL
    const randomText = generateRandomString(10); // 生成 10 字元的隨機字符串
    console.log(randomText);
    const qrCodeUrl = generateQRCodeURL(randomText);
    const backgroundUrl = 'https://raw.githubusercontent.com/SCAICT/SCAICT-uwu/986ee9b3a44ae5dcac9cb5ad8928e1b28a83a151/static/slot.svg'; // 背景圖案 URL

    // 等待圖片加載完成後進行處理
    const qrImg = new Image();
    const bgImg = new Image();
    qrImg.crossOrigin = "Anonymous";
    bgImg.crossOrigin = "Anonymous";

    let qrLoaded = false;
    let bgLoaded = false;

    qrImg.onload = function() {
        qrLoaded = true;
        if (bgLoaded) {
            processImages();
        }
    };
    bgImg.onload = function() {
        bgLoaded = true;
        if (qrLoaded) {
            processImages();
        }
    };

    qrImg.src = qrCodeUrl;
    bgImg.src = backgroundUrl;

    function processImages() {
        const canvas = document.createElement('canvas');
        canvas.width = qrCodeSize;
        canvas.height = qrCodeSize;
        const ctx = canvas.getContext('2d');

        // 繪製背景圖案
        ctx.drawImage(bgImg, 0, 0, qrCodeSize, qrCodeSize);
        
        // 繪製 QR code 圖片
        ctx.drawImage(qrImg, 0, 0, qrCodeSize, qrCodeSize);

        // 切割圖片並生成拼圖
        let imgOrder = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                const x = c * tileSize;
                const y = r * tileSize;

                // 創建新的 Canvas 來生成拼圖塊
                const tileCanvas = document.createElement('canvas');
                tileCanvas.width = tileSize;
                tileCanvas.height = tileSize;
                const tileCtx = tileCanvas.getContext('2d');
                tileCtx.drawImage(canvas, x, y, tileSize, tileSize, 0, 0, tileSize, tileSize);

                // 保存拼圖塊的數據 URL
                imgOrder.push(tileCanvas.toDataURL());
            }
        }

        // 隨機打亂拼圖順序
        imgOrder = imgOrder.sort(() => Math.random() - 0.5);

        // 創建拼圖塊
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                let tile = document.createElement("img");
                tile.id = r.toString() + "-" + c.toString();
                tile.src = imgOrder.shift();

                // 設置拼圖塊的拖拽功能
                tile.draggable = true;
                tile.addEventListener("dragstart", dragStart);
                tile.addEventListener("dragover", dragOver);
                tile.addEventListener("dragenter", dragEnter);
                tile.addEventListener("dragleave", dragLeave);
                tile.addEventListener("drop", dragDrop);
                tile.addEventListener("dragend", dragEnd);

                document.getElementById("board").append(tile);
            }
        }
    }
}

function generateRandomString(length) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}

function generateQRCodeURL(text) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${qrCodeSize}x${qrCodeSize}&data=${encodeURIComponent(text)}`;
}

function dragStart() {
    currTile = this;
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {
}

function dragDrop() {
    otherTile = this;
}

function dragEnd() {
    if (!otherTile.src.includes("null")) { // 只處理空白拼圖
        let currCoords = currTile.id.split("-");
        let r = parseInt(currCoords[0]);
        let c = parseInt(currCoords[1]);

        let otherCoords = otherTile.id.split("-");
        let r2 = parseInt(otherCoords[0]);
        let c2 = parseInt(otherCoords[1]);

        let moveLeft = r == r2 && c2 == c - 1;
        let moveRight = r == r2 && c2 == c + 1;

        let moveUp = c == c2 && r2 == r - 1;
        let moveDown = c == c2 && r2 == r + 1;

        let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

        if (isAdjacent) {
            let currImg = currTile.src;
            let otherImg = otherTile.src;

            currTile.src = otherImg;
            otherTile.src = currImg;

            turns += 1;
            document.getElementById("turns").innerText = turns;
        }
    }
}
