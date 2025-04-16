import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Function to send push notification via Expo
async function sendPushNotification(expoPushToken: string, title: string, body: string, screen: string, data: any) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { screen, data },
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to send push notification: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Function to send notifications
async function SendNotification(
  userId: string | null,
  title: string,
  body: string,
  screen: string,
  data: Record<string, any>
) {
  try {
    // Get user's Expo push token
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('ExpoNotificationToken')
      .eq('ClerkId', userId)
      .single();

    if (userError || !user || !user.ExpoNotificationToken) {
      return;
    }

    // Send push notification
    await sendPushNotification(
      user.ExpoNotificationToken,
      title,
      body,
      screen,
      data
    );
    
    // Store notification in database
    const { error: notificationError } = await supabase
      .from('UserNotifications')
      .insert([
        {
          UserId: userId,
          Title: title,
          Body: body,
          IsRead: false,
          Screen: screen
        }
      ])

    if (notificationError) {
      throw notificationError;
    }
  } catch (error) {
    throw error;
  }
}

// Function to parse timeframe string
function parseTimeframe(timeframeStr: string): Date {
  const parts = timeframeStr.split(' at');
  const datePart = parts[0];
  const timePart = parts[1];
  const currentYear = new Date().getFullYear();
  const dateStr = `${datePart}, ${currentYear} ${timePart}`;
  return new Date(dateStr);
}

// Function to check delivery status
async function checkDeliveryStatus() {
  console.log(`[${new Date().toISOString()}] Starting delivery status check...`);
  try {
    const now = new Date();
    
    const { data: deliveries, error } = await supabase
      .from('DeliveryRequests')
      .select('*')
      .eq('isExpired', false)
      .eq('IsDelivered', false)

    if (error) throw error

    console.log(`[${new Date().toISOString()}] Found ${deliveries?.length || 0} active deliveries to check`);

    for (const delivery of deliveries || []) {
      if (!delivery.TimeFrame) {
        console.log(`[${new Date().toISOString()}] Skipping delivery ${delivery.Id} - no timeframe specified`);
        continue
      }

      const expirationTime = parseTimeframe(delivery.TimeFrame);
      console.log(`[${new Date().toISOString()}] Delivery ${delivery.Id} expires at ${expirationTime.toISOString()}`);

      if (now > expirationTime) {
        console.log(`[${new Date().toISOString()}] Delivery ${delivery.Id} has expired, sending notifications`);
        
        // Send notification to user
        await SendNotification(
          delivery.UserId,
          "Delivery Time Expired",
          "The timeframe for your delivery request has passed.",
          "(root)/delivery-status",
          {
            fare_price: parseFloat(delivery.Price) || 0,
            distance_traveled: 0,
            distance: parseFloat(delivery.Distance) || 0,
            vehicle: delivery.VehicleType || ''
          }
        )

        // Send notification to driver if assigned
        if (delivery.DriverClerkId) {
          await SendNotification(
            delivery.DriverClerkId,
            "Delivery Time Expired",
            "The timeframe for the delivery request has passed.",
            "(root)/delivery-status",
            {
              fare_price: parseFloat(delivery.Price) || 0,
              distance_traveled: 0,
              distance: parseFloat(delivery.Distance) || 0,
              vehicle: delivery.VehicleType || ''
            }
          )
        }

        // Store notification for user
        const { error: userNotificationError } = await supabase
          .from('UserNotifications')
          .insert([
            {
              UserId: delivery.UserId,
              Title: 'Delivery Time Expired',
              Body: 'The timeframe for your delivery request has passed. You can check the details in your deliveries.',
              IsRead: false,
              Screen: "/(root)/delivery-status"
            }
          ])

        if (userNotificationError) {
          throw userNotificationError;
        }

        // Store notification for driver if assigned
        if (delivery.DriverClerkId) {
          const { error: driverNotificationError } = await supabase
            .from('UserNotifications')
            .insert([
              {
                UserId: delivery.DriverClerkId,
                Title: 'Delivery Time Expired',
                Body: 'The timeframe for the delivery request has passed. You can check the details in your deliveries.',
                IsRead: false,
                Screen: "/(root)/delivery-status"
              }
            ])

          if (driverNotificationError) {
            throw driverNotificationError;
          }
        }

        // Update isExpired to true
        const { error: updateError } = await supabase
          .from('DeliveryRequests')
          .update({ isExpired: true })
          .eq('Id', delivery.Id)

        if (updateError) {
          throw updateError;
        }
        
        console.log(`[${new Date().toISOString()}] Successfully processed expired delivery ${delivery.Id}`);
      } else {
        console.log(`[${new Date().toISOString()}] Delivery ${delivery.Id} is still active`);
      }
    }
    
    console.log(`[${new Date().toISOString()}] Delivery status check completed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in delivery status check:`, error);
    throw error;
  }
}

