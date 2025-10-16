import { Activity } from '../types/graphql';

export function getActivityMessage(activity: Activity, score: number): string | undefined {
  if (score >= 80) {
    switch (activity) {
      case Activity.Skiing:
        return 'Perfect conditions for skiing! Cold temperatures and fresh snow.';
      case Activity.Surfing:
        return 'Great surfing conditions with ideal wind and temperature.';
      case Activity.IndoorSightseeing:
        return 'Good time for museums and indoor activities.';
      case Activity.OutdoorSightseeing:
        return 'Beautiful weather for outdoor exploration.';
    }
  } else if (score >= 60) {
    switch (activity) {
      case Activity.Skiing:
        return 'Good skiing conditions, though not ideal.';
      case Activity.Surfing:
        return 'Decent surfing conditions.';
      case Activity.IndoorSightseeing:
        return 'Indoor activities are a good option.';
      case Activity.OutdoorSightseeing:
        return 'Pleasant conditions for outdoor activities.';
    }
  } else if (score >= 40) {
    switch (activity) {
      case Activity.Skiing:
        return 'Marginal conditions for skiing.';
      case Activity.Surfing:
        return 'Surfing conditions are suboptimal.';
      case Activity.IndoorSightseeing:
        return 'Consider indoor activities.';
      case Activity.OutdoorSightseeing:
        return 'Weather is okay for outdoor activities.';
    }
  } else {
    switch (activity) {
      case Activity.Skiing:
        return 'Poor skiing conditions - too warm or not enough snow.';
      case Activity.Surfing:
        return 'Not recommended for surfing today.';
      case Activity.IndoorSightseeing:
        return 'Great time to explore indoor attractions.';
      case Activity.OutdoorSightseeing:
        return 'Weather not ideal for outdoor activities.';
    }
  }
}