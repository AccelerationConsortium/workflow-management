import { BaseDeviceController } from './BaseDeviceController';
import { CommunicationProtocol } from '../communication/interfaces';
import { UOType, UOParameterTemplates } from '../types/GenericUnitOperation';

interface Position {
  x: number;
  y: number;
  z: number;
}

export class RoboticArmController extends BaseDeviceController {
  private config: {
    host: string;
    port: number;
    model: string;
    workspaceLimit: {
      min: Position;
      max: Position;
    };
  };

  constructor(
    protocol: CommunicationProtocol,
    config: {
      host: string;
      port: number;
      model: string;
      workspaceLimit: {
        min: Position;
        max: Position;
      };
    }
  ) {
    super(protocol);
    this.config = config;

    // Register supported operations
    this.addSupportedOperation(UOType.PICK_AND_PLACE);
    this.addSupportedOperation(UOType.MIXING);
  }

  protected getDeviceHost(): string {
    return this.config.host;
  }

  protected getDevicePort(): number {
    return this.config.port;
  }

  protected validateParameters(operationType: UOType, params: Record<string, any>): void {
    switch (operationType) {
      case UOType.PICK_AND_PLACE:
        this.validatePickAndPlaceParams(params);
        break;
      case UOType.MIXING:
        this.validateMixingParams(params);
        break;
      default:
        throw new Error(`Unsupported operation type: ${operationType}`);
    }
  }

  private validatePickAndPlaceParams(params: Record<string, any>): void {
    const { sourcePosition, targetPosition, objectType } = params;

    // Validate positions
    this.validatePosition(sourcePosition, 'source');
    this.validatePosition(targetPosition, 'target');

    // Validate object type
    if (!['tube', 'plate', 'tip', 'container'].includes(objectType)) {
      throw new Error(`Invalid object type: ${objectType}`);
    }
  }

  private validateMixingParams(params: Record<string, any>): void {
    const { speed, duration, direction } = params;

    // Validate speed (RPM)
    if (typeof speed !== 'number' || speed < 0 || speed > 3000) {
      throw new Error('Speed must be between 0 and 3000 RPM');
    }

    // Validate duration (seconds)
    if (typeof duration !== 'number' || duration <= 0) {
      throw new Error('Duration must be greater than 0 seconds');
    }

    // Validate direction
    if (!['clockwise', 'counterclockwise'].includes(direction)) {
      throw new Error('Direction must be either "clockwise" or "counterclockwise"');
    }
  }

  private validatePosition(position: Position, positionType: string): void {
    // Check if position is within workspace limits
    if (!position || typeof position !== 'object') {
      throw new Error(`Invalid ${positionType} position format`);
    }

    const { x, y, z } = position;
    const { min, max } = this.config.workspaceLimit;

    if (x < min.x || x > max.x || y < min.y || y > max.y || z < min.z || z > max.z) {
      throw new Error(`${positionType} position is outside workspace limits`);
    }
  }

  // Additional robotic arm specific methods
  async moveToPosition(position: Position): Promise<void> {
    this.validatePosition(position, 'target');
    await this.protocol.sendCommand('MOVE_TO', position);
  }

  async setGripperState(open: boolean): Promise<void> {
    await this.protocol.sendCommand('SET_GRIPPER', { open });
  }

  async calibrate(): Promise<void> {
    await this.protocol.sendCommand('CALIBRATE');
  }

  async emergencyStop(): Promise<void> {
    await this.protocol.sendCommand('EMERGENCY_STOP');
    this.updateStatus({ state: 'idle' });
  }
} 
