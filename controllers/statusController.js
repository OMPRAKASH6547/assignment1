const { ImageRequest, Product } = require('../models');

exports.checkStatus = async (req, res) => {
    try {
        const { request_id } = req.params;
        const request = await ImageRequest.findOne({ where: { request_id } });

        if (!request) {
            return res.status(404).json({ error: 'Request ID not found' });
        }

        res.status(200).json({
            request_id: request.request_id,
            status: request.status
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
