import { DeviceType, DeviceParameters } from '../../schemas/deviceSchema';

// Device interface that all concrete devices must implement
export interface IDevice<T extends DeviceType> {
  initialize(): Promise<void>;
  execute(params: DeviceParameters[T]): Promise<void>;
  stop(): Promise<void>;
  getStatus(): Promise<any>;
}

// Abstract factory interface
export interface IDeviceFactory {
  createDevice<T extends DeviceType>(type: T): IDevice<T>;
}

// Real device factory implementation
export class RealDeviceFactory implements IDeviceFactory {
  createDevice<T extends DeviceType>(type: T): IDevice<T> {
    switch (type) {
      case 'Hotplate':
        return new RealHotplateDevice() as IDevice<T>;
      case 'Pump':
        return new RealPumpDevice() as IDevice<T>;
      // Add other device implementations
      default:
        throw new Error(`Device type ${type} not implemented`);
    }
  }
}

// Simulated device factory implementation
export class SimulatedDeviceFactory implements IDeviceFactory {
  createDevice<T extends DeviceType>(type: T): IDevice<T> {
    switch (type) {
      case 'Hotplate':
        return new SimulatedHotplateDevice() as IDevice<T>;
      case 'Pump':
        return new SimulatedPumpDevice() as IDevice<T>;
      // Add other device implementations
      default:
        throw new Error(`Device type ${type} not implemented`);
    }
  }
}

// Device Manager to handle device creation based on mode
export class DeviceManager {
  private static instance: DeviceManager;
  private factory: IDeviceFactory;

  private constructor(isSimulation: boolean) {
    this.factory = isSimulation ? new SimulatedDeviceFactory() : new RealDeviceFactory();
  }

  static getInstance(isSimulation: boolean): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager(isSimulation);
    }
    return DeviceManager.instance;
  }

  createDevice<T extends DeviceType>(type: T): IDevice<T> {
    return this.factory.createDevice(type);
  }

  setSimulationMode(isSimulation: boolean): void {
    this.factory = isSimulation ? new SimulatedDeviceFactory() : new RealDeviceFactory();
  }
} 
