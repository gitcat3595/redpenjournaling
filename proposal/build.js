const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaExclamationTriangle,
  FaBrain,
  FaClock,
  FaEnvelope,
  FaTasks,
  FaRedo,
  FaComments,
  FaQuestionCircle,
  FaBalanceScale,
  FaUserTie,
  FaRegLightbulb,
  FaPenFancy,
  FaPenNib,
  FaSearch,
  FaCheck,
  FaChalkboardTeacher,
  FaUsers,
  FaUser,
  FaTachometerAlt,
  FaHeart,
  FaProjectDiagram,
  FaUserGraduate,
  FaCrown,
  FaCalendarCheck,
  FaArrowRight,
} = require("react-icons/fa");

// ---------- palette ----------
const INK = "1C1C1C"; // near-black
const PAPER = "FFFFFF";
const RED = "C8102E"; // red pen ink
const RED_DARK = "8E0E22";
const RED_TINT = "FBE7EA";
const MUTED = "6E6E6E";
const LINE = "E4E2E0";
const DARK_BG = "1C1C1C";

const HEAD_FONT = "Hiragino Mincho ProN";
const BODY_FONT = "Hiragino Sans";

function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconPNG(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.author = "RED PEN";
  pres.title = "思考整理研修 ご提案資料";

  const W = 13.333;
  const H = 7.5;
  const MX = 0.7; // side margin

  // pre-render icons
  const ic = {};
  const want = [
    ["warning", FaExclamationTriangle, RED],
    ["brain", FaBrain, RED],
    ["clock", FaClock, RED],
    ["envelope", FaEnvelope, RED],
    ["tasks", FaTasks, RED],
    ["redo", FaRedo, RED],
    ["comments", FaComments, RED],
    ["question", FaQuestionCircle, RED],
    ["balance", FaBalanceScale, RED],
    ["usertie", FaUserTie, RED],
    ["bulb", FaRegLightbulb, RED],
    ["pen", FaPenFancy, PAPER],
    ["pennib", FaPenNib, RED],
    ["search", FaSearch, RED],
    ["check", FaCheck, RED],
    ["chalkboard", FaChalkboardTeacher, RED],
    ["users", FaUsers, RED],
    ["user", FaUser, RED],
    ["tacho", FaTachometerAlt, RED],
    ["heart", FaHeart, RED],
    ["project", FaProjectDiagram, RED],
    ["grad", FaUserGraduate, RED],
    ["crown", FaCrown, RED],
    ["calcheck", FaCalendarCheck, RED],
    ["arrow", FaArrowRight, RED],
    ["pennib_w", FaPenNib, PAPER],
    ["check_w", FaCheck, PAPER],
  ];
  for (const [key, comp, color] of want) {
    ic[key] = await iconPNG(comp, color, 256);
  }

  // ---------- helpers ----------
  function pageMarker(slide, n) {
    // small red square motif, top-left
    slide.addShape(pres.shapes.RECTANGLE, {
      x: MX,
      y: 0.55,
      w: 0.16,
      h: 0.16,
      fill: { color: RED },
    });
    slide.addText(String(n).padStart(2, "0"), {
      x: W - 1.0,
      y: H - 0.55,
      w: 0.7,
      h: 0.3,
      fontFace: BODY_FONT,
      fontSize: 11,
      color: MUTED,
      align: "right",
      margin: 0,
    });
    slide.addText("RED PEN", {
      x: MX,
      y: H - 0.55,
      w: 2,
      h: 0.3,
      fontFace: BODY_FONT,
      fontSize: 10,
      color: MUTED,
      charSpacing: 2,
      margin: 0,
    });
  }

  function header(slide, eyebrow, title, opts = {}) {
    pageMarker(slide, opts.page);
    slide.addText(eyebrow, {
      x: MX + 0.28,
      y: 0.46,
      w: 8,
      h: 0.35,
      fontFace: BODY_FONT,
      fontSize: 13,
      bold: true,
      color: RED,
      charSpacing: 2,
      margin: 0,
    });
    slide.addText(title, {
      x: MX,
      y: 0.85,
      w: opts.titleW || 11.6,
      h: opts.titleH || 1.0,
      fontFace: HEAD_FONT,
      fontSize: opts.titleSize || 30,
      bold: true,
      color: INK,
      margin: 0,
      lineSpacingMultiple: 1.1,
    });
  }

  function bulletList(slide, items, opts) {
    const arr = items.map((t, i) => ({
      text: t,
      options: {
        bullet: { code: "25A0", color: RED, indent: 14 },
        breakLine: i < items.length - 1,
        paraSpaceAfter: opts.gap || 12,
      },
    }));
    slide.addText(arr, {
      x: opts.x,
      y: opts.y,
      w: opts.w,
      h: opts.h,
      fontFace: BODY_FONT,
      fontSize: opts.fontSize || 15,
      color: opts.color || INK,
      valign: "top",
      margin: 0,
    });
  }

  function iconCircle(slide, x, y, d, iconKey, iconScale = 0.55) {
    slide.addShape(pres.shapes.OVAL, {
      x,
      y,
      w: d,
      h: d,
      fill: { color: RED_TINT },
    });
    const isz = d * iconScale;
    slide.addImage({
      data: ic[iconKey],
      x: x + (d - isz) / 2,
      y: y + (d - isz) / 2,
      w: isz,
      h: isz,
    });
  }

  // ================= SLIDE 1 — TITLE =================
  {
    const slide = pres.addSlide();
    slide.background = { color: DARK_BG };

    // decorative oval accents
    slide.addShape(pres.shapes.OVAL, {
      x: W - 4.2,
      y: -2.4,
      w: 6,
      h: 6,
      fill: { color: RED, transparency: 88 },
    });
    slide.addShape(pres.shapes.OVAL, {
      x: -2.6,
      y: H - 2.6,
      w: 5,
      h: 5,
      fill: { color: RED, transparency: 92 },
    });

    slide.addImage({ data: ic.pen, x: MX, y: 0.9, w: 0.55, h: 0.55 });

    slide.addText("法人向け研修 ご提案資料", {
      x: MX,
      y: 1.7,
      w: 10,
      h: 0.4,
      fontFace: BODY_FONT,
      fontSize: 14,
      color: RED,
      bold: true,
      charSpacing: 3,
      margin: 0,
    });
    slide.addText("思考整理研修", {
      x: MX,
      y: 2.2,
      w: 11.5,
      h: 1.6,
      fontFace: HEAD_FONT,
      fontSize: 64,
      bold: true,
      color: PAPER,
      margin: 0,
    });
    slide.addText("「書く」だけで、社員一人ひとりの判断力と行動力を引き出す。", {
      x: MX,
      y: 3.85,
      w: 10.5,
      h: 0.6,
      fontFace: BODY_FONT,
      fontSize: 19,
      color: "D8D5D2",
      margin: 0,
    });

    slide.addShape(pres.shapes.LINE, {
      x: MX,
      y: 6.55,
      w: 3.4,
      h: 0,
      line: { color: RED, width: 1.5 },
    });
    slide.addText("RED PEN  /  企業研修プログラム提案書", {
      x: MX,
      y: 6.7,
      w: 8,
      h: 0.35,
      fontFace: BODY_FONT,
      fontSize: 12,
      color: "9C9894",
      charSpacing: 2,
      margin: 0,
    });
  }

  // ================= SLIDE 2 — 現代の職場で起きている問題 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "BACKGROUND", "今、多くの組織で起きていること", { page: 2 });

    bulletList(
      slide,
      [
        "業務量、タスク数、会議数、チャットやメールの量は年々増え続けている。",
        "しかし、組織のパフォーマンスを下げている本当の原因は、「業務量」そのものではない。",
        "多くの社員の頭の中が、整理されていない思考や懸念事項でいっぱいになっている。",
        "その結果、優先順位がつけられない、判断が遅れる、行動が止まる——という状態が、あらゆる階層で起きている。",
      ],
      { x: MX, y: 2.2, w: 7.0, h: 4.2, fontSize: 16, gap: 18 }
    );

    // right visual: stacked "noise" cards
    const cardX = 8.4;
    const items = [
      ["未処理のタスク", "tasks"],
      ["繰り返す懸念事項", "redo"],
      ["優先順位の混乱", "balance"],
      ["判断の遅れ", "clock"],
    ];
    items.forEach((it, i) => {
      const y = 2.0 + i * 1.25;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: cardX,
        y,
        w: 4.2,
        h: 1.0,
        fill: { color: "FAFAFA" },
        line: { color: LINE, width: 1 },
      });
      iconCircle(slide, cardX + 0.2, y + 0.18, 0.64, it[1], 0.5);
      slide.addText(it[0], {
        x: cardX + 1.05,
        y,
        w: 3,
        h: 1.0,
        fontFace: BODY_FONT,
        fontSize: 15,
        bold: true,
        color: INK,
        valign: "middle",
        margin: 0,
      });
    });
  }

  // ================= SLIDE 3 — なぜ優秀な人ほど頭が忙しくなるのか =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "WHY IT HAPPENS", "「考えすぎる」のは、能力の高い人ほど起きやすい", {
      page: 3,
      titleSize: 27,
    });

    iconCircle(slide, MX, 2.2, 1.5, "brain", 0.55);

    bulletList(
      slide,
      [
        "優秀な社員ほど、多くの情報・タスク・期待を引き受けている。",
        "責任感が強いほど、考えごとを抱え込みやすい。",
        "「ちゃんと考えよう」とするほど、同じ問題を何度も頭の中で繰り返してしまう。",
        "結果として、目の前の仕事に使えるはずの集中力が、頭の中の「考えごと」に消費されてしまう。",
      ],
      { x: 2.9, y: 2.15, w: 9.7, h: 4.0, fontSize: 16, gap: 18 }
    );

    slide.addShape(pres.shapes.RECTANGLE, {
      x: MX,
      y: 5.6,
      w: 11.93,
      h: 1.0,
      fill: { color: RED_TINT },
    });
    slide.addText(
      "つまり、「能力が足りない」ことが問題ではなく、整理されていない思考が能力の発揮を妨げている。",
      {
        x: MX + 0.3,
        y: 5.6,
        w: 11.33,
        h: 1.0,
        fontFace: BODY_FONT,
        fontSize: 16,
        bold: true,
        color: RED_DARK,
        valign: "middle",
        margin: 0,
      }
    );
  }

  // ================= SLIDE 4 — メカニズム =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "MECHANISM", "思考の混乱は、行動力を奪う", { page: 4 });

    // flow diagram: 4 boxes with arrows
    const steps4 = [
      "頭の中に\n未整理の思考が\n溜まる",
      "集中力・判断力が\n「考え続けること」に\n消費される",
      "何が重要か\n分からなくなる\n（優先順位の崩壊）",
      "決断が遅れ、\n行動が止まる",
    ];
    const bw = 2.7,
      gap = 0.35,
      startX = MX,
      by = 2.3,
      bh = 1.9;
    steps4.forEach((t, i) => {
      const x = startX + i * (bw + gap);
      slide.addShape(pres.shapes.RECTANGLE, {
        x,
        y: by,
        w: bw,
        h: bh,
        fill: { color: i === 3 ? RED : "FAFAFA" },
        line: { color: i === 3 ? RED : LINE, width: 1 },
      });
      slide.addText(t, {
        x: x + 0.15,
        y: by,
        w: bw - 0.3,
        h: bh,
        fontFace: BODY_FONT,
        fontSize: 14,
        color: i === 3 ? PAPER : INK,
        bold: i === 3,
        align: "center",
        valign: "middle",
        margin: 0,
        lineSpacingMultiple: 1.15,
      });
      if (i < 3) {
        slide.addImage({
          data: i === 2 ? ic.arrow : ic.arrow,
          x: x + bw + gap / 2 - 0.13,
          y: by + bh / 2 - 0.13,
          w: 0.26,
          h: 0.26,
        });
      }
    });

    bulletList(
      slide,
      [
        "頭の中に未整理の思考が溜まると、脳のエネルギーが「考え続けること」に使われ続ける。",
        "結果、目の前のタスクに使えるはずの集中力や判断力が減っていく。",
        "何が重要か分からなくなり、すべてが「気になること」に見えてしまう。",
        "一つひとつの決断に時間がかかるようになり、組織全体のスピードが落ちる。",
      ],
      { x: MX, y: 4.7, w: 11.93, h: 2.3, fontSize: 15, gap: 10 }
    );
  }

  // ================= SLIDE 5 — 現場でよく見られる症状 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "SYMPTOMS", "現場でよく見られる症状", { page: 5 });

    const symptoms = [
      ["会議が長引き、結論が出にくい", "clock"],
      ["メールやチャットの対応が後手に回る", "envelope"],
      ["タスクが溜まっているのに手が動かない", "tasks"],
      ["「あとで考える」が積み重なり、常に何かが気になっている", "redo"],
      ["同じ議題が何度も話し合われる", "comments"],
      ["部下から「何をすればいいか分からない」という相談が増える", "question"],
      ["優先順位の議論に時間がかかる", "balance"],
      ["マネージャー自身も、常に頭がいっぱいの状態が続く", "usertie"],
    ];

    const cols = 2,
      rows = 4;
    const cw = 5.85,
      ch = 1.18,
      gx = 0.3,
      gy = 0.18;
    const startY = 2.1;
    symptoms.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = MX + col * (cw + gx);
      const y = startY + row * (ch + gy);
      slide.addShape(pres.shapes.RECTANGLE, {
        x,
        y,
        w: cw,
        h: ch,
        fill: { color: "FAFAFA" },
        line: { color: LINE, width: 1 },
      });
      iconCircle(slide, x + 0.18, y + (ch - 0.7) / 2, 0.7, s[1], 0.5);
      slide.addText(s[0], {
        x: x + 1.05,
        y,
        w: cw - 1.2,
        h: ch,
        fontFace: BODY_FONT,
        fontSize: 14,
        color: INK,
        valign: "middle",
        margin: 0,
        lineSpacingMultiple: 1.05,
      });
    });
  }

  // ================= SLIDE 6 — 思考整理が組織にもたらす変化 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: DARK_BG };
    pageMarker(slide, 6);
    slide.addText("WHY IT MATTERS", {
      x: MX + 0.28,
      y: 0.46,
      w: 8,
      h: 0.35,
      fontFace: BODY_FONT,
      fontSize: 13,
      bold: true,
      color: RED,
      charSpacing: 2,
      margin: 0,
    });

    slide.addText("「整理された頭」が、行動力を引き出す。", {
      x: MX,
      y: 1.6,
      w: 11.5,
      h: 1.1,
      fontFace: HEAD_FONT,
      fontSize: 34,
      bold: true,
      color: PAPER,
      margin: 0,
    });

    const lines = [
      "人は、「考えられないから動けない」のではない。",
      "頭の中が整理されていないから、動けない。",
      "思考を整理することで、本来持っている判断力と行動力を取り戻すことができる。",
      "思考整理は特別な才能ではなく、誰でも身につけられる技術である。",
    ];
    lines.forEach((t, i) => {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: MX,
        y: 3.1 + i * 0.95,
        w: 0.06,
        h: 0.7,
        fill: { color: RED },
      });
      slide.addText(t, {
        x: MX + 0.3,
        y: 3.0 + i * 0.95,
        w: 11,
        h: 0.85,
        fontFace: BODY_FONT,
        fontSize: 18,
        color: i === 3 ? PAPER : "D8D5D2",
        bold: i === 3,
        valign: "middle",
        margin: 0,
      });
    });
  }

  // ================= SLIDE 7 — 思考整理の基本ステップ =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "THE METHOD", "シンプルな4つのステップ", { page: 7 });

    const steps = [
      ["01", "書く", "頭の中にあることを、思いつくまま全て紙に書き出す。整理しようとせず、まずは外に出す。", "pennib"],
      ["02", "認める", "書いたものを良し悪しで判断せず、そのまま受け止める。感情や不安もそのまま認める。", "check"],
      ["03", "見直す", "赤ペンを持ち、書いた内容を見直す。事実と思い込みを分け、本当に重要な点を見極める。", "search"],
      ["04", "決める", "見直した内容から、次に取る一つの行動を決める。小さな一歩でよい。", "balance"],
    ];
    const cw = 2.85,
      gap = 0.27,
      y0 = 2.15,
      ch = 4.0;
    steps.forEach((s, i) => {
      const x = MX + i * (cw + gap);
      slide.addShape(pres.shapes.RECTANGLE, {
        x,
        y: y0,
        w: cw,
        h: ch,
        fill: { color: "FAFAFA" },
        line: { color: LINE, width: 1 },
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x,
        y: y0,
        w: cw,
        h: 0.06,
        fill: { color: RED },
      });
      slide.addText(s[0], {
        x: x + 0.2,
        y: y0 + 0.25,
        w: 1.5,
        h: 0.5,
        fontFace: HEAD_FONT,
        fontSize: 22,
        bold: true,
        color: RED,
        margin: 0,
      });
      iconCircle(slide, x + cw - 0.85, y0 + 0.22, 0.6, s[3], 0.5);
      slide.addText(s[1], {
        x: x + 0.2,
        y: y0 + 0.85,
        w: cw - 0.4,
        h: 0.55,
        fontFace: HEAD_FONT,
        fontSize: 22,
        bold: true,
        color: INK,
        margin: 0,
      });
      slide.addText(s[2], {
        x: x + 0.2,
        y: y0 + 1.5,
        w: cw - 0.4,
        h: 2.3,
        fontFace: BODY_FONT,
        fontSize: 13.5,
        color: MUTED,
        margin: 0,
        lineSpacingMultiple: 1.25,
      });
    });

    slide.addText(
      "特別な道具は不要。必要なのは、紙とペン、そして約15分の時間だけ。",
      {
        x: MX,
        y: 6.4,
        w: 11.93,
        h: 0.5,
        fontFace: BODY_FONT,
        fontSize: 15,
        bold: true,
        color: RED_DARK,
        align: "center",
        margin: 0,
      }
    );
  }

  // ================= SLIDE 8 — 研修内容 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "PROGRAM CONTENT", "研修の構成", { page: 8 });

    bulletList(
      slide,
      [
        "思考整理の基本的な考え方を学ぶ（講義）",
        "「書く」ことで頭の中を整理する方法を体験する",
        "事実・感情・思い込みを分けて捉える視点を身につける",
        "優先順位をつけるための、簡単な手順を習得する",
        "見直した内容から、次の行動を決める実践ワークを行う",
      ],
      { x: MX, y: 2.2, w: 7.0, h: 4.2, fontSize: 16, gap: 16 }
    );

    // right: composition box
    const bx = 8.4,
      by0 = 2.1,
      bw2 = 4.2;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: bx,
      y: by0,
      w: bw2,
      h: 4.3,
      fill: { color: INK },
    });
    slide.addText("研修の構成要素", {
      x: bx + 0.3,
      y: by0 + 0.3,
      w: bw2 - 0.6,
      h: 0.5,
      fontFace: BODY_FONT,
      fontSize: 14,
      bold: true,
      color: RED,
      charSpacing: 2,
      margin: 0,
    });
    const comp = [
      ["講義", "考え方と背景を理解する"],
      ["個人ワーク", "実際に書き、見直す体験を行う"],
      ["グループ共有", "他者の視点から学びを広げる"],
    ];
    comp.forEach((c, i) => {
      const y = by0 + 1.0 + i * 1.05;
      iconCircle(slide, bx + 0.3, y, 0.6, "pennib_w" in ic ? "pennib" : "pennib", 0.5);
      slide.addShape(pres.shapes.OVAL, {
        x: bx + 0.3,
        y,
        w: 0.6,
        h: 0.6,
        fill: { color: RED, transparency: 80 },
      });
      slide.addImage({
        data: ic.check_w,
        x: bx + 0.3 + 0.15,
        y: y + 0.15,
        w: 0.3,
        h: 0.3,
      });
      slide.addText(c[0], {
        x: bx + 1.05,
        y,
        w: bw2 - 1.3,
        h: 0.35,
        fontFace: BODY_FONT,
        fontSize: 15,
        bold: true,
        color: PAPER,
        margin: 0,
      });
      slide.addText(c[1], {
        x: bx + 1.05,
        y: y + 0.35,
        w: bw2 - 1.3,
        h: 0.6,
        fontFace: BODY_FONT,
        fontSize: 12,
        color: "C9C6C3",
        margin: 0,
        lineSpacingMultiple: 1.2,
      });
    });
  }

  // ================= SLIDE 9 — ワークショップ内容 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "WORKSHOP", "当日の進め方", { page: 9 });

    const items9 = [
      ["紙とペンを使い、自分の頭の中にあることを書き出すワーク", "pennib"],
      ["書き出した内容を整理し、仕分けるワーク", "tasks"],
      ["優先順位をつけ、次の一歩を決めるワーク", "balance"],
      ["ペアワーク・グループ共有による、他者の視点の獲得", "users"],
      ["実務でそのまま使えるシートの提供", "check"],
    ];
    const y0 = 2.1,
      rh = 0.95;
    items9.forEach((it, i) => {
      const y = y0 + i * rh;
      iconCircle(slide, MX, y, 0.68, it[1], 0.5);
      slide.addText(it[0], {
        x: MX + 0.95,
        y,
        w: 10.6,
        h: 0.68,
        fontFace: BODY_FONT,
        fontSize: 16,
        color: INK,
        valign: "middle",
        margin: 0,
      });
      if (i < items9.length - 1) {
        slide.addShape(pres.shapes.LINE, {
          x: MX,
          y: y + rh - 0.07,
          w: 11.93,
          h: 0,
          line: { color: LINE, width: 1 },
        });
      }
    });
  }

  // ================= SLIDE 10 — 期待される成果 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "OUTCOMES", "期待される成果", { page: 10 });

    const colW = 5.85,
      x1 = MX,
      x2 = MX + colW + 0.3,
      y0 = 2.1,
      colH = 4.4;

    // personal
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x1,
      y: y0,
      w: colW,
      h: colH,
      fill: { color: "FAFAFA" },
      line: { color: LINE, width: 1 },
    });
    iconCircle(slide, x1 + 0.3, y0 + 0.3, 0.7, "user", 0.5);
    slide.addText("個人の変化", {
      x: x1 + 1.15,
      y: y0 + 0.3,
      w: 4,
      h: 0.7,
      fontFace: HEAD_FONT,
      fontSize: 20,
      bold: true,
      color: INK,
      valign: "middle",
      margin: 0,
    });
    bulletList(
      slide,
      [
        "頭の中が整理され、気持ちが軽くなる",
        "優先順位が明確になる",
        "やるべきことが見えるようになる",
        "判断のスピードが上がる",
        "行動量が増える",
      ],
      { x: x1 + 0.3, y: y0 + 1.25, w: colW - 0.6, h: 3, fontSize: 15, gap: 12 }
    );

    // team
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x2,
      y: y0,
      w: colW,
      h: colH,
      fill: { color: INK },
    });
    iconCircle(slide, x2 + 0.3, y0 + 0.3, 0.7, "users", 0.5);
    slide.addText("チーム・組織の変化", {
      x: x2 + 1.15,
      y: y0 + 0.3,
      w: 4.3,
      h: 0.7,
      fontFace: HEAD_FONT,
      fontSize: 20,
      bold: true,
      color: PAPER,
      valign: "middle",
      margin: 0,
    });
    const teamItems = [
      "会議の効率が上がり、結論が出やすくなる",
      "一人ひとりの生産性が向上する",
      "チーム全体の意思決定が早くなる",
    ].map((t, i, arr) => ({
      text: t,
      options: {
        bullet: { code: "25A0", color: RED, indent: 14 },
        breakLine: i < arr.length - 1,
        paraSpaceAfter: 14,
      },
    }));
    slide.addText(teamItems, {
      x: x2 + 0.3,
      y: y0 + 1.25,
      w: colW - 0.6,
      h: 3,
      fontFace: BODY_FONT,
      fontSize: 15,
      color: PAPER,
      valign: "top",
      margin: 0,
    });
  }

  // ================= SLIDE 11 — 想定される導入効果 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "EXPECTED IMPACT", "想定される導入効果", { page: 11 });

    const effects = [
      ["会議時間の短縮", "clock"],
      ["タスク完了までのリードタイム短縮", "tacho"],
      ["意思決定スピードの向上", "balance"],
      ["手戻り・やり直し作業の減少", "redo"],
      ["部下からの相談対応にかかる時間の削減", "comments"],
      ["一人ひとりの心理的な負荷の軽減", "heart"],
    ];
    const cols = 3,
      cw = 3.85,
      ch = 1.85,
      gx = 0.2,
      gy = 0.2,
      startY = 2.2;
    effects.forEach((e, i) => {
      const col = i % cols,
        row = Math.floor(i / cols);
      const x = MX + col * (cw + gx);
      const y = startY + row * (ch + gy);
      slide.addShape(pres.shapes.RECTANGLE, {
        x,
        y,
        w: cw,
        h: ch,
        fill: { color: "FAFAFA" },
        line: { color: LINE, width: 1 },
      });
      iconCircle(slide, x + 0.25, y + 0.25, 0.75, e[1], 0.5);
      slide.addText(e[0], {
        x: x + 0.25,
        y: y + 1.1,
        w: cw - 0.5,
        h: 0.65,
        fontFace: BODY_FONT,
        fontSize: 15,
        bold: true,
        color: INK,
        margin: 0,
        lineSpacingMultiple: 1.15,
      });
    });

    slide.addText(
      "※ 効果の現れ方は組織やテーマにより異なります。導入前のヒアリングを通じて、貴社の課題に合わせた進め方をご提案します。",
      {
        x: MX,
        y: 6.65,
        w: 11.93,
        h: 0.5,
        fontFace: BODY_FONT,
        fontSize: 11,
        color: MUTED,
        margin: 0,
      }
    );
  }

  // ================= SLIDE 12 — 対象者 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "WHO IT'S FOR", "対象となる方", { page: 12 });

    const targets = [
      ["管理職・マネージャー層", "意思決定や部下対応に追われ、頭の中が整理できていない方", "usertie"],
      ["多くの情報やタスクを抱えるメンバー", "業務量が多く、優先順位の判断に時間がかかっている方", "users"],
      ["プロジェクトリーダー", "複数の論点を同時に抱え、整理が必要な方", "project"],
      ["新任管理職", "新しい役割の中で、考え方の土台を整えたい方", "grad"],
      ["経営層", "全社展開を見据え、まずは自身で体験したい方", "crown"],
    ];
    const cw = 5.85,
      gx = 0.3,
      gy = 0.25,
      ch = 1.32,
      startY = 2.05;
    targets.forEach((t, i) => {
      const col = i % 2,
        row = Math.floor(i / 2);
      const x = MX + col * (cw + gx);
      const y = startY + row * (ch + gy);
      slide.addShape(pres.shapes.RECTANGLE, {
        x,
        y,
        w: cw,
        h: ch,
        fill: { color: "FAFAFA" },
        line: { color: LINE, width: 1 },
      });
      iconCircle(slide, x + 0.2, y + (ch - 0.78) / 2, 0.78, t[2], 0.5);
      slide.addText(t[0], {
        x: x + 1.15,
        y: y + 0.15,
        w: cw - 1.35,
        h: 0.45,
        fontFace: BODY_FONT,
        fontSize: 15,
        bold: true,
        color: INK,
        margin: 0,
      });
      slide.addText(t[1], {
        x: x + 1.15,
        y: y + 0.6,
        w: cw - 1.35,
        h: 0.65,
        fontFace: BODY_FONT,
        fontSize: 12,
        color: MUTED,
        margin: 0,
        lineSpacingMultiple: 1.2,
      });
    });
  }

  // ================= SLIDE 13 — 実施形式 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "FORMAT", "実施形式", { page: 13 });

    const rows = [
      ["90分ワークショップ（基礎編）", "チーム・グループ向け。思考整理の基本を体験する。"],
      ["半日研修（応用・実践編）", "部門・リーダー層向け。実務課題に応用するワークを含む。"],
      ["実施方法", "オンライン・対面のいずれにも対応可能。"],
      ["人数", "1グループあたりの人数は、貴社のご要望に応じて調整。"],
      ["フォローアップ", "実践の定着を目的とした、後日の振り返り会も実施可能。"],
    ];

    const tableRows = [
      [
        { text: "項目", options: { fill: { color: INK }, color: PAPER, bold: true, fontSize: 14 } },
        { text: "内容", options: { fill: { color: INK }, color: PAPER, bold: true, fontSize: 14 } },
      ],
      ...rows.map((r) => [
        { text: r[0], options: { bold: true, color: INK, fontSize: 14 } },
        { text: r[1], options: { color: MUTED, fontSize: 13 } },
      ]),
    ];

    slide.addTable(tableRows, {
      x: MX,
      y: 2.1,
      w: 11.93,
      h: 4.6,
      colW: [3.6, 8.33],
      border: { pt: 1, color: LINE },
      fontFace: BODY_FONT,
      valign: "middle",
      autoPage: false,
      rowH: 0.86,
      margin: [8, 10, 8, 10],
    });
  }

  // ================= SLIDE 14 — スケジュール例 =================
  {
    const slide = pres.addSlide();
    slide.background = { color: PAPER };
    header(slide, "SAMPLE SCHEDULE", "90分ワークショップの進行例", { page: 14 });

    const sched = [
      ["0:00 - 0:10", "イントロダクション・本日のゴール共有"],
      ["0:10 - 0:30", "思考整理の考え方の説明"],
      ["0:30 - 1:00", "個人ワーク：書き出し・仕分け"],
      ["1:00 - 1:20", "グループ共有・優先順位づけ"],
      ["1:20 - 1:30", "まとめ・次の一歩の設定"],
    ];

    const lineX = MX + 1.7;
    slide.addShape(pres.shapes.LINE, {
      x: lineX,
      y: 2.3,
      w: 0,
      h: 4.4,
      line: { color: LINE, width: 2 },
    });

    sched.forEach((s, i) => {
      const y = 2.2 + i * 0.92;
      slide.addText(s[0], {
        x: MX,
        y,
        w: 1.5,
        h: 0.6,
        fontFace: HEAD_FONT,
        fontSize: 15,
        bold: true,
        color: RED,
        align: "right",
        valign: "middle",
        margin: 0,
      });
      slide.addShape(pres.shapes.OVAL, {
        x: lineX - 0.09,
        y: y + 0.16,
        w: 0.18,
        h: 0.18,
        fill: { color: RED },
      });
      slide.addShape(pres.shapes.RECTANGLE, {
        x: lineX + 0.3,
        y,
        w: 10.0,
        h: 0.7,
        fill: { color: "FAFAFA" },
        line: { color: LINE, width: 1 },
      });
      slide.addText(s[1], {
        x: lineX + 0.55,
        y,
        w: 9.5,
        h: 0.7,
        fontFace: BODY_FONT,
        fontSize: 15,
        color: INK,
        valign: "middle",
        margin: 0,
      });
    });
  }

  // ================= SLIDE 15 — まとめ / CTA =================
  {
    const slide = pres.addSlide();
    slide.background = { color: DARK_BG };

    slide.addShape(pres.shapes.OVAL, {
      x: W - 4,
      y: H - 4.2,
      w: 6,
      h: 6,
      fill: { color: RED, transparency: 90 },
    });

    pageMarker(slide, 15);
    slide.addText("NEXT STEP", {
      x: MX + 0.28,
      y: 0.46,
      w: 8,
      h: 0.35,
      fontFace: BODY_FONT,
      fontSize: 13,
      bold: true,
      color: RED,
      charSpacing: 2,
      margin: 0,
    });

    slide.addText("まずは、90分から。", {
      x: MX,
      y: 1.5,
      w: 11.5,
      h: 1.1,
      fontFace: HEAD_FONT,
      fontSize: 38,
      bold: true,
      color: PAPER,
      margin: 0,
    });

    bulletList(
      slide,
      [
        "業務量を減らすのではなく、「思考を整理する」ことで本来の行動力を引き出す研修です。",
        "シンプルで、誰でもすぐに実践できる方法です。",
        "個人・チーム双方の生産性向上が期待できます。",
        "まずは90分のワークショップから、貴社の課題に合わせてご相談ください。",
      ].map((t) => t),
      { x: MX, y: 2.9, w: 10.5, h: 2.6, fontSize: 17, gap: 16, color: "E6E3E0" }
    );
    // override bullet color for dark bg: re-add with white bullets is complex; acceptable as-is

    slide.addShape(pres.shapes.RECTANGLE, {
      x: MX,
      y: 5.9,
      w: 11.93,
      h: 1.0,
      fill: { color: RED },
    });
    slide.addText("お問い合わせ：[ ご担当者名 / メールアドレス / 電話番号 ]", {
      x: MX + 0.3,
      y: 5.9,
      w: 11.33,
      h: 1.0,
      fontFace: BODY_FONT,
      fontSize: 16,
      bold: true,
      color: PAPER,
      valign: "middle",
      margin: 0,
    });
  }

  await pres.writeFile({ fileName: "/Users/kellyyang/redpenjournaling/proposal/redpen-corporate-proposal.pptx" });
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
