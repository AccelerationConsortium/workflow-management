import { BaseTaskExecutor } from './flowAdapter';
import { IWorkflowService } from '../workflow/interfaces/IWorkflowService';
import {
  HotplateParameters,
  PumpParameters,
  ValveParameters,
  SensorParameters,
  DataProcessingParameters,
  FileInputParameters,
  FileOutputParameters,
  ExecutionResult
} from '../workflow/interfaces/IWorkflowService';

/**
 * Factory for creating task executors
 */
export class TaskExecutorFactory {
  constructor(private workflowService: IWorkflowService) {}

  createExecutor(nodeType: string, nodeId: string): BaseTaskExecutor {
    switch (nodeType) {
      case 'HotplateControl':
        return new HotplateControlExecutor(nodeId, this.workflowService);
      case 'PumpControl':
        return new PumpControlExecutor(nodeId, this.workflowService);
      case 'ValveControl':
        return new ValveControlExecutor(nodeId, this.workflowService);
      case 'SensorNode':
        return new SensorNodeExecutor(nodeId, this.workflowService);
      case 'DataProcessing':
        return new DataProcessingExecutor(nodeId, this.workflowService);
      case 'FileInput':
        return new FileInputExecutor(nodeId, this.workflowService);
      case 'FileOutput':
        return new FileOutputExecutor(nodeId, this.workflowService);
      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  }
}

/**
 * Hotplate Control Task Executor
 */
export class HotplateControlExecutor extends BaseTaskExecutor {
  constructor(
    nodeId: string,
    private workflowService: IWorkflowService
  ) {
    super(nodeId, 'HotplateControl');
  }

  async execute(parameters: HotplateParameters): Promise<ExecutionResult> {
    try {
      // Allocate device
      await this.workflowService.allocateResources(this.nodeId, {
        deviceType: 'hotplate',
        exclusive: true
      });

      // Execute control
      const result = await this.workflowService.executeHotplateControl(
        this.nodeId,
        parameters
      );

      return result;
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    await this.workflowService.releaseResources(this.nodeId);
  }
}

/**
 * Pump Control Task Executor
 */
export class PumpControlExecutor extends BaseTaskExecutor {
  constructor(
    nodeId: string,
    private workflowService: IWorkflowService
  ) {
    super(nodeId, 'PumpControl');
  }

  async execute(parameters: PumpParameters): Promise<ExecutionResult> {
    try {
      await this.workflowService.allocateResources(this.nodeId, {
        deviceType: 'pump',
        exclusive: true
      });

      const result = await this.workflowService.executePumpControl(
        this.nodeId,
        parameters
      );

      return result;
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    await this.workflowService.releaseResources(this.nodeId);
  }
}

/**
 * Valve Control Task Executor
 */
export class ValveControlExecutor extends BaseTaskExecutor {
  constructor(
    nodeId: string,
    private workflowService: IWorkflowService
  ) {
    super(nodeId, 'ValveControl');
  }

  async execute(parameters: ValveParameters): Promise<ExecutionResult> {
    try {
      await this.workflowService.allocateResources(this.nodeId, {
        deviceType: 'valve',
        exclusive: true
      });

      const result = await this.workflowService.executeValveControl(
        this.nodeId,
        parameters
      );

      return result;
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    await this.workflowService.releaseResources(this.nodeId);
  }
}

/**
 * Sensor Node Task Executor
 */
export class SensorNodeExecutor extends BaseTaskExecutor {
  constructor(
    nodeId: string,
    private workflowService: IWorkflowService
  ) {
    super(nodeId, 'SensorNode');
  }

  async execute(parameters: SensorParameters): Promise<ExecutionResult> {
    try {
      await this.workflowService.allocateResources(this.nodeId, {
        deviceType: `sensor_${parameters.sensorType}`,
        exclusive: false
      });

      const result = await this.workflowService.executeSensorReading(
        this.nodeId,
        parameters
      );

      return result;
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    await this.workflowService.releaseResources(this.nodeId);
  }
}

/**
 * Data Processing Task Executor
 */
export class DataProcessingExecutor extends BaseTaskExecutor {
  constructor(
    nodeId: string,
    private workflowService: IWorkflowService
  ) {
    super(nodeId, 'DataProcessing');
  }

  async execute(parameters: DataProcessingParameters): Promise<ExecutionResult> {
    try {
      const result = await this.workflowService.executeDataProcessing(
        this.nodeId,
        parameters
      );

      return result;
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }
}

/**
 * File Input Task Executor
 */
export class FileInputExecutor extends BaseTaskExecutor {
  constructor(
    nodeId: string,
    private workflowService: IWorkflowService
  ) {
    super(nodeId, 'FileInput');
  }

  async execute(parameters: FileInputParameters): Promise<ExecutionResult> {
    try {
      const result = await this.workflowService.executeFileInput(
        this.nodeId,
        parameters
      );

      return result;
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }
}

/**
 * File Output Task Executor
 */
export class FileOutputExecutor extends BaseTaskExecutor {
  constructor(
    nodeId: string,
    private workflowService: IWorkflowService
  ) {
    super(nodeId, 'FileOutput');
  }

  async execute(parameters: FileOutputParameters): Promise<ExecutionResult> {
    try {
      const result = await this.workflowService.executeFileOutput(
        this.nodeId,
        parameters
      );

      return result;
    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }
} 
