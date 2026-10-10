import { dirs, key, place } from './engine.js';

export function machineConnections(state, machine) {
  const ports = [];
  for (let side = 0; side < 4; side++) {
    const [dx, dy] = dirs[side];
    const neighbor = state.blocks[key(machine.x + dx, machine.y + dy)];
    if (!neighbor) continue;
    const incoming = machine.type !== 'producer' && neighbor.type !== 'seller' && neighbor.dir === (side + 2) % 4;
    const outgoing = machine.type !== 'seller' && machine.dir === side && ['belt', 'factory', 'seller'].includes(neighbor.type);
    if (incoming || outgoing) ports.push({ side, incoming });
  }
  return ports;
}

// Only show ports that carry items: incoming outputs and the belt's chosen exit.
export function conveyorConnections(state, belt) {
  const inputs = [];
  for (let side = 0; side < 4; side++) {
    const [dx, dy] = dirs[side];
    const neighbor = state.blocks[key(belt.x + dx, belt.y + dy)];
    if (neighbor && neighbor.type !== 'seller' && neighbor.dir === (side + 2) % 4) {
      inputs.push(side);
    }
  }
  const [dx, dy] = dirs[belt.dir];
  const next = state.blocks[key(belt.x + dx, belt.y + dy)];
  return { inputs, output: belt.dir, outputConnected: !!next && ['belt', 'factory', 'seller'].includes(next.type) };
}

// A drag stroke turns its own preceding tile toward the next tile. Existing
// destinations retain their direction, and failed purchases leave the path intact.
export function extendConveyor(state, previous, next) {
  const dir = dirs.findIndex(([dx, dy]) => previous.x + dx === next.x && previous.y + dy === next.y);
  if (dir < 0) return { error: 'Conveyors must connect to a neighboring tile.' };
  const source = state.blocks[key(previous.x, previous.y)];
  if (source?.type !== 'belt') return { error: 'Start the path with a conveyor.' };
  const destination = state.blocks[key(next.x, next.y)];
  if (destination && !['belt', 'factory', 'seller'].includes(destination.type)) return { error: 'A producer is in the way. Start the conveyor beside its output.' };
  if (!destination) {
    const error = place(state, next.x, next.y, 'belt', null, dir);
    if (error) return { error };
  }
  source.dir = dir;
  return { direction: dir, joinedExisting: !!destination };
}
