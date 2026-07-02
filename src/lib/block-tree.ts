// Pure, immutable operations on a block tree. Shared by the admin editor.
import { type Block, uid } from "@/lib/blocks";

/** Depth-first search for a block by id. */
export function findBlock(blocks: Block[], id: string): Block | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const hit = findBlock(b.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

/** Return a new tree with the matching block replaced by updater(block). */
export function updateBlock(
  blocks: Block[],
  id: string,
  updater: (b: Block) => Block,
): Block[] {
  return blocks.map((b) => {
    if (b.id === id) return updater(b);
    if (b.children) {
      return { ...b, children: updateBlock(b.children, id, updater) };
    }
    return b;
  });
}

/** Remove a block by id anywhere in the tree. */
export function removeBlock(
  blocks: Block[],
  id: string,
): { blocks: Block[]; removed: Block | null } {
  let removed: Block | null = null;
  const walk = (list: Block[]): Block[] => {
    const out: Block[] = [];
    for (const b of list) {
      if (b.id === id) {
        removed = b;
        continue;
      }
      if (b.children) {
        out.push({ ...b, children: walk(b.children) });
      } else {
        out.push(b);
      }
    }
    return out;
  };
  const next = walk(blocks);
  return { blocks: next, removed };
}

/** Insert `node` into `parentId`'s children before `beforeId` (null = append).
 * parentId null targets the root list. */
export function insertBefore(
  blocks: Block[],
  parentId: string | null,
  beforeId: string | null,
  node: Block,
): Block[] {
  const splice = (list: Block[]): Block[] => {
    if (beforeId === null) return [...list, node];
    const idx = list.findIndex((b) => b.id === beforeId);
    if (idx < 0) return [...list, node];
    return [...list.slice(0, idx), node, ...list.slice(idx)];
  };

  if (parentId === null) return splice(blocks);

  return blocks.map((b) => {
    if (b.id === parentId) {
      return { ...b, children: splice(b.children ?? []) };
    }
    if (b.children) {
      return { ...b, children: insertBefore(b.children, parentId, beforeId, node) };
    }
    return b;
  });
}

/** True if `ancestorId` contains `descendantId` (or they are the same). */
export function contains(blocks: Block[], ancestorId: string, descendantId: string): boolean {
  const node = findBlock(blocks, ancestorId);
  if (!node) return false;
  if (ancestorId === descendantId) return true;
  return Boolean(node.children && findBlock(node.children, descendantId));
}

/** Deep-clone a block subtree assigning fresh ids throughout. */
export function cloneWithNewIds(block: Block): Block {
  return {
    ...block,
    id: uid(),
    props: { ...block.props },
    children: block.children?.map(cloneWithNewIds),
  };
}

/** Duplicate a block, inserting the clone immediately after the original. */
export function duplicateBlock(blocks: Block[], id: string): Block[] {
  const original = findBlock(blocks, id);
  if (!original) return blocks;
  const clone = cloneWithNewIds(original);

  const walk = (list: Block[]): Block[] => {
    const idx = list.findIndex((b) => b.id === id);
    if (idx >= 0) {
      return [...list.slice(0, idx + 1), clone, ...list.slice(idx + 1)];
    }
    return list.map((b) =>
      b.children ? { ...b, children: walk(b.children) } : b,
    );
  };
  return walk(blocks);
}

/** Move a block to a new position (parentId + beforeId). No-op if it would
 * nest a container inside its own descendant. */
export function moveBlock(
  blocks: Block[],
  sourceId: string,
  parentId: string | null,
  beforeId: string | null,
): Block[] {
  if (sourceId === beforeId) return blocks;
  if (parentId && contains(blocks, sourceId, parentId)) return blocks;
  const { blocks: without, removed } = removeBlock(blocks, sourceId);
  if (!removed) return blocks;
  return insertBefore(without, parentId, beforeId, removed);
}

/** Shift a block one step up/down within its own parent list. */
export function nudgeBlock(
  blocks: Block[],
  id: string,
  dir: -1 | 1,
): Block[] {
  const walk = (list: Block[]): Block[] => {
    const idx = list.findIndex((b) => b.id === id);
    if (idx >= 0) {
      const target = idx + dir;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return next;
    }
    return list.map((b) =>
      b.children ? { ...b, children: walk(b.children) } : b,
    );
  };
  return walk(blocks);
}
