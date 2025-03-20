/**
 * LCP (Laboratory Communication Protocol) Types
 */

export enum LCPMessageType {
  COMMAND = 'COMMAND',
  RESPONSE = 'RESPONSE',
  EVENT = 'EVENT',
  ERROR = 'ERROR'
}

export enum LCPCommandType {
  INITIALIZE = 'INITIALIZE',
  START = 'START',
  STOP = 'STOP',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  GET_STATUS = 'GET_STATUS',
  SET_PARAMETER = 'SET_PARAMETER',
  GET_PARAMETER = 'GET_PARAMETER'
}

export interface LCPMessage {
  type: LCPMessageType;
  timestamp: number;
  deviceId: string;
  sequence: number;
}

export interface LCPCommand extends LCPMessage {
  type: LCPMessageType.COMMAND;
  command: LCPCommandType;
  parameters?: Record<string, any>;
}

export interface LCPResponse extends LCPMessage {
  type: LCPMessageType.RESPONSE;
  command: LCPCommandType;
  status: 'success' | 'error';
  data?: any;
  error?: string;
}

export interface LCPEvent extends LCPMessage {
  type: LCPMessageType.EVENT;
  event: string;
  data: any;
}

export interface LCPError extends LCPMessage {
  type: LCPMessageType.ERROR;
  code: string;
  message: string;
  details?: any;
} 
