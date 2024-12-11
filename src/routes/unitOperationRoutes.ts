import { Router } from 'express';
import { UnitOperationController } from '../controllers/unitOperationController';

const router = Router();
const controller = new UnitOperationController();

router.get('/templates', controller.getTemplates);
router.get('/:id', controller.getUnitOperation);
router.patch('/:id', controller.updateUnitOperation);
router.post('/instances', controller.createInstance);

export default router; 