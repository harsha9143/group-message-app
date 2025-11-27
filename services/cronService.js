const { CronJob } = require("cron");
const Message = require("../models/message");
const { Op } = require("sequelize");
const ArchivedMessage = require("../models/ArchivedMessages");

const cronJob = new CronJob(
  "0 2 * * * *", // cronTime
  async () => {
    try {
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oldMessages = await Message.findAll({
        where: {
          createdAt: { [Op.lt]: cutoffDate },
        },
      });
      if (!oldMessages || oldMessages.length === 0) {
        return;
      }

      const archievedData = oldMessages.map((msg) => ({
        message: msg.message,
        roomName: msg.roomName,
        userId: msg.userId || null,
        createdAt: msg.createdAt,
      }));

      await ArchivedMessage.bulkCreate(archievedData);

      await Message.destroy({
        where: {
          createdAt: { [Op.lt]: cutoffDate },
        },
      });
    } catch (error) {
      return;
    }
  }, // onTick
  null, // onComplete
  true, // start
  "Asia/Kolkata" // timeZone
);

module.exports = cronJob;
