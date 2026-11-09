/* Component gallery: one page per component file in engine/lib, each drawing its components with sample data. Also a regression
 * test (test/lib.test.mjs): every component loads together, with no runtime errors and no name clobbering another.
 * When a component changes or is added, update this file too. */
(function (root) {
  const META = {
    style: 'study',
    title: '组件样片',
    name: '组件样片',
    gap: 0.4,
    extras: ['engine/lib/bookshelf.js', 'engine/lib/bots.js', 'engine/lib/cells.js', 'engine/lib/debris.js', 'engine/lib/dialog.js', 'engine/lib/filetree.js', 'engine/lib/flowgraph.js', 'engine/lib/fsm.js', 'engine/lib/gates.js', 'engine/lib/gauges.js', 'engine/lib/layers.js', 'engine/lib/matrix.js', 'engine/lib/messages.js', 'engine/lib/meters.js', 'engine/lib/notes.js', 'engine/lib/pipeline.js', 'engine/lib/pointcloud.js', 'engine/lib/radar.js', 'engine/lib/ranking.js', 'engine/lib/receipt.js', 'engine/lib/scorecard.js', 'engine/lib/segments.js', 'engine/lib/sequence.js', 'engine/lib/switches.js', 'engine/lib/terminal.js', 'engine/lib/tower.js', 'engine/lib/waffle.js', 'engine/lib/warm.js'],
  };
  const PAGES = [
    { id: 'p01', section: 'bookshelf', title: 'bookshelf.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p02', section: 'bots', title: 'bots.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p03', section: 'cells', title: 'cells.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p04', section: 'debris', title: 'debris.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p05', section: 'dialog', title: 'dialog.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p06', section: 'filetree', title: 'filetree.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p07', section: 'flowgraph', title: 'flowgraph.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p08', section: 'fsm', title: 'fsm.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p09', section: 'gates', title: 'gates.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p10', section: 'gauges', title: 'gauges.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p11', section: 'layers', title: 'layers.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p12', section: 'matrix', title: 'matrix.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p13', section: 'messages', title: 'messages.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p14', section: 'meters', title: 'meters.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p15', section: 'notes', title: 'notes.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p16', section: 'pipeline', title: 'pipeline.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p17', section: 'pointcloud', title: 'pointcloud.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p18', section: 'radar', title: 'radar.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p19', section: 'ranking', title: 'ranking.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p20', section: 'receipt', title: 'receipt.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p21', section: 'scorecard', title: 'scorecard.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p22', section: 'segments', title: 'segments.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p23', section: 'sequence', title: 'sequence.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p24', section: 'switches', title: 'switches.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p25', section: 'terminal', title: 'terminal.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p26', section: 'tower', title: 'tower.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
    { id: 'p27', section: 'waffle', title: 'waffle.js', cues: ['第一句：组件依次出现。', '第二句：数值跟着时间变化。', { t: '第三句：停在最后的样子。', hold: 0.8 }] },
  ];
  root.SCRIPT = { META, PAGES };
})(typeof window !== 'undefined' ? window : globalThis);
