import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UnitOperationType } from '../../types/UnitOperation';

const router = express.Router();

// Mock database - would be replaced with actual database in production
let unitOperations = [
  { 
    id: '1', 
    name: 'Distillation Column', 
    description: 'A vertical column used to separate components of a mixture based on differences in volatilities.',
    category: 'Separation', 
    type: UnitOperationType.GENERIC,
    status: 'Active',
    location: 'Building B, Room 204',
    capacity: '500 L/h',
    operationTemperature: '80-120°C',
    operationPressure: '1-2 bar',
    maintenanceSchedule: 'Quarterly',
    safetyProcedures: 'Ensure proper ventilation. Check pressure gauges before operation. Wear appropriate PPE.',
    defaultParameters: [
      {
        id: 'p1',
        name: 'Feed Flow Rate',
        description: 'Rate at which feed enters the column',
        dataType: 'NUMBER',
        required: true,
        min: 100,
        max: 1000,
        unit: 'L/h',
      },
      {
        id: 'p2',
        name: 'Reflux Ratio',
        description: 'Ratio of reflux to distillate',
        dataType: 'NUMBER',
        required: true,
        min: 1,
        max: 10,
      },
      {
        id: 'p3',
        name: 'Reboiler Temperature',
        description: 'Temperature at the reboiler',
        dataType: 'NUMBER',
        required: true,
        min: 80,
        max: 120,
        unit: '°C',
      }
    ],
    technicalDocuments: [
      {
        id: 'd1',
        name: 'Operation Manual.pdf',
        type: 'PDF',
        uploadedAt: '2023-08-15'
      },
      {
        id: 'd2',
        name: 'Maintenance Checklist.xlsx',
        type: 'Excel',
        uploadedAt: '2023-09-01'
      }
    ],
    createdAt: '2023-07-15',
    updatedAt: '2023-10-15'
  },
  { 
    id: '2', 
    name: 'Heat Exchanger', 
    description: 'Equipment designed to efficiently transfer heat from one medium to another.',
    category: 'Energy Transfer', 
    type: UnitOperationType.GENERIC,
    status: 'Active',
    location: 'Building A, Room 105',
    capacity: '200 kW',
    operationTemperature: '20-180°C',
    operationPressure: '3-5 bar',
    maintenanceSchedule: 'Monthly',
    safetyProcedures: 'Check for leaks before operation. Ensure insulation is intact.',
    defaultParameters: [
      {
        id: 'p1',
        name: 'Hot Side Inlet Temperature',
        description: 'Temperature of the hot fluid entering the exchanger',
        dataType: 'NUMBER',
        required: true,
        min: 80,
        max: 200,
        unit: '°C',
      },
      {
        id: 'p2',
        name: 'Cold Side Inlet Temperature',
        description: 'Temperature of the cold fluid entering the exchanger',
        dataType: 'NUMBER',
        required: true,
        min: 5,
        max: 50,
        unit: '°C',
      },
      {
        id: 'p3',
        name: 'Flow Configuration',
        description: 'Relative flow direction of the fluids',
        dataType: 'ENUM',
        required: true,
        options: ['Counter-current', 'Co-current', 'Cross-flow'],
      }
    ],
    technicalDocuments: [],
    createdAt: '2023-07-12',
    updatedAt: '2023-10-12'
  },
  { 
    id: '3', 
    name: 'Chemical Reactor', 
    description: 'Vessel designed to contain chemical reactions under controlled conditions.',
    category: 'Chemical Reaction', 
    type: UnitOperationType.GENERIC,
    status: 'Active',
    location: 'Building C, Room 310',
    capacity: '1000 L',
    operationTemperature: '150-200°C',
    operationPressure: '10-15 bar',
    maintenanceSchedule: 'Bi-annually',
    safetyProcedures: 'Follow strict protocol for hazardous materials. Regular inspection of pressure vessels.',
    defaultParameters: [
      {
        id: 'p1',
        name: 'Reaction Temperature',
        description: 'Target temperature for the reaction',
        dataType: 'NUMBER',
        required: true,
        min: 50,
        max: 250,
        unit: '°C',
      },
      {
        id: 'p2',
        name: 'Reaction Time',
        description: 'Duration of the reaction',
        dataType: 'NUMBER',
        required: true,
        min: 1,
        max: 240,
        unit: 'min',
      },
      {
        id: 'p3',
        name: 'Agitation Speed',
        description: 'Speed of the agitator',
        dataType: 'NUMBER',
        required: true,
        min: 100,
        max: 1000,
        unit: 'rpm',
      }
    ],
    technicalDocuments: [],
    createdAt: '2023-07-10',
    updatedAt: '2023-10-10'
  },
  {
    id: '4',
    name: 'Lab A Distillation Column',
    description: 'Modified distillation column for special organic separations in Laboratory A.',
    category: 'Separation',
    type: UnitOperationType.SPECIFIC,
    baseGenericUnitOperationId: '1',
    laboratoryId: 'lab001',
    status: 'Active',
    location: 'Laboratory A, Room 101',
    capacity: '300 L/h',
    operationTemperature: '70-110°C',
    operationPressure: '1-1.5 bar',
    maintenanceSchedule: 'Monthly',
    safetyProcedures: 'Follow standard distillation safety protocols. Additional ventilation required for organic solvents.',
    customParameters: [
      {
        id: 'p1',
        name: 'Feed Flow Rate',
        description: 'Rate at which feed enters the column',
        dataType: 'NUMBER',
        required: true,
        min: 50,
        max: 500,
        unit: 'L/h',
      },
      {
        id: 'p2',
        name: 'Reflux Ratio',
        description: 'Ratio of reflux to distillate',
        dataType: 'NUMBER',
        required: true,
        min: 1.5,
        max: 8,
      },
      {
        id: 'p3',
        name: 'Reboiler Temperature',
        description: 'Temperature at the reboiler',
        dataType: 'NUMBER',
        required: true,
        min: 70,
        max: 110,
        unit: '°C',
      },
      {
        id: 'p4',
        name: 'Solvent Type',
        description: 'Type of solvent used in this specific lab',
        dataType: 'ENUM',
        required: true,
        options: ['Methanol', 'Ethanol', 'Acetone', 'Hexane'],
      }
    ],
    technicalDocuments: [],
    createdAt: '2023-09-05',
    updatedAt: '2023-10-20'
  }
];

