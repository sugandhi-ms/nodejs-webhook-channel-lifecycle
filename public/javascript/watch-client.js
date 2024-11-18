// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Connect to the Socket.io server
const socket = io('http://localhost:3001');

// Listen for notification received messages
socket.on('notification_received', (notificationData) => {
  console.log(`Received notification: ${JSON.stringify(notificationData)}`);

  // Create a new table row with data from the notification
  const tableRow = document.createElement('tr');

  if (notificationData.type == 'channel') { {
    console.log(`Channel notification type: ${notificationData.type}`);
    const groupId = document.createElement('td');
    groupId.innerText = notificationData.resource?.teamId ?? "TeamId";
    tableRow.appendChild(groupId);

    const channelId = document.createElement('td');
    channelId.innerText = notificationData.resource?.id ?? "ChannelId";
    tableRow.appendChild(channelId);
    
    const channelName = document.createElement('td');
    channelName.innerText = notificationData.resource?.changeType ?? "Something";
    tableRow.appendChild(channelName);
  }

  document.getElementById('notifications').appendChild(tableRow);
});

// Create a room for the subscription ID
socket.emit('create_room', subscriptionId);
