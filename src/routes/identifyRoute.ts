import express from 'express';
import { identifyContact } from '../controllers/identifyController';

const router = express.Router();

// POST /contacts
router.post('/', identifyContact);

export default router;
