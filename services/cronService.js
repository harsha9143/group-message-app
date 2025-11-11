const { CronJob } = require("cron");
const Message = require("../models/message");
const { Op } = require("sequelize");
const Archieved = require("../models/archieved");

const cronJob = new CronJob(
  "0 2 * * * *",
  async () => {
    try {
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oldMessages = await Message.findAll({
        where: {
          createdAt: { [Op.lt]: cutoffDate },
        },
      });

      if (oldMessages.length === 0) {
        return;
      }

      const archivedData = oldMessages.map((msg) => ({
        message: msg.message,
        roomName: msg.roomName,
        userId: msg.userId,
        createdAt: msg.createdAt,
      }));

      await Archieved.bulkCreate(archivedData);

      await Chat.destroy({ where: { createdAt: { [Op.lt]: cutoffDate } } });
    } catch (error) {
      return;
    }
  },
  null,
  true,
  "America/Los_Angeles" // timeZone
);

module.exports = cronJob;
