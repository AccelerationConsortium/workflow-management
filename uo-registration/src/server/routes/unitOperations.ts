import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  UnitOperationType, 
  UnitOperationStatus, 
  UnitOperationCategory, 
  UnitOperationParameter,
  UnitOperationParameterValue
} from '../../types/UnitOperation';

const router = express.Router();

// Mock database - would be replaced with actual database in production
let unitOperations = [
  { 
    id: '1', 
    name: 'Distillation Column', 
    description: 'A vertical column used to separate components of a mixture based on differences in volatilities.',
    type: UnitOperationType.GENERIC,
    category: UnitOperationCategory.SEPARATION,
    status: UnitOperationStatus.APPROVED,
    parameters: [
      {
        id: 'p1',
        name: 'Feed Flow Rate',
        description: 'Rate at which feed enters the column',
        parameterType: 'number',
        required: true,
        minValue: 100,
        maxValue: 1000,
        unit: 'L/h',
        defaultValue: 500
      },
      {
        id: 'p2',
        name: 'Reflux Ratio',
        description: 'Ratio of reflux to distillate',
        parameterType: 'number',
        required: true,
        minValue: 1,
        maxValue: 10,
        unit: '',
        defaultValue: 3
      },
      {
        id: 'p3',
        name: 'Reboiler Temperature',
        description: 'Temperature at the reboiler',
        parameterType: 'number',
        required: true,
        minValue: 80,
        maxValue: 120,
        unit: '°C',
        defaultValue: 100
      }
    ] as UnitOperationParameter[],
    safetyGuidelines: 'Ensure proper ventilation. Check pressure gauges before operation. Wear appropriate PPE.',
    theoryBackground: 'Distillation is based on the principle that different substances have different boiling points.',
    operatingProcedure: '1. Start feed flow\n2. Establish reflux\n3. Monitor temperatures\n4. Collect product',
    equipmentRequirements: ['Distillation column', 'Condenser', 'Reboiler', 'Feed pump', 'Collection vessels'],
    maintenanceRequirements: 'Clean column internals quarterly. Check for leaks monthly.',
    references: ['Perry\'s Chemical Engineers\' Handbook', 'Unit Operations of Chemical Engineering'],
    createdAt: '2023-07-15',
    updatedAt: '2023-10-15',
    createdBy: 'user123',
    updatedBy: 'user456'
  },
  { 
    id: '2', 
    name: 'Heat Exchanger', 
    description: 'Equipment designed to efficiently transfer heat from one medium to another.',
    type: UnitOperationType.GENERIC,
    category: UnitOperationCategory.HEAT_TRANSFER,
    status: UnitOperationStatus.APPROVED,
    parameters: [
      {
        id: 'p1',
        name: 'Hot Side Inlet Temperature',
        description: 'Temperature of the hot fluid entering the exchanger',
        parameterType: 'number',
        required: true,
        minValue: 80,
        maxValue: 200,
        unit: '°C',
        defaultValue: 150
      },
      {
        id: 'p2',
        name: 'Cold Side Inlet Temperature',
        description: 'Temperature of the cold fluid entering the exchanger',
        parameterType: 'number',
        required: true,
        minValue: 5,
        maxValue: 50,
        unit: '°C',
        defaultValue: 25
      },
      {
        id: 'p3',
        name: 'Flow Configuration',
        description: 'Relative flow direction of the fluids',
        parameterType: 'enum',
        required: true,
        options: ['Counter-current', 'Co-current', 'Cross-flow'],
        unit: '',
        defaultValue: 'Counter-current'
      }
    ] as UnitOperationParameter[],
    safetyGuidelines: 'Check for leaks before operation. Ensure insulation is intact.',
    theoryBackground: 'Heat exchangers work on the principle of heat transfer between fluids at different temperatures separated by a solid barrier.',
    operatingProcedure: '1. Start cold side flow\n2. Start hot side flow\n3. Monitor temperatures\n4. Adjust flow rates as needed',
    equipmentRequirements: ['Heat exchanger unit', 'Temperature sensors', 'Flow meters', 'Control valves'],
    maintenanceRequirements: 'Check for fouling monthly. Clean heat exchange surfaces quarterly.',
    references: ['Heat Exchanger Design Handbook', 'Process Heat Transfer'],
    createdAt: '2023-07-12',
    updatedAt: '2023-10-12',
    createdBy: 'user123',
    updatedBy: 'user789'
  },
  { 
    id: '3', 
    name: 'Chemical Reactor', 
    description: 'Vessel designed to contain chemical reactions under controlled conditions.',
    type: UnitOperationType.GENERIC,
    category: UnitOperationCategory.REACTION,
    status: UnitOperationStatus.APPROVED,
    parameters: [
      {
        id: 'p1',
        name: 'Reaction Temperature',
        description: 'Target temperature for the reaction',
        parameterType: 'number',
        required: true,
        minValue: 50,
        maxValue: 250,
        unit: '°C',
        defaultValue: 180
      },
      {
        id: 'p2',
        name: 'Reaction Time',
        description: 'Duration of the reaction',
        parameterType: 'number',
        required: true,
        minValue: 1,
        maxValue: 240,
        unit: 'min',
        defaultValue: 60
      },
      {
        id: 'p3',
        name: 'Agitation Speed',
        description: 'Speed of the agitator',
        parameterType: 'number',
        required: true,
        minValue: 100,
        maxValue: 1000,
        unit: 'rpm',
        defaultValue: 500
      }
    ] as UnitOperationParameter[],
    safetyGuidelines: 'Follow strict protocol for hazardous materials. Regular inspection of pressure vessels.',
    theoryBackground: 'Chemical reactors provide the necessary environment for reactants to form products by controlling variables like temperature, pressure, and residence time.',
    operatingProcedure: '1. Charge reactants\n2. Heat to reaction temperature\n3. Maintain agitation\n4. Monitor reaction progress\n5. Cool and discharge',
    equipmentRequirements: ['Reaction vessel', 'Agitator', 'Heating/cooling system', 'Pressure control', 'Temperature sensors'],
    maintenanceRequirements: 'Inspect seals and gaskets monthly. Test pressure relief valves quarterly.',
    references: ['Chemical Reaction Engineering', 'Handbook of Chemical Reactor Design'],
    createdAt: '2023-07-10',
    updatedAt: '2023-10-10',
    createdBy: 'user789',
    updatedBy: 'user456'
  },
  {
    id: '4',
    name: 'Lab A Distillation Column',
    description: 'Modified distillation column for special organic separations in Laboratory A.',
    type: UnitOperationType.SPECIFIC,
    category: UnitOperationCategory.SEPARATION,
    status: UnitOperationStatus.APPROVED,
    genericUnitOperationId: '1',  // References the first UO (Distillation Column)
    laboratoryId: 'lab001',
    location: 'Laboratory A, Room 101',
    parameterValues: [
      {
        parameterId: 'p1',  // Feed Flow Rate
        value: 300
      },
      {
        parameterId: 'p2',  // Reflux Ratio
        value: 2.5
      },
      {
        parameterId: 'p3',  // Reboiler Temperature
        value: 95
      }
    ] as UnitOperationParameterValue[],
    equipmentIds: ['equip001', 'equip002', 'equip003'],
    additionalNotes: 'Modified for higher purity requirements of organic chemistry lab.',
    contactPerson: 'John Smith',
    maintenanceSchedule: 'Monthly cleaning required due to higher fouling rates.',
    createdAt: '2023-09-05',
    updatedAt: '2023-10-20',
    createdBy: 'user123',
    updatedBy: 'user456'
  },
  {
    id: '5',
    name: 'Lab B Heat Exchanger',
    description: 'Customized plate heat exchanger for biochemistry applications.',
    type: UnitOperationType.SPECIFIC,
    category: UnitOperationCategory.HEAT_TRANSFER,
    status: UnitOperationStatus.PENDING_REVIEW,
    genericUnitOperationId: '2',  // References the second UO (Heat Exchanger)
    laboratoryId: 'lab002',
    location: 'Laboratory B, Room 205',
    parameterValues: [
      {
        parameterId: 'p1',  // Hot Side Inlet Temperature
        value: 90
      },
      {
        parameterId: 'p2',  // Cold Side Inlet Temperature
        value: 10
      },
      {
        parameterId: 'p3',  // Flow Configuration
        value: 'Counter-current'
      }
    ] as UnitOperationParameterValue[],
    equipmentIds: ['equip005', 'equip006'],
    additionalNotes: 'Used for temperature-sensitive biological materials.',
    contactPerson: 'Jane Doe',
    maintenanceSchedule: 'Weekly inspection and cleaning required for hygienic operations.',
    createdAt: '2023-09-10',
    updatedAt: '2023-10-25',
    createdBy: 'user789',
    updatedBy: 'user123'
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
    op => op.type === UnitOperationType.SPECIFIC && op.genericUnitOperationId === id
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
  const now = new Date().toISOString();
  const userId = req.headers['user-id'] || 'anonymous'; // In real app, get from auth
  
  const newUnitOperation = {
    id: uuidv4(),
    ...req.body,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId
  };
  
  // Set default status if not provided
  if (!newUnitOperation.status) {
    newUnitOperation.status = UnitOperationStatus.DRAFT;
  }
  
  // If creating a specific UO based on a generic one, copy parameters if not provided
  if (newUnitOperation.type === UnitOperationType.SPECIFIC && 
      newUnitOperation.genericUnitOperationId) {
    
    const baseGenericUO = unitOperations.find(
      op => op.id === newUnitOperation.genericUnitOperationId
    );
    
    if (baseGenericUO && baseGenericUO.type === UnitOperationType.GENERIC) {
      // If no parameter values provided, initialize with empty array
      if (!newUnitOperation.parameterValues) {
        newUnitOperation.parameterValues = baseGenericUO.parameters.map(param => ({
          parameterId: param.id,
          value: param.defaultValue || null
        }));
      }
      
      // Copy category from generic UO if not provided
      if (!newUnitOperation.category) {
        newUnitOperation.category = baseGenericUO.category;
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
  
  const userId = req.headers['user-id'] || 'anonymous'; // In real app, get from auth
  
  const updatedUnitOperation = {
    ...unitOperations[unitOperationIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
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
      op => op.type === UnitOperationType.SPECIFIC && op.genericUnitOperationId === id
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
