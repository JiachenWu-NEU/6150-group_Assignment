const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const { auth } = require("../utils/tokenResolver");

/**
 * @openapi
 * /order/create:
 *   post:
 *     summary: Create an order from current buyer's cart (buyer only)
 *     tags:
 *       - Order
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of buyer user
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 69386123456789abcdef012
 *                     buyerId:
 *                       type: string
 *                       example: 69385f05491f2628c495a827
 *                     purchaseDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-12-09T18:30:00.000Z
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             example: 69385fb70d07c1f9ccfdaf07
 *                           sellerId:
 *                             type: string
 *                             example: 69385f05491f2628c495a827
 *                           quantity:
 *                             type: number
 *                             example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Cart is empty or invalid data
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not buyer)
 *       500:
 *         description: Internal server error
 */
router.post("/create", auth, orderController.createOrderFromCart);
/**
 * @openapi
 * /order/my:
 *   get:
 *     summary: Get all orders of current buyer
 *     tags:
 *       - Order
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of buyer user
 *     responses:
 *       200:
 *         description: Get buyer orders successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       buyerId:
 *                         type: string
 *                       purchaseDate:
 *                         type: string
 *                         format: date-time
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productId:
 *                               type: string
 *                             productName:
 *                               type: string
 *                             sellerId:
 *                               type: string
 *                             quantity:
 *                               type: number
 *                             imagePath:
 *                               type: string
 *                             price:
 *                               type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not buyer)
 *       500:
 *         description: Internal server error
 */
router.get("/my", auth, orderController.getMyOrders);
/**
 * @openapi
 * /order/vender:
 *   get:
 *     summary: Get all sold items for current seller (vender only)
 *     tags:
 *       - Order
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of vender user
 *     responses:
 *       200:
 *         description: Get seller orders successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                         example: 69386123456789abcdef012
 *                       imagePath:
 *                         type: string
 *                       productName:
 *                         type: string
 *                         example: item1
 *                       quantity:
 *                         type: number
 *                         example: 2
 *                       purchaseDate:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-12-09T18:30:00.000Z
 *                       address:
 *                         type: string
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not vender)
 *       500:
 *         description: Internal server error
 */
router.get("/vender", auth, orderController.getVenderOrders);

module.exports = router;
