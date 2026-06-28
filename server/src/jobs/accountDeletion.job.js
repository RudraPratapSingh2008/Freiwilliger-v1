const cron = require('node-cron');
const User = require('../models/User.model');

// Run daily at 03:00 IST (21:30 UTC previous day)
cron.schedule('30 21 * * *', async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const usersToDelete = await User.find({
      accountStatus: 'deletion_requested',
      deletionRequestedAt: { $lte: thirtyDaysAgo },
    });

    for (const user of usersToDelete) {
      user.accountStatus = 'deleted';
      user.isActive = false;
      user.username = `deleted_${user._id}`;
      user.phone = null;
      user.volunteerProfile = {};
      user.organiserProfile = {};
      user.network = [];
      user.favouriteUsers = [];
      user.fcmTokens = [];
      await user.save();
    }

    if (usersToDelete.length > 0) {
      console.log(`[accountDeletion] Processed ${usersToDelete.length} account deletions`);
    }
  } catch (error) {
    console.error('[accountDeletion] Error:', error.message);
  }
});
