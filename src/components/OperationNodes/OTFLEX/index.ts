// OTFLEX Module - SDL1 Compatible Structure
import './styles.css';

// Import completed OTFLEX hardware node components
import { MyxArmPositionNode, myxArmPositionNodeConfig } from './UnitOperations/MyxArmPosition';
import { MyxArmGripperNode, myxArmGripperNodeConfig } from './UnitOperations/MyxArmGripper';
import { ArduinoPumpNode, arduinoPumpNodeConfig } from './UnitOperations/ArduinoPump';
import { ArduinoTemperatureNode, arduinoTemperatureNodeConfig } from './UnitOperations/ArduinoTemperature';
import { ArduinoUltrasonicNode, arduinoUltrasonicNodeConfig } from './UnitOperations/ArduinoUltrasonic';
import { OTFlexTransferNode, otflexTransferNodeConfig } from './UnitOperations/OTFlexTransfer';
import { OTFlexElectrodeWashNode, otflexElectrodeWashNodeConfig } from './UnitOperations/OTFlexElectrodeWash';
import { ArduinoFurnaceNode, arduinoFurnaceNodeConfig } from './UnitOperations/ArduinoFurnace';
import { ArduinoElectrodeNode, arduinoElectrodeNodeConfig } from './UnitOperations/ArduinoElectrode';
import { ArduinoReactorNode, arduinoReactorNodeConfig } from './UnitOperations/ArduinoReactor';
import { OTFlexGripperNode, otflexGripperNodeConfig } from './UnitOperations/OTFlexGripper';

// Re-export individual components
export { MyxArmPositionNode, myxArmPositionNodeConfig };
export { MyxArmGripperNode, myxArmGripperNodeConfig };
export { ArduinoPumpNode, arduinoPumpNodeConfig };
export { ArduinoTemperatureNode, arduinoTemperatureNodeConfig };
export { ArduinoUltrasonicNode, arduinoUltrasonicNodeConfig };
export { OTFlexTransferNode, otflexTransferNodeConfig };
export { OTFlexElectrodeWashNode, otflexElectrodeWashNodeConfig };
export { ArduinoFurnaceNode, arduinoFurnaceNodeConfig };
export { ArduinoElectrodeNode, arduinoElectrodeNodeConfig };
export { ArduinoReactorNode, arduinoReactorNodeConfig };
export { OTFlexGripperNode, otflexGripperNodeConfig };

// Types
export * from './types';

// Export nodes for App.tsx integration
export const OTFLEXNodes = {
  otflexMyxArmPosition: MyxArmPositionNode,
  otflexMyxArmGripper: MyxArmGripperNode,
  otflexArduinoPump: ArduinoPumpNode,
  otflexArduinoTemperature: ArduinoTemperatureNode,
  otflexArduinoUltrasonic: ArduinoUltrasonicNode,
  otflexTransfer: OTFlexTransferNode,
  otflexElectrodeWash: OTFlexElectrodeWashNode,
  otflexArduinoFurnace: ArduinoFurnaceNode,
  otflexArduinoElectrode: ArduinoElectrodeNode,
  otflexArduinoReactor: ArduinoReactorNode,
  otflexGripper: OTFlexGripperNode,
};

// Node configs for registration and initialization
export const OTFLEXNodeConfigs = {
  otflexMyxArmPosition: myxArmPositionNodeConfig,
  otflexMyxArmGripper: myxArmGripperNodeConfig,
  otflexArduinoPump: arduinoPumpNodeConfig,
  otflexArduinoTemperature: arduinoTemperatureNodeConfig,
  otflexArduinoUltrasonic: arduinoUltrasonicNodeConfig,
  otflexTransfer: otflexTransferNodeConfig,
  otflexElectrodeWash: otflexElectrodeWashNodeConfig,
  otflexArduinoFurnace: arduinoFurnaceNodeConfig,
  otflexArduinoElectrode: arduinoElectrodeNodeConfig,
  otflexArduinoReactor: arduinoReactorNodeConfig,
  otflexGripper: otflexGripperNodeConfig,
};

// Memoized export for performance
import { memo } from 'react';
export const MemoizedOTFLEXNodes = {
  otflexMyxArmPosition: memo(MyxArmPositionNode),
  otflexMyxArmGripper: memo(MyxArmGripperNode),
  otflexArduinoPump: memo(ArduinoPumpNode),
  otflexArduinoTemperature: memo(ArduinoTemperatureNode),
  otflexArduinoUltrasonic: memo(ArduinoUltrasonicNode),
  otflexTransfer: memo(OTFlexTransferNode),
  otflexElectrodeWash: memo(OTFlexElectrodeWashNode),
  otflexArduinoFurnace: memo(ArduinoFurnaceNode),
  otflexArduinoElectrode: memo(ArduinoElectrodeNode),
  otflexArduinoReactor: memo(ArduinoReactorNode),
  otflexGripper: memo(OTFlexGripperNode),
};