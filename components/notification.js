const model = require('../model/schema')
const logger = require('../helper/logger')
const admin = require('firebase-admin');

exports.registerDeviceToken = async (req, res) => {
    try {
        const { email, token, platform } = req.body;
        
        if (!email || !token || !platform) {
            const err = new Error("Email, token and platform are required");
            err.status = 400;
            throw err;
        }
        
        // Update if exists, create if doesn't exist
        const result = await model.DeviceToken.findOneAndUpdate(
            { email, token },
            { email, token, platform, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
        
        res.status(200).json({
            status: "Success",
            message: "Device token registered successfully",
            data: result
        });
    } catch (err) {
        logger.error(`URL : ${req.originalUrl} | status : ${err.status} | message: ${err.message}`);
        res.status(err.status || 500).json({
            message: err.message
        });
    }
};

// Function to send push notifications
exports.sendNotification = async (emails, title, body, data = {}) => {
    try {
        // Get all device tokens for the provided emails
        const deviceTokens = await model.DeviceToken.find({ email: { $in: emails } });
        
        if (!deviceTokens || deviceTokens.length === 0) {
            logger.info(`No device tokens found for emails: ${emails.join(', ')}`);
            return { success: false, message: 'No device tokens found' };
        }
        
        const tokens = deviceTokens.map(dt => dt.token);
        
        // Prepare messages for Expo push service
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            data
        }));
        
        // Send the messages in chunks (Expo has a limit of 100 notifications per request)
        const chunkSize = 100;
        let successCount = 0;
        let failureCount = 0;
        
        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize);
            
            // Send to Expo push service
            const response = await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            
            // Process response
            if (response.data && response.data.data) {
                response.data.data.forEach(item => {
                    if (item.status === 'ok') {
                        successCount++;
                    } else {
                        failureCount++;
                        logger.error(`Error sending notification: ${JSON.stringify(item)}`);
                    }
                });
            }
        }
        
        logger.info(`Notifications sent: ${successCount} successful, ${failureCount} failed`);
        
        return {
            success: true,
            successCount,
            failureCount
        };
    } catch (error) {
        logger.error(`Error sending notification: ${error.message}`);
        return { success: false, message: error.message };
    }
};