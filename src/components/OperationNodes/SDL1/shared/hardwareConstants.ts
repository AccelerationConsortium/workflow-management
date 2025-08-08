// Shared hardware configuration constants for SDL1 operations

export const CONNECTION_TYPE_OPTIONS = [
  { value: 'arduino', label: 'Arduino (COM Port)' },
  { value: 'plc', label: 'PLC (Ethernet)' },
  { value: 'opentrons', label: 'Opentrons OT2 (HTTP API)' },
];

export const HARDWARE_DEFAULTS = {
  // Connection type
  connection_type: 'arduino',
  
  // Arduino configuration
  arduino_com_port: 'COM3',
  
  // PLC configuration
  plc_ip_address: '192.168.0.102',
  plc_port_number: 502,  // Modbus TCP default port
  
  // Opentrons OT2 configuration
  ot2_ip_address: '169.254.69.185',
  ot2_port_number: 80,
  
  // Timeout settings
  connection_timeout: 5000,  // ms
  command_timeout: 30000,    // ms
};

// Helper function to get hardware parameters based on connection type
export const getHardwareParameters = (connectionType: string = 'arduino') => {
  const baseParams: any = {
    connection_type: {
      type: 'select',
      label: 'Connection Type',
      description: 'Type of hardware connection',
      options: CONNECTION_TYPE_OPTIONS,
      defaultValue: HARDWARE_DEFAULTS.connection_type,
      required: true,
    },
  };

  // Arduino-specific parameters
  if (connectionType === 'arduino') {
    baseParams.arduino_com_port = {
      type: 'string',
      label: 'Arduino COM Port',
      description: 'Serial port for Arduino connection',
      defaultValue: HARDWARE_DEFAULTS.arduino_com_port,
      required: true,
      condition: (data: any) => data.connection_type === 'arduino',
    };
  }

  // PLC-specific parameters
  if (connectionType === 'plc') {
    baseParams.plc_ip_address = {
      type: 'string',
      label: 'PLC IP Address',
      description: 'IP address of the PLC controller',
      defaultValue: HARDWARE_DEFAULTS.plc_ip_address,
      required: true,
      condition: (data: any) => data.connection_type === 'plc',
      pattern: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$',
    };
    
    baseParams.plc_port_number = {
      type: 'number',
      label: 'PLC Port Number',
      description: 'Port number for PLC connection',
      defaultValue: HARDWARE_DEFAULTS.plc_port_number,
      min: 1,
      max: 65535,
      step: 1,
      required: true,
      condition: (data: any) => data.connection_type === 'plc',
    };
  }

  // Opentrons OT2-specific parameters
  if (connectionType === 'opentrons') {
    baseParams.ot2_ip_address = {
      type: 'string',
      label: 'OT2 IP Address',
      description: 'IP address of the Opentrons OT2 robot',
      defaultValue: HARDWARE_DEFAULTS.ot2_ip_address,
      required: true,
      condition: (data: any) => data.connection_type === 'opentrons',
      pattern: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$',
    };
    
    baseParams.ot2_port_number = {
      type: 'number',
      label: 'OT2 Port Number',
      description: 'Port number for OT2 HTTP API',
      defaultValue: HARDWARE_DEFAULTS.ot2_port_number,
      min: 1,
      max: 65535,
      step: 1,
      required: true,
      condition: (data: any) => data.connection_type === 'opentrons',
    };
  }

  // Common timeout parameters
  baseParams.connection_timeout = {
    type: 'number',
    label: 'Connection Timeout',
    description: 'Timeout for establishing connection',
    defaultValue: HARDWARE_DEFAULTS.connection_timeout,
    min: 1000,
    max: 60000,
    step: 1000,
    unit: 'ms',
    required: false,
  };

  baseParams.command_timeout = {
    type: 'number',
    label: 'Command Timeout',
    description: 'Timeout for command execution',
    defaultValue: HARDWARE_DEFAULTS.command_timeout,
    min: 1000,
    max: 300000,
    step: 1000,
    unit: 'ms',
    required: false,
  };

  return baseParams;
};

// Dynamic hardware parameters that show/hide based on connection type
export const getDynamicHardwareParameters = () => {
  return {
    connection_type: {
      type: 'select',
      label: 'Connection Type',
      description: 'Type of hardware connection',
      options: CONNECTION_TYPE_OPTIONS,
      defaultValue: HARDWARE_DEFAULTS.connection_type,
      required: true,
    },
    arduino_com_port: {
      type: 'string',
      label: 'Arduino COM Port',
      description: 'Serial port for Arduino connection',
      defaultValue: HARDWARE_DEFAULTS.arduino_com_port,
      required: false,
      condition: (data: any) => data.connection_type === 'arduino',
    },
    plc_ip_address: {
      type: 'string',
      label: 'PLC IP Address',
      description: 'IP address of the PLC controller',
      defaultValue: HARDWARE_DEFAULTS.plc_ip_address,
      required: false,
      condition: (data: any) => data.connection_type === 'plc',
      pattern: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$',
    },
    plc_port_number: {
      type: 'number',
      label: 'PLC Port Number',
      description: 'Port number for PLC connection',
      defaultValue: HARDWARE_DEFAULTS.plc_port_number,
      min: 1,
      max: 65535,
      step: 1,
      required: false,
      condition: (data: any) => data.connection_type === 'plc',
    },
    ot2_ip_address: {
      type: 'string',
      label: 'OT2 IP Address',
      description: 'IP address of the Opentrons OT2 robot',
      defaultValue: HARDWARE_DEFAULTS.ot2_ip_address,
      required: false,
      condition: (data: any) => data.connection_type === 'opentrons',
      pattern: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$',
    },
    ot2_port_number: {
      type: 'number',
      label: 'OT2 Port Number',
      description: 'Port number for OT2 HTTP API',
      defaultValue: HARDWARE_DEFAULTS.ot2_port_number,
      min: 1,
      max: 65535,
      step: 1,
      required: false,
      condition: (data: any) => data.connection_type === 'opentrons',
    },
  };
};