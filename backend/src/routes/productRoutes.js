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
/**
 * @openapi
 * /product/{id}:
 *   put:
 *     summary: Update product details (vender only, owner only)
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to update
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of vender user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               isOnSale:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                     sellerId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     imagePath:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isOnSale:
 *                       type: boolean
 *       400:
 *         description: Bad request (nothing to update or invalid price)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not vender or not owner)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", auth, uploadProductImage, productController.updateProduct);
/**
 * @openapi
 * /product/{id}:
 *   delete:
 *     summary: Delete a product (vender or admin)
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to delete
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of vender or admin user
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                     sellerId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     imagePath:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isOnSale:
 *                       type: boolean
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not vender or admin)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth, productController.deleteProduct);
/**
 * @openapi
 * /product/{id}/onsale:
 *   patch:
 *     summary: Update product availability (vender only, owner only)
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to update availability
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of vender user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isOnSale
 *             properties:
 *               isOnSale:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product availability updated successfully
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
 *                     sellerId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     imagePath:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isOnSale:
 *                       type: boolean
 *       400:
 *         description: Bad request (missing isOnSale)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not vender or not owner)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/onsale", auth, productController.updateProductAvailability);
/**
 * @openapi
 * /product/all:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: Get all products successfully
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
 *                       sellerId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       imagePath:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isOnSale:
 *                         type: boolean
 *       500:
 *         description: Internal server error
 */
router.get("/all", productController.getAllProducts);
/**
 * @openapi
 * /product/detail/{id}:
 *   get:
 *     summary: Get product details by id
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Get product successfully
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
 *                     sellerId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     imagePath:
 *                       type: string
 *                     description:
 *                       type: string
 *                     isOnSale:
 *                       type: boolean
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/detail/:id", productController.getProductById);
/**
 * @openapi
 * /product/my:
 *   get:
 *     summary: Get all products of current seller (vender only)
 *     tags:
 *       - Product
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token of vender user
 *     responses:
 *       200:
 *         description: Get vender products successfully
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
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       imagePath:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isOnSale:
 *                         type: boolean
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (not vender)
 *       500:
 *         description: Internal server error
 */
router.get("/my", auth, productController.getMyProducts);

module.exports = router;