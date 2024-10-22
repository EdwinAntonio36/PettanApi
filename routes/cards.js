const express = require('express')
const cards = express.Router()
const Pettan = require('../schema/pettan')

const redisClient = require('redis').createClient({
    url: 'redis://redis:6379'
})
redisClient.connect()

/**
 * @swagger
 * components:
 *   schemas:
 *     Pettan:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: ID único de la carta Pettan.
 *         num:
 *           type: string
 *           description: Número de la carta Pettan.
 *         name:
 *           type: string
 *           description: Nombre de la carta Pettan.
 *         type:
 *           type: string
 *           description: Tipos de la carta Pettan.
 *         rarity:
 *           type: string
 *           description: Rareza de la carta Pettan.
 *         series:
 *           type: string
 *           description: Serie de la carta Pettan.
 */

/**
 * @swagger
 * /Cards:
 *   get:
 *     summary: Obtener todos las Cartas Pettan
 *     description: Retorna una lista paginada de todas las cartas Pettan registradas.
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Número de página (por defecto: 1)."
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 4
 *         description: "Cantidad de resultados por página (por defecto: 4)."
 *     responses:
 *       200:
 *         description: Lista de Cartas Pettan con paginación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPettans:
 *                   type: integer
 *                   description: "Número total de Cartas Pettan."
 *                 totalPages:
 *                   type: integer
 *                   description: "Número total de páginas."
 *                 currentPage:
 *                   type: integer
 *                   description: "Página actual."
 *                 pettans:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pettan'
 *       500:
 *         description: Error interno del servidor.
 */

cards.get('/', async (req, res) => {
    const { page = 1, limit = 4 } = req.query;
    const cacheKey = `pettans:page:${page}:limit:${limit}`

    try {
        const cachedPettans = await redisClient.get(cacheKey); 

        if (cachedPettans) {
            return res.json(JSON.parse(cachedPettans)); 
        }

        const pettans = await Pettan.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Pettan.countDocuments();

        const result = {
            totalPettans: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            pettans
        };

        await redisClient.set(cacheKey, JSON.stringify(result), {
            EX: 10
        });

        res.json(result);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @swagger
 * /cards/name/{name}:
 *   get:
 *     summary: Buscar una carta Pettan por su nombre
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Se busca una carta Pettan por su nombre exacto.
 *     responses:
 *       200:
 *         description: A single Card
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pettan'
 *       404:
 *         description: Card not found
 */

cards.get('/name/:name', async (req, res) => {
    try {
        const pettan = await Pettan.findOne({ name: req.params.name });
        if (!pettan) {
            return res.status(404).json({ message: 'Pettan not found' });
        }
        res.json(pettan);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @swagger
 * /cards/{id}:
 *   get:
 *     summary: Obtener una Carta Pettan por su ID
 *     description: Retorna una Carta Pettan específica de la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: El ID de la Carta Pettan.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Retorna la Carta Pettan solicitada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pettan'
 *       404:
 *         description: No se encontró la carta Pettan.
 *       500:
 *         description: Error interno del servidor.
 */

cards.get('/:id', async (req, res) => {
    try {
        const pettan = await Pettan.findById(req.params.id)
        if (!pettan) {
            return res.status(404).json({ error: 'Card not found' }); 
        }
        res.json(pettan);
    } catch (error) {
        res.status(500).json({ error: 'Server error' }); 
    }
});

/**
 * @swagger
 * /cards/type/{type}:
 *   get:
 *     summary: Buscar Carta  por tipo
 *     description: Obtiene una lista de las cartas Pettan filtrados por tipo
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: "Tipo de carta Pettan a buscar (AGL, TEQ, INT, STR Y PHY)."
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Número de página (por defecto: 1)."
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 4
 *         description: "Cantidad de resultados por página (por defecto: 4)."
 *     responses:
 *       200:
 *         description: "Lista de cartas Pettan filtradas por tipo con paginación."
 *       500:
 *         description: "Error interno del servidor."
 */

cards.get('/type/:type', async (req, res) => {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const cacheKey = `pettans:${type}:page:${page}`;

    try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData)); 
        }

        const pettans = await Pettan.find({ type })
            .skip(skip)
            .limit(limit);

        await redisClient.setEx(cacheKey, 600, JSON.stringify(pettans));

        res.json(pettans);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Agregar una nueva carta Pettan
 *     description: Crea una nueva carta Pettan en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pettan'
 *     responses:
 *       200:
 *         description: Carta Pettan creada exitosamente.
 *       500:
 *         description: Error interno del servidor.
 */

cards.post('/', async (req, res) => {
    try {
        const lastPettan = await Pettan.findOne().sort({ id: -1 });

        const nextId = lastPettan ? lastPettan.id + 1 : 1; 
        const nextNum = lastPettan ? (parseInt(lastPettan.num) + 1).toString().padStart(3, '0') : '001'; 

        const {

            name, 
            type, 
            rarity,
            series
        } = req.body;

        const pettan = new Pettan({
            id: nextId, 
            num: nextNum,
            name,
            type,
            rarity,
            series

        });

        await pettan.save();

        res.json({ success: true, pettan }); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * @swagger
 * /cards/{id}:
 *   put:
 *     summary: Actualizar una carta Pettan por ID
 *     description: Actualiza una carta Pettan existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la carta Pettan a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pettan'
 *     responses:
 *       200:
 *         description: Carta Pettan actualizada exitosamente.
 *       404:
 *         description: Carta Pettan no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */

cards.put('/:id', async (req, res) => {
    try {
        const pettan = await Pettan.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!pettan) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.json({ success: true, updatedPettan: pettan });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /cards/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una carta Pettan por ID
 *     description: Permite actualizar parcialmente una carta Pettan existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la carta Pettan a actualizar.
 *         schema:
 *           type: string
*     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pettan'
 *     responses:
 *       200:
 *         description: Carta Pettan actualizado exitosamente.
 *       404:
 *         description: Carta Pettan no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */

cards.patch('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const pettan = await Pettan.findByIdAndUpdate(req.params.id, updates, { new: true });

        if (!pettan) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.json({ success: true, updatedPettan: pettan });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /cards/{id}:
 *   delete:
 *     summary: Eliminar una carta Pettan por ID
 *     description: Elimina una carta Pettan existente en la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la carta Pettan a eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carta Pettan eliminada exitosamente.
 *       404:
 *         description: Carta Pettan no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */

cards.delete('/:id', async (req, res) => {
    try {
        const pettan = await Pettan.findByIdAndDelete(req.params.id);
        if (!pettan) {
            return res.status(404).json({ error: 'Card not found' }); 
        }
        res.json({ success: true, message: 'PettanCard deleted successfully', pettan });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = cards
