from pathlib import Path
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[4]
BASE = ROOT / "docs" / "talks" / "video-is-frontend"
ASSETS = BASE / "assets"
OUT = BASE / "deliverables" / "视频这活儿越来越像前端了-分享讲稿.docx"

INK = "1C1917"
MUTED = "6E645B"
TAN = "D4A574"
PAPER = "FAF8F3"
PALE = "F3ECE2"
BLUE = "8CB6CC"
GRID = "D9D4CD"
FONT = "Hiragino Sans GB"


def font(run, size=11.5, bold=False, color=INK):
    run.font.name = FONT
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), FONT)
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), FONT)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), FONT)
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    return run


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def borders(table, color=GRID, size="6"):
    tbl_pr = table._tbl.tblPr
    tbl_borders = tbl_pr.find(qn("w:tblBorders"))
    if tbl_borders is None:
        tbl_borders = OxmlElement("w:tblBorders")
        tbl_pr.append(tbl_borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = qn(f"w:{edge}")
        el = tbl_borders.find(tag)
        if el is None:
            el = OxmlElement(f"w:{edge}")
            tbl_borders.append(el)
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), size)
        el.set(qn("w:color"), color)


def margins(cell, top=110, start=140, bottom=110, end=140):
    tc = cell._tc.get_or_add_tcPr()
    tc_mar = tc.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_text(cell, text, bold=False, color=INK, size=10.5, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    font(p.add_run(text), size=size, bold=bold, color=color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    margins(cell)


def add_table(doc, headers, rows, widths):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for i, (h, w) in enumerate(zip(headers, widths)):
        table.columns[i].width = Inches(w)
        set_cell_text(table.rows[0].cells[i], h, bold=True, color="FFFFFF", size=10)
        shade(table.rows[0].cells[i], INK)
    for ridx, row in enumerate(rows):
        cells = table.add_row().cells
        for i, (value, w) in enumerate(zip(row, widths)):
            cells[i].width = Inches(w)
            set_cell_text(cells[i], value, size=10.2)
            if ridx % 2:
                shade(cells[i], PAPER)
    borders(table)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_para(doc, text="", size=11.5, bold=False, color=INK, before=0, after=7, align=None, keep=False):
    p = doc.add_paragraph()
    if align is not None:
        p.alignment = align
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.38
    p.paragraph_format.keep_with_next = keep
    font(p.add_run(text), size=size, bold=bold, color=color)
    return p


def add_bullets(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.left_indent = Inches(0.24)
        p.paragraph_format.first_line_indent = Inches(-0.16)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        font(p.add_run(item), size=11.2)


def add_label(doc, label, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(5)
    p.paragraph_format.space_after = Pt(7)
    p.paragraph_format.line_spacing = 1.35
    font(p.add_run(label + "  "), size=10.5, bold=True, color=MUTED)
    font(p.add_run(text), size=11.3, color=INK)
    return p


def add_image(doc, path, width=6.7, caption=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(5)
    p.add_run().add_picture(str(path), width=Inches(width))
    if caption:
        c = doc.add_paragraph()
        c.alignment = WD_ALIGN_PARAGRAPH.CENTER
        c.paragraph_format.space_after = Pt(8)
        font(c.add_run(caption), size=9.5, color=MUTED)


def add_slide_section(doc, n, title, timing, screen, script, cue=None, image=None, image_width=6.7):
    p = doc.add_paragraph(style="Heading 1")
    p.paragraph_format.page_break_before = True
    p.paragraph_format.keep_with_next = True
    font(p.add_run(f"第 {n} 页  {title}"), size=19, bold=True)
    add_para(doc, timing, size=10.5, color=MUTED, after=9)
    if image:
        add_image(doc, image, width=image_width)
    add_label(doc, "屏幕内容", screen)
    add_label(doc, "口头讲述", script)
    if cue:
        add_label(doc, "演示提示", cue)


def setup_styles(doc):
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = FONT
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    normal.font.size = Pt(11.5)
    normal.font.color.rgb = RGBColor.from_string(INK)
    for name, size in (("Title", 30), ("Subtitle", 15), ("Heading 1", 19), ("Heading 2", 14)):
        st = styles[name]
        st.font.name = FONT
        st._element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
        st.font.size = Pt(size)
        st.font.bold = name != "Subtitle"
        st.font.color.rgb = RGBColor.from_string(INK)


def build():
    doc = Document()
    setup_styles(doc)
    sec = doc.sections[0]
    sec.page_width = Inches(8.5)
    sec.page_height = Inches(11)
    sec.top_margin = Inches(0.72)
    sec.bottom_margin = Inches(0.72)
    sec.left_margin = Inches(0.78)
    sec.right_margin = Inches(0.78)

    title = doc.add_paragraph(style="Title")
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    title.paragraph_format.space_before = Pt(18)
    title.paragraph_format.space_after = Pt(8)
    font(title.add_run("视频这活儿越来越像前端了"), size=30, bold=True)
    subtitle = doc.add_paragraph(style="Subtitle")
    subtitle.paragraph_format.space_after = Pt(18)
    font(subtitle.add_run("当视频变成可生成 可检查 可修改的数字产品"), size=15, color=MUTED)
    add_image(doc, ASSETS / "cover-video-meets-frontend.png", width=6.85)
    add_para(doc, "30 分钟分享讲稿", size=11, bold=True, color=MUTED, before=5, after=3)
    add_para(doc, "面向前端开发者与 AI 应用开发者", size=10.5, color=MUTED)

    p = doc.add_paragraph(style="Heading 1")
    p.paragraph_format.page_break_before = True
    font(p.add_run("使用说明"), size=19, bold=True)
    add_para(doc, "这份讲稿与 12 页幻灯片一一对应。每一节都给出屏幕内容、口头讲述和演示提示。排练时先按完整稿讲一遍，再把自然熟悉的段落压缩成关键词。", after=9)
    add_table(doc, ["时间", "章节", "目标"], [
        ("0–3 分钟", "提出问题", "用一条成片和一个小修改建立共同对象"),
        ("3–14 分钟", "解释类比", "说明视频为什么开始具备前端产品的特征"),
        ("14–22 分钟", "Agent 工作流", "讲清规划 生成 观察 修正的反馈闭环"),
        ("22–27 分钟", "人工接管", "展示局部修改和版本恢复"),
        ("27–30 分钟", "边界与结论", "说明适用范围并给出可迁移的方法"),
    ], [1.15, 1.55, 3.8])
    add_para(doc, "全场主张", size=13, bold=True, before=8, after=4)
    add_para(doc, "当视频不再只是一条导出的 MP4，而是一套可以继续运行和修改的内容系统，前端工程的方法开始进入视频制作。当这套系统能够提供明确反馈，Agent 才真正有机会参与其中。")
    add_para(doc, "讲述原则", size=13, bold=True, before=8, after=4)
    add_bullets(doc, [
        "TimoTV 是案例，不是整场分享的主角。",
        "不展开仓库结构和代码实现，只解释听众看得到的工作方式。",
        "每一个抽象观点都用成片、截图或一次修改来落地。",
        "现场生成部分优先使用录屏，手工编辑和版本恢复可以现场完成。",
    ])

    add_slide_section(doc, 1, "视频这活儿 越来越像前端了", "约 40 秒",
        "标题、主视觉、副标题。",
        "今天我想分享一个做 TimoTV 时越来越强烈的感受：我明明在做视频，却一直在处理组件、状态、预览、检查和版本。视频制作里出现的很多问题，开始像我们熟悉的数字产品问题。这里说的不是视频等于网页，而是一种制作方式正在发生变化。",
        "标题出现后停一拍。先说观察，再介绍项目名称。",
        ASSETS / "cover-video-meets-frontend.png")

    add_slide_section(doc, 2, "先看一段视频", "约 2 分钟",
        "播放《测不准原理》20 到 30 秒片段。",
        "先不解释它是怎么做的。大家只要留意三件事：文字和旁白怎样配合，图形怎样跟着讲述展开，以及重点怎样在时间上被强调。接下来我们就拿这一小段作为共同对象。",
        "保留声音。播放结束后立即切到下一页，不评价画面质量。",
        ASSETS / "uncertainty.jpg")

    add_slide_section(doc, 3, "现在改一个小地方", "约 1 分钟",
        "屏幕上只出现一句需求：标签往左一点 这句话提前半秒 标题换一个颜色。",
        "看完之后，我不问能不能再生成一条。我只想改三个小地方：标签往左一点，这句话提前半秒，标题换一个颜色。这个问题很重要，因为创作真正花时间的地方，通常不是第一次得到结果，而是接下来几十次小修改。",
        "这一页保持极简。逐条说出三个要求，给观众时间想象传统修改过程。")

    add_slide_section(doc, 4, "MP4 只是最后的结果", "约 2 分钟",
        "左边是一条导出的视频，右边是一套仍然可编辑的内容系统。",
        "观众最后看到的是 MP4，但制作过程里还有内容结构、画面元素、时间关系、声音、风格和修改记录。只要这些东西还在，视频就不是封死的成品，而是一套可以继续演化的系统。可以把 MP4 想成网站的一张整页截图：它是结果，却不是产品本身。这个类比的边界也很清楚，视频最终仍然是线性观看的媒介。",
        "用封面配图右侧的模块化画面辅助理解，不介绍底层实现。",
        ASSETS / "cover-video-meets-frontend.png")

    add_slide_section(doc, 5, "它为什么开始像前端", "约 3 分钟",
        "五组映射：结构与规则、组件复用、时间状态、即时预览、持续迭代。",
        "第一，内容由结构和规则组织，不再只存在于一条扁平时间线上。第二，标题、卡片、图表和视觉语言可以复用。第三，时间推进决定元素何时出现、变化和离开。第四，任意时刻都能回看和比较。第五，一处内容可以局部修改并保留历史。这里迁移的不是某个框架，而是前端开发长期积累的产品工程方法。",
        "五项逐一出现。不要在这一页展开 Agent。")

    add_slide_section(doc, 6, "时间就是视频的状态", "约 4 分钟",
        "同一页的三个时刻，以及一句公式：画面 = f（时间）。",
        "前端里，我们习惯说界面由当前状态决定。到了视频里，最核心的状态就是时间。同一组内容在第一个时刻刚刚出现，第二个时刻建立关系，第三个时刻强调结论。它们不是三张互不相关的图片，而是同一个画面系统随时间变化的三个状态。这个抽象带来很实际的能力：可以直接跳到问题发生的时刻，可以抽取关键时刻比较，也可以在修改之后重新得到连续画面。",
        "指着三幅画面按从左到右的顺序讲。到公式时停顿，不进入技术实现。",
        ASSETS / "time-as-state.png")

    add_slide_section(doc, 7, "Agent 不是一键生成按钮", "约 2 分钟",
        "从想法或资料到发布的完整流程，包含用户确认、逐页制作、检查和返工。",
        "一旦视频有了结构、状态和预览能力，Agent 就可以参与。但它的价值不是按下一次生成按钮，而是跨越多个步骤继续工作：先规划内容和分镜，用户确认方向，再写讲稿、生成声音、逐页完成画面、检查关键时刻，发现问题后回去修改，最后让人完成微调。",
        "沿流程方向讲一遍。强调 Director Harness 负责编排和恢复，Planner、Page Agent 与 Reviewer 只处理各自阶段。",
        ASSETS / "agent-harness-capture" / "timotv-agent-harness.visual-check.2048x1320.light.png",
        image_width=6.65)

    add_slide_section(doc, 8, "先确认 再制作", "约 2 分钟",
        "一张分镜确认画面，突出用户在画面制作前介入。",
        "如果内容结构还没有确认，越早生成精美画面，返工成本越高。所以第一处重要的人机协作不是最后审批，而是在制作前确认分镜。人决定要讲什么、叙事顺序是否成立、哪些重点值得保留。Agent 再去完成执行量更大的部分。",
        "展示实际分镜界面或准备好的静态截图。把重点放在介入时机。")

    add_slide_section(doc, 9, "生成 观察 再修改", "约 4 分钟",
        "一次真实问题的闭环：初稿、发现问题、具体反馈、修改后画面。",
        "可靠性不只来自模型本身，也来自模型所在的工作环境。任务有没有边界，结果能不能观察，问题能不能反馈，修改能不能局部发生，这些都会影响最终结果。逐页制作让范围变小，关键时刻的检查让问题变得可见。最重要的是反馈要具体：不是说再好看一点，而是指出哪一处重叠、哪一个重点不清楚、哪一段和讲稿不同步。",
        "准备真实失败案例。若用教学复现，要明确说明。先展示问题，让观众自己看两秒，再揭示反馈。")

    add_slide_section(doc, 10, "最后的百分之十", "约 5 分钟",
        "编辑器现场演示：移动元素、改字、调时间、交给 AI、恢复版本。",
        "生成之后，人才刚刚接手。人在这里负责内容判断、审美取舍和最后的精确控制。我们回到开头的三个小要求：移动标签、修改颜色、提前半秒。小改动可以直接完成，更复杂的意图可以重新交给 Agent。保存之后可以查看历史，改坏了也能恢复。让人容易修改不是生成能力之外的附属功能，它决定了创作者是否敢把真实工作交给 AI。",
        "现场完成移动、改字和恢复版本。AI 修改用录屏，避免网络和等待打断节奏。",
        ASSETS / "editor-zh.png")

    add_slide_section(doc, 11, "适用范围与边界", "约 2 分钟",
        "左侧是适用场景，右侧是暂时不适合用这套逻辑概括的场景。",
        "这套方式比较适合知识讲解、信息图、概念动画，以及需要统一风格和反复修改的内容。它不适合概括所有视频创作。真人表演、纪录片现场、复杂三维特效和高度探索性的艺术创作，都有不同的生产逻辑。自动检查也只能发现部分问题，不能证明内容正确；几个关键时刻正常，也不能保证整段节奏自然。",
        "边界不是自我否定，而是让标题成为一个可验证的观察。")

    add_slide_section(doc, 12, "三个可以带走的做法", "约 2 分钟",
        "三句话：让结果保持结构；让系统观察并反馈；让人局部接管和恢复。",
        "最后回到那三个小修改。如果一条视频能够理解要求、准确定位对象、立即看到结果、保存修改并随时恢复，它已经不太像一次性交付的文件，而更像一个持续迭代的数字产品。视频越来越像前端，不是因为它用了什么技术，而是因为它开始拥有结构、状态、反馈和迭代。对其他 AI 产品也一样：让生成结果保持结构，让系统能观察并反馈，让人能够局部接管、尝试和恢复。",
        "讲完三个做法后停顿，回到标题页或保留本页进入问答。",
        ASSETS / "human-agent-collaboration.png")

    p = doc.add_paragraph(style="Heading 1")
    p.paragraph_format.page_break_before = True
    font(p.add_run("演示检查表"), size=19, bold=True)
    add_bullets(doc, [
        "开场成片控制在 20 到 30 秒，并提前确认现场声音。",
        "准备同一页三个时间点的静态图，避免现场定位失败。",
        "问题闭环使用真实案例，或明确标注为教学复现。",
        "AI 局部修改使用录屏，保留真实等待但剪掉无意义停顿。",
        "现场演示只做确定性强的移动、改字、调时间和版本恢复。",
        "准备全部演示的离线视频与截图。",
        "清理密钥、私人路径和无关对话。",
        "完整排练一次，并在 27 分钟处进入最后两页。",
    ])
    add_para(doc, "问答准备", size=14, bold=True, before=12, after=5)
    add_table(doc, ["问题", "回答重点"], [
        ("这是不是把网页录成视频", "视频被组织成可持续修改的内容系统，具体渲染方式不是本场重点。"),
        ("和直接生成视频有什么不同", "这里优先追求文字、布局、节奏和局部修改的可控性，两者可以组合。"),
        ("为什么需要 Agent", "价值在于跨越规划、制作、检查和修正多个步骤，并继续使用反馈。"),
        ("自动检查能保证质量吗", "不能。它降低明显错误，最终仍需检查内容、节奏、声音和审美。"),
        ("前端开发者真的能做视频吗", "结构、组件、状态和迭代经验可以迁移，叙事、节奏和镜头仍需学习。"),
    ], [2.25, 4.25])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