// Function to check ride status
async function checkRideStatus() {
  console.log(`[${new Date().toISOString()}] Starting ride status check...`);
  try {
    // Get completed rides with payment status true but not yet sent notification
    const { data: rides, error } = await supabase
      .from('Rides')
      .select('*')
      .eq('IsCompleted', true)
      .eq('PaymentStatus', 'true')
      .eq('IsSent', false)

    if (error) throw error

    console.log(`[${new Date().toISOString()}] Found ${rides?.length || 0} completed rides with payment to notify`);

    for (const ride of rides || []) {
      console.log(`[${new Date().toISOString()}] Processing ride ${ride.RideId}`);
      
      // Send notification to user
      await SendNotification(
        ride.UserId,
        "Ride Completed",
        "Your ride has been completed and payment has been processed.",
        "(root)/ride-status",
        {
          ride_id: ride.RideId,
          fare_price: parseFloat(ride.FarePrice) || 0,
          distance: parseFloat(ride.Distance) || 0,
          origin: ride.OriginAddress || '',
          destination: ride.DestinationAddress || ''
        }
      )

      // Send notification to driver if assigned
      if (ride.DriverClerkId) {
        await SendNotification(
          ride.DriverClerkId,
          "Ride Completed",
          "The ride has been completed and payment has been processed.",
          "(root)/ride-status",
          {
            ride_id: ride.RideId,
            fare_price: parseFloat(ride.FarePrice) || 0,
            distance: parseFloat(ride.Distance) || 0,
            origin: ride.OriginAddress || '',
            destination: ride.DestinationAddress || ''
          }
        )
      }

      // Store notification for user
      const { error: userNotificationError } = await supabase
        .from('UserNotifications')
        .insert([
          {
            UserId: ride.UserId,
            Title: 'Ride Completed',
            Body: 'Your ride has been completed and payment has been processed. Thank you for using our service!',
            IsRead: false,
            Screen: "/(root)/ride-status"
          }
        ])

      if (userNotificationError) {
        throw userNotificationError;
      }

      // Store notification for driver if assigned
      if (ride.DriverClerkId) {
        const { error: driverNotificationError } = await supabase
          .from('UserNotifications')
          .insert([
            {
              UserId: ride.DriverClerkId,
              Title: 'Ride Completed',
              Body: 'The ride has been completed and payment has been processed. Thank you for your service!',
              IsRead: false,
              Screen: "/(root)/ride-status"
            }
          ])

        if (driverNotificationError) {
          throw driverNotificationError;
        }
      }

      // Update IsSent to true
      const { error: updateError } = await supabase
        .from('Rides')
        .update({ IsSent: true })
        .eq('RideId', ride.RideId)

      if (updateError) {
        throw updateError;
      }
      
      console.log(`[${new Date().toISOString()}] Successfully processed completed ride ${ride.RideId}`);
    }
    
    console.log(`[${new Date().toISOString()}] Ride status check completed successfully`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in ride status check:`, error);
    throw error;
  }
}

// Custom cron job implementation
let lastRunTime = 0;
const CRON_INTERVAL = 60 * 1000; // 1 minute in milliseconds
let cronJobInterval: NodeJS.Timeout | null = null;

// Function to start the cron job
export function startCronJob() {
  console.log(`[${new Date().toISOString()}] Starting cron job...`);
  
  // Clear any existing interval
  if (cronJobInterval) {
    clearInterval(cronJobInterval);
  }
  
  // Run immediately on start
  Promise.all([
    checkDeliveryStatus().catch(error => {
      console.error(`[${new Date().toISOString()}] Error in initial delivery status check:`, error);
    }),
    checkRideStatus().catch(error => {
      console.error(`[${new Date().toISOString()}] Error in initial ride status check:`, error);
    })
  ]);
  
  // Set up interval for future runs
  cronJobInterval = setInterval(() => {
    console.log(`[${new Date().toISOString()}] Cron job interval triggered`);
    Promise.all([
      checkDeliveryStatus().catch(error => {
        console.error(`[${new Date().toISOString()}] Error in scheduled delivery status check:`, error);
      }),
      checkRideStatus().catch(error => {
        console.error(`[${new Date().toISOString()}] Error in scheduled ride status check:`, error);
      })
    ]);
  }, CRON_INTERVAL);
  
  console.log(`[${new Date().toISOString()}] Cron job started successfully, will run every ${CRON_INTERVAL/1000} seconds`);
}

// Function to stop the cron job
export function stopCronJob() {
  console.log(`[${new Date().toISOString()}] Stopping cron job...`);
  
  if (cronJobInterval) {
    clearInterval(cronJobInterval);
    cronJobInterval = null;
    console.log(`[${new Date().toISOString()}] Cron job stopped successfully`);
  } else {
    console.log(`[${new Date().toISOString()}] No active cron job to stop`);
  }
}

// Next.js API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const currentTime = Date.now();
    
    // Check if enough time has passed since the last run
    if (currentTime - lastRunTime >= CRON_INTERVAL) {
      // Run both status checks
      await Promise.all([
        checkDeliveryStatus(),
        checkRideStatus()
      ]);
      
      // Update the last run time
      lastRunTime = currentTime;
      
      return res.status(200).json({ 
        message: 'Status checks completed successfully',
        nextCheck: new Date(currentTime + CRON_INTERVAL).toISOString()
      });
    } else {
      // Return when the next check will occur
      const timeUntilNextCheck = CRON_INTERVAL - (currentTime - lastRunTime);
      return res.status(200).json({ 
        message: 'Cron job is running on schedule',
        nextCheck: new Date(currentTime + timeUntilNextCheck).toISOString()
      });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in API handler:`, error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

