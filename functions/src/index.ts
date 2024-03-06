const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.clearRoomsData = functions.pubsub.schedule('every day 00:05').onRun(() => {
  const db = admin.database();
  const roomsRef = db.ref('rooms');

  // Delete all entries in the 'rooms' database
  return roomsRef.remove()
      .then(() => {
          console.log('Rooms data cleared successfully');
          return null;
      })
      .catch((error: Error) => {
          console.error('Error clearing rooms data:', error);
          throw error;
      });
});