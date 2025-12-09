const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { auth } = require("../utils/tokenResolver");
const { uploadProductImage } = require("../utils/uploadImage");

/**
 * @openapi
 * /product/create:
 *   post:
 *     summary: Create a new product (vender only)
 *     tags:
 *       - Product
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of vender user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 19.99
 *               description:
 *                 type: string
 *               isOnSale:
 *                 type: boolean
 *                 description: Optional; defaults to true
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 69385fb70d07c1f9ccfdaf07
 *                     sellerId:
 *                       type: string
 *                       example: 69385f05491f2628c495a827
 *                     name:
 *                       type: string
 *                       example: item1
 *                     price:
 *                       type: number
 *                       example: 10.99
 *                     imagePath:
 *                       type: string
 *                       example: /images/1765302199850-814226701.jpg
 *                     description:
 *                       type: string
 *                       example: an item
 *                     isOnSale:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-12-09T17:43:19.868Z
 *       400:
 *         description: Bad request (missing fields or invalid price)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not vender)
 *       500:
 *         description: Internal server error
 */
router.post("/create", auth, uploadProductImage, productController.createProduct);

module.exports = router;