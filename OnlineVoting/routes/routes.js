const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const adminAuth = require('../middleware/adminAuth');

const authController = require('../controllers/authController');
const electionController = require('../controllers/electionController');
const positionController = require('../controllers/positionController');
const candidateController = require('../controllers/candidateController');
const voterController = require('../controllers/voterController');
const voteController = require('../controllers/voteController');
const resultsController = require('../controllers/resultsController');
const auditLogController = require('../controllers/auditLogController');
const databaseController = require('../controllers/databaseController');

router.post('/auth/verify', authController.verify);

router.get('/database', adminAuth, databaseController.getAll);

router.get('/elections/stats', electionController.getStats);
router.get('/elections', electionController.getAll);
router.get('/elections/:id', electionController.getById);
router.post('/elections', adminAuth, electionController.create);
router.put('/elections/:id', adminAuth, electionController.update);
router.delete('/elections/:id', adminAuth, electionController.delete);

router.post('/elections/:id/activate', adminAuth, electionController.activate);

router.post('/elections/:id/reopen', adminAuth, electionController.reopen);

router.get('/elections/:id/results', resultsController.getByElectionId);

router.get('/elections/:electionId/positions', positionController.getByElectionId);
router.post('/elections/:electionId/positions', adminAuth, positionController.create);

router.put('/positions/:id', adminAuth, positionController.update);
router.delete('/positions/:id', adminAuth, positionController.delete);

router.get('/positions/:positionId/candidates', candidateController.getByPositionId);
router.post('/positions/:positionId/candidates', adminAuth, candidateController.create);

router.put('/candidates/:id', adminAuth, candidateController.update);
router.delete('/candidates/:id', adminAuth, candidateController.delete);

router.get('/voters/template', adminAuth, voterController.getTemplate);
router.post('/voters/upload', adminAuth, upload.single('file'), voterController.uploadCsv);
router.post('/voters/bulk', adminAuth, voterController.createBulk);
router.get('/voters', adminAuth, voterController.getAll);
router.get('/voters/:id', adminAuth, voterController.getById);
router.post('/voters', adminAuth, voterController.create);
router.put('/voters/:id', adminAuth, voterController.update);
router.delete('/voters/:id', adminAuth, voterController.delete);

router.get('/vote/kiosk', voteController.kiosk);

router.post('/vote/validate', voteController.validate);
router.post('/vote/cast', voteController.cast);
router.get('/vote/receipt/:receiptCode', voteController.getReceipt);

router.get('/audit-log', adminAuth, auditLogController.getAll);
router.get('/audit-log/action-types', adminAuth, auditLogController.getActionTypes);

module.exports = router;
