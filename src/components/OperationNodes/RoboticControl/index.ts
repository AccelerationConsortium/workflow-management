/**
 * Export all Robotic Control nodes
 */

import { RobotMoveToNode } from './RobotMoveTo';
import { RobotPickNode } from './RobotPick';
import { RobotPlaceNode } from './RobotPlace';
import { RobotHomeNode } from './RobotHome';
import { RobotExecuteSequenceNode } from './RobotExecuteSequence';
import { RobotWaitNode } from './RobotWait';

export { RobotMoveToNode } from './RobotMoveTo';
export { RobotPickNode } from './RobotPick';
export { RobotPlaceNode } from './RobotPlace';
export { RobotHomeNode } from './RobotHome';
export { RobotExecuteSequenceNode } from './RobotExecuteSequence';
export { RobotWaitNode } from './RobotWait';
export { ROBOTIC_CONTROL_NODE_TYPES } from './types';

// Node type mapping for React Flow
export const RoboticControlNodes = {
  robot_move_to: RobotMoveToNode,
  robot_pick: RobotPickNode,
  robot_place: RobotPlaceNode,
  robot_home: RobotHomeNode,
  robot_execute_sequence: RobotExecuteSequenceNode,
  robot_wait: RobotWaitNode
} as const;