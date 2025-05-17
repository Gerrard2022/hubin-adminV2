import { supabase } from "./supabase";

async function sendPushNotification({expoPushToken, title, body, screen, data}: { 
  expoPushToken: string; 
  title: string; 
  body: string; 
  screen: string; 
  data: {
    fare_price: number;
    distance_traveled: number;
    distance: number;
    vehicle: string;
    requestId?: string;
  } 
}) {
  try {
    const payload = {
      expoPushToken,
      title,
      body,
      screen,
      data
    };

    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Client: API error response:', responseData);
      throw new Error(responseData.error || 'Failed to send notification');
    }

    return responseData;
  } catch (error) {
    console.error('Client: Error sending push notification:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Client: Network error - This might be due to:');
      console.error('1. The API route is not accessible');
      console.error('2. The server is not running');
      console.error('3. Network connectivity issues');
    }
    throw error;
  }
}

export const SendBulkDriverNotifications = async (
  notificationTitle: string,
  notificationBody: string,
  screen: string,
  type: string,
  data: {
    fare_price: number;
    distance_traveled: number;
    distance: number;
    vehicle: string;
    requestId?: string;
  }
) => {
  try {

    let users: { ExpoNotificationToken: string; Id: string }[] = [];

    if (type === 'all') {
      const { data: allUsers, error: allError } = await supabase
        .from('User')
        .select('ExpoNotificationToken, Id')
        .not('ExpoNotificationToken', 'is', null);

      if (allError) {
        console.error('Error fetching all users:', allError);
        throw allError;
      }
      users = allUsers || [];
    } else if (type === 'users') {
      const { data: regularUsers, error: usersError } = await supabase
        .from('User')
        .select('ExpoNotificationToken, Id')
        .eq('Role', 'user')
        .not('ExpoNotificationToken', 'is', null);

      if (usersError) {
        console.error('Error fetching regular users:', usersError);
        throw usersError;
      }
      users = regularUsers || [];
    } else if (type === 'drivers') {
      const { data: driverUsers, error: driversError } = await supabase
        .from('User')
        .select('ExpoNotificationToken, Id')
        .eq('Role', 'driver')
        .not('ExpoNotificationToken', 'is', null);

      if (driversError) {
        console.error('Error fetching drivers:', driversError);
        throw driversError;
      }
      users = driverUsers || [];
    }

    if (users.length === 0) {
      console.error('No users found for type:', type);
      throw new Error(`No users found with notification tokens for type: ${type}`);
    }

    const uniqueTokens = new Map();

    users.forEach(user => {
      const token = user.ExpoNotificationToken;
      
      if (token && token.trim() !== '') {
        if (!uniqueTokens.has(token)) {
          uniqueTokens.set(token, user.Id);
        }
      }
    });

    if (uniqueTokens.size === 0) {
      console.error('No valid notification tokens found');
      throw new Error('No valid notification tokens found');
    }

    const notificationPromises = Array.from(uniqueTokens.entries()).map(([token]) => {
      return sendPushNotification({
        expoPushToken: token,
        title: notificationTitle,
        body: notificationBody,
        screen,
        data
      });
    });

    await Promise.all(notificationPromises);

  } catch (error) {
    console.error('Error in SendBulkDriverNotifications:', error);
    throw error;
  }
}