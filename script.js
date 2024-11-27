const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const treeImg = new Image();
treeImg.src = "tree.png";
const dinoImg = new Image();
dinoImg.src = "dino.png";
//dinoX, dinoY, dinoWidth, dinoHeight
let dw = 29, dh = 32;
let dx = 0, dy = canvas.height / 2 - dh;
let basladi = true;
let basladiZaman;
let skorMarjin = 10;
let mjh = dh * 2; // max jump height
let jh = 0; //yerde oturuyor
let jd = 0; //jump direction(zıplama yönü)
//jd = 0: duruyor     +1: yukarı      -1: aşağı
let js = 2; // jump speed ( atlama hızı katsayısı)
//agaçların uzaklıkları (x koordinatında)
let trees = [];
let tw = 17; // agacın genişliği
let th = 32; // agacin yüksekliği
let ty = canvas.height / 2 - th;
let sjs = 1; //slow jump speed (yükseklerdeki atlama hızı kat sayısı )




function zeminCiz() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.clientWidth, canvas.height / 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#535353";
    ctx.stroke();
}
//zeminCiz();

function ciz() {
    cizimiTemizle();
    zeminCiz();
    ziplamayiYonet();
    dinoCiz();
    agaclariCiz();
    sahneyiKaydir();
    skoruCiz();
    const carpti = carptiMi();
    if (carpti) {
        oyunBitir();
        return;
    }
    requestAnimationFrame(ciz);
}

function dinoCiz() {
    ctx.drawImage(dinoImg, dx, dy - jh, dw, dh);
}

dinoImg.onload = function () {
    baslat();
}

function baslat() {
    jd = 0;     //zıplıyorsa dikey hareket yönünü sıfırla
    jh = 0;     // havadaysa zıplama yüksekliğini sıfırla
    basladi = true;
    basladiZaman = new Date();
    loadTrees();
    //setInterval(ciz,10);
    requestAnimationFrame(ciz); //uygun olduğunda çiz
}

function yenidenBaslat() {
    //ağaçları sıfırdan oluştur
    //dinonun konumunu sıfırla
    baslat();
}

function cizimiTemizle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

canvas.onclick = jump;
function jump() {
    if (jd == 0) jd = +1;
}

canvas.onclick = function () {
    if (basladi) {
        jump();
    } else {
        yenidenBaslat();
    }
}
window.onkeydown = function (e) {
    if (e.keyCode == 38);
    jump();
}

function ziplamayiYonet() {
    if (jd == 0) return;

    if (jh < mjh * .8) //dino max yüksekliğin 5te 4 ün üstündeyse yavaş ilerlet
        jh += jd * js; // yerden yüksekliğini arrtır
    else
        jh += jd;

    if (jd > 0 && jh >= mjh) { //yukarı zıplıyorsa ve mac yük. ulaştıysa
        jd = -1; //düşmeye başla
    }
    if (jd < 0 && jh <= 0) { // aşağı düşüyor ve yere çarptıysa
        jd = 0; // zıplama bitti
    }
}

function loadTrees() {
    trees = [];// yeniden başladığında eski ağaçları siler.
    //ilk ağaç canvas bitiminde
    trees.push(canvas.width);

    /*  for (let i = 0; i < 1000; i++) {
            let otesi = rastgele(Math.floor(canvas.width / 3), canvas.width);
            let sonAgacUzakligi= trees[trees.length - 1];
            let yeniAgacUzakligi = sonAgacUzakligi + otesi
            trees.push(yeniAgacUzakligi);
        } 
    */

    for (let i = 0; i < 1000; i++) {
        let otesi = rastgele(Math.floor(canvas.width / 3), canvas.width);
        trees.push(trees[trees.length - 1] + otesi);
    }
}