// Get all unit operations
router.get('/', (req: Request, res: Response) => {
  // Filter by type if specified
  const { type, laboratoryId } = req.query;
  
  let filteredOperations = [...unitOperations];
  
  if (type) {
    filteredOperations = filteredOperations.filter(op => op.type === type);
  }
  
  if (laboratoryId) {
    filteredOperations = filteredOperations.filter(
      op => op.type === UnitOperationType.SPECIFIC && op.laboratoryId === laboratoryId
    );
  }
  
  res.status(200).json(filteredOperations);
});

// Get only generic unit operations
router.get('/generic', (req: Request, res: Response) => {
  const genericOperations = unitOperations.filter(
    op => op.type === UnitOperationType.GENERIC
  );
  res.status(200).json(genericOperations);
});

// Get only specific unit operations
router.get('/specific', (req: Request, res: Response) => {
  // Can filter by laboratoryId if specified
  const { laboratoryId } = req.query;
  
  let specificOperations = unitOperations.filter(
    op => op.type === UnitOperationType.SPECIFIC
  );
  
  if (laboratoryId) {
    specificOperations = specificOperations.filter(
      op => op.laboratoryId === laboratoryId
    );
  }
  
  res.status(200).json(specificOperations);
});

// Get specific unit operations derived from a generic unit operation
router.get('/generic/:id/derived', (req: Request, res: Response) => {
  const { id } = req.params;
  
  const derivedOperations = unitOperations.filter(
    op => op.type === UnitOperationType.SPECIFIC && op.baseGenericUnitOperationId === id
  );
  
  res.status(200).json(derivedOperations);
});

// Get a single unit operation by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const unitOperation = unitOperations.find(op => op.id === id);
  
  if (!unitOperation) {
    return res.status(404).json({ message: 'Unit operation not found' });
  }
  
  res.status(200).json(unitOperation);
});

// Create a new unit operation
router.post('/', (req: Request, res: Response) => {
  const newUnitOperation = {
    id: uuidv4(),
    ...req.body,
    technicalDocuments: [],
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  // If creating a specific UO based on a generic one, copy default parameters
  if (newUnitOperation.type === UnitOperationType.SPECIFIC && 
      newUnitOperation.baseGenericUnitOperationId) {
    
    const baseGenericUO = unitOperations.find(
      op => op.id === newUnitOperation.baseGenericUnitOperationId
    );
    
    if (baseGenericUO && baseGenericUO.type === UnitOperationType.GENERIC) {
      // If no custom parameters provided, initialize with default parameters from generic UO
      if (!newUnitOperation.customParameters) {
        newUnitOperation.customParameters = JSON.parse(JSON.stringify(baseGenericUO.defaultParameters));
      }
    }
  }
  
  unitOperations.push(newUnitOperation);
  
  res.status(201).json(newUnitOperation);
});

// Update an existing unit operation
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const unitOperationIndex = unitOperations.findIndex(op => op.id === id);
  
  if (unitOperationIndex === -1) {
    return res.status(404).json({ message: 'Unit operation not found' });
  }
  
  const updatedUnitOperation = {
    ...unitOperations[unitOperationIndex],
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  
  unitOperations[unitOperationIndex] = updatedUnitOperation;
  
  res.status(200).json(updatedUnitOperation);
});

// Delete a unit operation
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const unitOperationIndex = unitOperations.findIndex(op => op.id === id);
  
  if (unitOperationIndex === -1) {
    return res.status(404).json({ message: 'Unit operation not found' });
  }
  
  // If this is a generic UO, check if any specific UOs are derived from it
  const unitOp = unitOperations[unitOperationIndex];
  if (unitOp.type === UnitOperationType.GENERIC) {
    const hasDerivedOperations = unitOperations.some(
      op => op.type === UnitOperationType.SPECIFIC && op.baseGenericUnitOperationId === id
    );
    
    if (hasDerivedOperations) {
      return res.status(400).json({ 
        message: 'Cannot delete a generic unit operation that has derived specific operations'
      });
    }
  }
  
  unitOperations = unitOperations.filter(op => op.id !== id);
  
  res.status(200).json({ message: 'Unit operation deleted successfully' });
});

export { router as unitOperationsRouter }; 
