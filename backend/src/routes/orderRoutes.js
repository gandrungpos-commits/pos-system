/**
 * Order Routes
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import orderController from '../controllers/orderController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * POST /api/orders
 * Create new order
 * Required: Authentication
 */
router.post('/', 
  verifyToken,
  [
    body('tenant_id').isInt().toInt(),
    body('customer_name').trim().notEmpty(),
    body('customer_phone').trim().notEmpty(),
    body('items').isArray().notEmpty(),
    body('order_type').isIn(['takeaway', 'dine_in']),
    body('table_number').optional().isInt().toInt()
  ],
  orderController.createOrder
);

/**
 * GET /api/orders
 * List orders with filters
 * Required: Authentication
 */
router.get('/',
  verifyToken,
  [
    query('status').optional().isIn(['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled']),
    query('tenant_id').optional().isInt().toInt(),
    query('payment_status').optional().isIn(['unpaid', 'paid', 'refunded']),
    query('order_type').optional().isIn(['takeaway', 'dine_in']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt()
  ],
  orderController.listOrders
);

/**
 * GET /api/orders/:id
 * Get order details
 * Required: Authentication
 */
router.get('/:id',
  verifyToken,
  [
    param('id').isInt().toInt()
  ],
  orderController.getOrder
);

/**
 * PATCH /api/orders/:id/status
 * Update order status
 * Required: Authentication, Tenant or Pengelola role
 */
router.patch('/:id/status',
  verifyToken,
  [
    param('id').isInt().toInt(),
    body('status').isIn(['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'])
  ],
  orderController.updateOrderStatus
);

/**
 * DELETE /api/orders/:id
 * Cancel order
 * Required: Authentication
 */
router.delete('/:id',
  verifyToken,
  [
    param('id').isInt().toInt(),
    body('reason').optional().trim()
  ],
  orderController.cancelOrder
);

/**
 * GET /api/tenants/:tenant_id/orders
 * Get orders for specific tenant
 * Required: Authentication
 */
router.get('/tenants/:tenant_id',
  verifyToken,
  [
    param('tenant_id').isInt().toInt(),
    query('status').optional().isIn(['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'])
  ],
  orderController.getTenantOrders
);

export default router;
