require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.use('/products', require('./src/routes/products'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));