function rastgele(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function agacCiz(x) {
    ctx.drawImage(treeImg, x, ty, tw, th);
}

function agaclariCiz() {
    // sadece canvasın bölgesine denk gelen ağaçları çiz
    const cizilecekler = trees.filter(x => x > -tw && x < canvas.width);

    for (const x of cizilecekler)
        agacCiz(x);
}
function sahneyiKaydir() {
    // tüm ağaçları 1 birim sola kaydır
    trees = trees.map(x => x - 1);
}
/* 
- bunu kullanmadık çünkü köşeleri keskin değil dino ve kaktüsler daire gibi düşünerek yeniden yazdık.
- d1: dino d2: tree
- örnek input:  kesisir({a:{x:0,y:118},b:{x:29,y:150}},{a:{x:9,y:118},b:{x:26,y:150}})

 function kesisir(d1, d2) {

    return !(
        -d1.b.y >= -d2.a.y ||     //d1 d2 nin üzerindeyse
        -d1.a.y <= -d2.b.y ||     //d1 d2 nin altındaysa
        d1.b.x <= d2.a.x ||     //d1 d2 nin solundaysa
        d1.a.x <= d2.b.x        //d1 d2 nin sağındaysa
    );
} 
*/

function mesafe(n1, n2) {
    return Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
}

function kesisir(d1, d2) {
    // orta noktaları arasındaki mesafe yarı çapları toplamından küçükse
    const o1 = { x: (d1.a.x + d1.b.x) / 2, y: (d1.a.y + d1.b.y) / 2 };
    const o2 = { x: (d2.a.x + d2.b.x) / 2, y: (d2.a.y + d2.b.y) / 2 };
    const mes = mesafe(o1, o2);
    const r1 = (dw + dh) / 4.8; //dino y    yük + gen/4
    const r2 = (tw + th) / 4.8; //kaktüs    yük + gen/4
    //yarıçapları yükseklik/4 kabul edelim
    //return mes < dh / 2 + th / 2;
    return mes < r1 + r2;
}

function carptiMi() {
    const d1 = {
        a: {
            x: dx,
            y: dy - jh
        },
        b: {
            x: dx + dw,
            y: dy - jh + dh
        }
    };
    const engeller = trees
        .filter(x => x > -tw && x < canvas.width)
        .map(e => ({
            a: {
                x: e,
                y: ty
            },
            b: {
                x: e + tw,
                y: ty + th
            }
        }));
    //debugger();
    return engeller.some(e => kesisir(e, d1));

    /*     
        for(const tree of trees)
            if(kesisir(tree,d1)) return true;
        return false; 
        */
}

function oyunBitir() {
    basladi = false;
    let txt = "GAME OVER!";
    ctx.font = "28px Tiny5 Sans-serif";
    const textWidth = ctx.measureText(txt).width;
    ctx.fillStyle = "black";
    ctx.fillText(txt, (canvas.width - textWidth) / 2, canvas.height / 4);

    let txt2 = ">> Click to Play Again! <<";
    ctx.font = "18px Tiny5 Sans-serif";
    ctx.fillStyle = "red";
    const textWidth2 = ctx.measureText(txt2).width;
    ctx.fillText(txt2, (canvas.width - textWidth2) / 2, canvas.height / 4 * 3);
}

function skoruCiz() {
    let simdi = new Date();
    let gecenSure = simdi - basladiZaman;
    let skor = Math.floor(gecenSure / 500);
    let skorMetin = skorBicimle(skor);
    ctx.font = "24px Tiny5 Sans-serif";
    ctx.fillStyle = "black";
    let metinBoyut = ctx.measureText(skorMetin);
    let metinGen = metinBoyut.width;
    let metinYuk = metinBoyut.actualBoundingBoxAscent
        + metinBoyut.actualBoundingBoxDescent;
    ctx.fillText(
        skorMetin,
        canvas.width - metinGen - skorMarjin,
        metinYuk + skorMarjin
    );
}

function skorBicimle(sayi) {
    let uz = sayi.toString().length;
    if (uz >= 5) return sayi;
    return "0".repeat(5 - uz) + sayi;
}

