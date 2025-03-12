import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock database - would be replaced with actual database in production
let unitOperations = [
  { 
    id: '1', 
    name: 'Distillation Column', 
    description: 'A vertical column used to separate components of a mixture based on differences in volatilities.',
    category: 'Separation', 
    status: 'Active',
    location: 'Building B, Room 204',
    capacity: '500 L/h',
    operationTemperature: '80-120°C',
    operationPressure: '1-2 bar',
    maintenanceSchedule: 'Quarterly',
    safetyProcedures: 'Ensure proper ventilation. Check pressure gauges before operation. Wear appropriate PPE.',
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
    status: 'Active',
    location: 'Building A, Room 105',
    capacity: '200 kW',
    operationTemperature: '20-180°C',
    operationPressure: '3-5 bar',
    maintenanceSchedule: 'Monthly',
    safetyProcedures: 'Check for leaks before operation. Ensure insulation is intact.',
    technicalDocuments: [],
    createdAt: '2023-07-12',
    updatedAt: '2023-10-12'
  },
  { 
    id: '3', 
    name: 'Reactor', 
    description: 'Vessel designed to contain chemical reactions under controlled conditions.',
    category: 'Chemical Reaction', 
    status: 'Inactive',
    location: 'Building C, Room 310',
    capacity: '1000 L',
    operationTemperature: '150-200°C',
    operationPressure: '10-15 bar',
    maintenanceSchedule: 'Bi-annually',
    safetyProcedures: 'Follow strict protocol for hazardous materials. Regular inspection of pressure vessels.',
    technicalDocuments: [],
    createdAt: '2023-07-10',
    updatedAt: '2023-10-10'
  }
];

// Get all unit operations
router.get('/', (req: Request, res: Response) => {
  // Could implement filtering, pagination, etc. here
  res.status(200).json(unitOperations);
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
  
  unitOperations = unitOperations.filter(op => op.id !== id);
  
  res.status(200).json({ message: 'Unit operation deleted successfully' });
});

export { router as unitOperationsRouter }; 
