// Render mobile field labels at build time; no client script is required.
export default function readingTables() {
  return tree => {
    const text = node => node.type === 'text' ? node.value : (node.children || []).map(text).join('');
    const walk = node => {
      if (node.tagName === 'table') {
        node.properties ||= {};
        node.properties.className = [...(node.properties.className || []), 'reading-table'];
        node.properties.role = 'table';
        const head = node.children.find(n => n.tagName === 'thead');
        const headings = head?.children.find(n => n.tagName === 'tr')?.children.filter(n => n.tagName === 'th') || [];
        const labels = headings.map(text);
        for (const heading of headings) heading.properties = {...heading.properties, scope:'col', role:'columnheader'};
        for (const group of node.children.filter(n => ['thead','tbody'].includes(n.tagName))) {
          group.properties = {...group.properties,role:'rowgroup'};
          for (const row of group.children.filter(n => n.tagName === 'tr')) {
            row.properties = {...row.properties,role:'row'};
            row.children.filter(n => n.tagName === 'td').forEach((cell,i) => {
              cell.properties = {...cell.properties,'data-label':labels[i] || '',role:'cell'};
            });
          }
        }
      }
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
  };
}
