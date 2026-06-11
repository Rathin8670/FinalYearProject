let nodes: string[] = [];
let index = 0;

export function initSfuNodesFromEnv() {
  const env = process.env.SFU_NODES || '';
  nodes = env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  
  if (nodes.length === 0) {
    nodes = ['sfu-1']; // fallback
  }
  
  console.log(`Initialized SFU nodes: ${nodes.join(', ')}`);
}

export function pickSfuNode(): string {
  // Simple round-robin
  const node = nodes[index % nodes.length];
  index += 1;
  return node;
}

export function getSfuNodes(): string[] {
  return [...nodes];
}

