const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");
const { auth } = require("../utils/tokenResolver");

/**
 * @openapi
 * /cart/add:
 *   post:
 *     summary: Add product to cart (buyer only)
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of buyer user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 69385fb70d07c1f9ccfdaf07
 *               quantity:
 *                 type: number
 *                 description: Optional, default 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     buyerId:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *       400:
 *         description: Bad request (missing productId or invalid quantity)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not buyer)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post("/add", auth, cartController.addToCart);
/**
 * @openapi
 * /cart/remove:
 *   delete:
 *     summary: Remove product from cart (buyer only)
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of buyer user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 69385fb70d07c1f9ccfdaf07
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     buyerId:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *       400:
 *         description: Bad request (missing productId)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not buyer)
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
router.delete("/remove", auth, cartController.removeFromCart);
/**
 * @openapi
 * /cart/update:
 *   patch:
 *     summary: Update cart item quantity (buyer only, auto remove if quantity <= 0)
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of buyer user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 69385fb70d07c1f9ccfdaf07
 *               quantity:
 *                 type: number
 *                 description: If <= 0, the item will be removed
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated or removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     buyerId:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *       400:
 *         description: Bad request (missing productId or quantity)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not buyer)
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
router.patch("/update", auth, cartController.updateCartQuantity);

module.exports = router;
