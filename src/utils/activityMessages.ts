import { Activity } from '../types/graphql';

export function getActivityMessage(activity: Activity, score: number): string {
  if (score >= 80) {
    switch (activity) {
      case Activity.SKIING:
        return 'Perfect conditions for skiing! Cold temperatures and fresh snow.';
      case Activity.SURFING:
        return 'Great surfing conditions with ideal wind and temperature.';
      case Activity.INDOOR_SIGHTSEEING:
        return 'Good time for museums and indoor activities.';
      case Activity.OUTDOOR_SIGHTSEEING:
        return 'Beautiful weather for outdoor exploration.';
    }
  } else if (score >= 60) {
    switch (activity) {
      case Activity.SKIING:
        return 'Good skiing conditions, though not ideal.';
      case Activity.SURFING:
        return 'Decent surfing conditions.';
      case Activity.INDOOR_SIGHTSEEING:
        return 'Indoor activities are a good option.';
      case Activity.OUTDOOR_SIGHTSEEING:
        return 'Pleasant conditions for outdoor activities.';
    }
  } else if (score >= 40) {
    switch (activity) {
      case Activity.SKIING:
        return 'Marginal conditions for skiing.';
      case Activity.SURFING:
        return 'Surfing conditions are suboptimal.';
      case Activity.INDOOR_SIGHTSEEING:
        return 'Consider indoor activities.';
      case Activity.OUTDOOR_SIGHTSEEING:
        return 'Weather is okay for outdoor activities.';
    }
  } else {
    switch (activity) {
      case Activity.SKIING:
        return 'Poor skiing conditions - too warm or not enough snow.';
      case Activity.SURFING:
        return 'Not recommended for surfing today.';
      case Activity.INDOOR_SIGHTSEEING:
        return 'Great time to explore indoor attractions.';
      case Activity.OUTDOOR_SIGHTSEEING:
        return 'Weather not ideal for outdoor activities.';
    }
  }
}