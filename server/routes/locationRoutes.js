import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createLocation,
  deleteLocation,
  getLocationById,
  getMapData,
  listLocations,
  updateLocation,
} from '../controllers/locationController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { LOCATION_TYPES, VERIFICATION_STATUSES } from '../models/Location.js';

const router = Router();

const locationValidators = (isCreate = false) => [
  body('name').if(() => isCreate).trim().notEmpty().withMessage('Nama lokasi wajib diisi'),
  body('name').optional().trim().isLength({ max: 160 }),
  body('district').optional().trim().isLength({ max: 120 }),
  body('coordinates.lat')
    .optional({ values: 'null' })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude harus -90 s/d 90'),
  body('coordinates.lng')
    .optional({ values: 'null' })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude harus -180 s/d 180'),
  body('locationType').optional().isArray(),
  body('locationType.*').optional().isIn(LOCATION_TYPES).withMessage('Tipe lokasi tidak dikenal'),
  body('verificationStatus')
    .optional()
    .isIn(VERIFICATION_STATUSES)
    .withMessage('Status verifikasi tidak dikenal'),
];

// Public: map data must be declared before /:id
router.get('/map', getMapData);
router.get('/', listLocations);

router.get('/:id', param('id').isMongoId(), validate, getLocationById);

router.post('/', protect, locationValidators(true), validate, createLocation);
router.put('/:id', protect, param('id').isMongoId(), locationValidators(false), validate, updateLocation);
router.delete('/:id', protect, param('id').isMongoId(), validate, deleteLocation);

export default router;
