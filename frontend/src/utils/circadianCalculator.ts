/**
 * Circadian Baseline Calculator
 * Generates typical brain alertness pattern based on circadian research
 */

interface Workout {
  time: number;  // Hour in 24h format (e.g., 7.25 = 7:15 AM)
  duration: number;  // Minutes
}

/**
 * Calculate circadian baseline for a 24-hour period
 * Based on 2024 research on circadian brain activity patterns
 */
export function calculateCircadianBaseline(
  wakeTime: number,
  sleepTime: number,
  workouts: Workout[] = []
): number[] {
  const baseline: number[] = [];
  const hoursAwake = sleepTime - wakeTime;
  
  // Generate data points every 15 minutes (0.25 hours)
  for (let h = 0; h < 24; h += 0.25) {
    if (h < wakeTime || h > sleepTime) {
      // Sleep period - low baseline
      baseline.push(20);
    } else {
      const hoursAfterWake = h - wakeTime;
      
      // Base circadian curve (sinusoidal with morning peak)
      let value = 40 + // Baseline alertness
        (Math.sin((hoursAfterWake / hoursAwake) * Math.PI) * 25) + // Sinusoidal pattern
        (hoursAfterWake < 4 ? hoursAfterWake * 8 : 0) - // Morning rise
        (hoursAfterWake > 6 && hoursAfterWake < 9 ? 15 : 0); // Afternoon dip
      
      // Add post-exercise boost
      workouts.forEach(workout => {
        const hoursPostExercise = h - workout.time;
        if (hoursPostExercise > 0 && hoursPostExercise < 4) {
          // Huberman: 1-4h post-exercise optimal window
          let multiplier = 1.0;
          if (hoursPostExercise < 1) {
            multiplier = 1.5;  // 0-1h: 50% boost
          } else if (hoursPostExercise < 2) {
            multiplier = 1.3;  // 1-2h: 30% boost
          } else {
            multiplier = 1.1;  // 2-4h: 10% boost
          }
          value *= multiplier;
        }
      });
      
      baseline.push(Math.min(Math.max(value, 30), 95));
    }
  }
  
  return baseline;
}

/**
 * Get circadian phase label for a given time
 */
export function getCircadianPhase(
  hour: number,
  wakeTime: number
): 'morning_peak' | 'afternoon_dip' | 'evening_peak' | 'sleep' {
  const hoursAfterWake = hour - wakeTime;
  
  if (hoursAfterWake < 0 || hoursAfterWake > 16) {
    return 'sleep';
  } else if (hoursAfterWake < 5) {
    return 'morning_peak';
  } else if (hoursAfterWake < 9) {
    return 'afternoon_dip';
  } else {
    return 'evening_peak';
  }
}

/**
 * Calculate hours since last workout
 */
export function getPostExerciseHours(
  currentTime: string,
  workoutTime: string | null
): number | null {
  if (!workoutTime) return null;
  
  const current = new Date(currentTime);
  const workout = new Date(workoutTime);
  const diffMs = current.getTime() - workout.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours;
}

/**
 * Format time from 24h decimal to 12h string
 */
export function formatHourTo12h(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert time string to decimal hour
 */
export function timeStringToHour(timeStr: string): number {
  const date = new Date(timeStr);
  return date.getHours() + date.getMinutes() / 60;
}
